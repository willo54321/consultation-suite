import uuid
import asyncio
from typing import Tuple, Optional, Set, List
from urllib.parse import urlparse, urljoin
import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

from database import Chunk
from services.embeddings import generate_embeddings_batch
from utils.text_processing import clean_text, split_into_chunks
from config import get_settings

settings = get_settings()

# Global playwright browser instance for reuse
_playwright = None
_browser = None


async def get_browser():
    """Get or create a shared browser instance."""
    global _playwright, _browser
    if _browser is None:
        _playwright = await async_playwright().start()
        _browser = await _playwright.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
    return _browser


async def fetch_rendered_page(url: str, wait_for_selector: str = None) -> Tuple[str, str]:
    """
    Fetch a page using Playwright to render JavaScript.

    Returns:
        - html: The rendered HTML content
        - title: The page title
    """
    browser = await get_browser()
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    page = await context.new_page()

    try:
        # Navigate with longer timeout for JS-heavy pages
        await page.goto(url, wait_until='networkidle', timeout=30000)

        # Wait a bit extra for any lazy-loaded content
        await page.wait_for_timeout(2000)

        # If a specific selector is provided, wait for it
        if wait_for_selector:
            try:
                await page.wait_for_selector(wait_for_selector, timeout=5000)
            except PlaywrightTimeout:
                pass  # Continue even if selector not found

        # Get the rendered HTML
        html = await page.content()
        title = await page.title()

        return html, title
    finally:
        await context.close()


async def crawl_site(
    db: Session,
    project_id: uuid.UUID,
    start_url: str,
    content_type: str = "public",
    tags: list = None,
    max_pages: int = 50,
) -> Tuple[bool, Optional[str], int, int]:
    """
    Crawl an entire website starting from the given URL.
    Discovers and scrapes all internal pages.

    Returns:
        - success: Whether crawling succeeded
        - error: Error message if failed
        - pages_scraped: Number of pages successfully scraped
        - total_chunks: Total number of chunks created
    """
    parsed_start = urlparse(start_url)
    base_domain = parsed_start.netloc
    base_scheme = parsed_start.scheme or "https"

    visited: Set[str] = set()
    to_visit: List[str] = [start_url]
    pages_scraped = 0
    total_chunks = 0
    errors = []

    print(f"[CRAWLER] Starting crawl of {base_domain}, max {max_pages} pages", flush=True)

    while to_visit and pages_scraped < max_pages:
        url = to_visit.pop(0)

        # Normalize URL
        url = normalize_url(url)

        if url in visited:
            continue

        visited.add(url)

        # Only crawl same domain
        parsed = urlparse(url)
        if parsed.netloc != base_domain:
            continue

        # Skip non-HTML resources
        if should_skip_url(url):
            continue

        print(f"[CRAWLER] Scraping ({pages_scraped + 1}/{max_pages}): {url}", flush=True)

        try:
            # Use Playwright to render JavaScript
            html, page_title = await fetch_rendered_page(url)

            soup = BeautifulSoup(html, "lxml")

            # Discover new links
            new_links = extract_internal_links(soup, url, base_domain, base_scheme)
            for link in new_links:
                if link not in visited and link not in to_visit:
                    to_visit.append(link)

            # Remove unwanted elements
            for element in soup(["script", "style", "nav", "header", "footer", "aside", "noscript"]):
                element.decompose()

            # Extract text
            text = soup.get_text(separator="\n", strip=True)

            if not text or len(text) < 100:
                continue

            # Clean and chunk
            cleaned_text = clean_text(text)
            chunks = split_into_chunks(
                cleaned_text,
                chunk_size=settings.chunk_size,
                chunk_overlap=settings.chunk_overlap,
            )

            if not chunks:
                continue

            # Generate embeddings
            chunk_texts = [chunk[0] for chunk in chunks]
            embeddings = generate_embeddings_batch(chunk_texts)

            # Use title from Playwright or fallback
            title = page_title or soup.title.string if soup.title else parsed.path or url

            # Store chunks
            for idx, ((chunk_text, token_count), embedding) in enumerate(
                zip(chunks, embeddings)
            ):
                chunk = Chunk(
                    id=uuid.uuid4(),
                    project_id=project_id,
                    content=chunk_text,
                    chunk_index=idx,
                    token_count=token_count,
                    embedding=embedding,
                    chunk_metadata={
                        "source_name": title,
                        "source_url": url,
                        "content_type": content_type,
                        "tags": tags or [],
                    },
                    source_type="url",
                    source_url=url,
                )
                db.add(chunk)

            total_chunks += len(chunks)
            pages_scraped += 1

            # Commit periodically
            if pages_scraped % 5 == 0:
                db.commit()
                print(f"[CRAWLER] Progress: {pages_scraped} pages, {total_chunks} chunks", flush=True)

            # Rate limiting - be polite
            await asyncio.sleep(1.0)

        except PlaywrightTimeout:
            errors.append(f"{url}: Page load timeout")
        except Exception as e:
            errors.append(f"{url}: {str(e)}")

    # Final commit
    db.commit()

    print(f"[CRAWLER] Complete: {pages_scraped} pages, {total_chunks} chunks", flush=True)
    if errors:
        print(f"[CRAWLER] Errors: {len(errors)}", flush=True)

    error_msg = f"{len(errors)} pages failed" if errors else None
    return True, error_msg, pages_scraped, total_chunks


def normalize_url(url: str) -> str:
    """Normalize URL by removing fragments and trailing slashes."""
    parsed = urlparse(url)
    # Remove fragment
    normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    # Remove trailing slash (except for root)
    if normalized.endswith("/") and parsed.path != "/":
        normalized = normalized[:-1]
    # Add query string if present
    if parsed.query:
        normalized += f"?{parsed.query}"
    return normalized


def should_skip_url(url: str) -> bool:
    """Check if URL should be skipped (non-HTML resources)."""
    skip_extensions = (
        ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico",
        ".css", ".js", ".xml", ".json", ".zip", ".tar", ".gz",
        ".mp3", ".mp4", ".avi", ".mov", ".doc", ".docx", ".xls", ".xlsx"
    )
    parsed = urlparse(url)
    return parsed.path.lower().endswith(skip_extensions)


def extract_internal_links(soup: BeautifulSoup, current_url: str, base_domain: str, base_scheme: str) -> List[str]:
    """Extract all internal links from a page."""
    links = []
    for anchor in soup.find_all("a", href=True):
        href = anchor["href"]

        # Skip empty, javascript, mailto, tel links
        if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
            continue

        # Convert relative URLs to absolute
        absolute_url = urljoin(current_url, href)
        parsed = urlparse(absolute_url)

        # Only include same-domain links
        if parsed.netloc == base_domain:
            # Normalize and add
            normalized = normalize_url(absolute_url)
            if normalized not in links:
                links.append(normalized)

    return links


async def scrape_url(
    db: Session,
    project_id: uuid.UUID,
    url: str,
    content_type: str = "public",
    tags: list = None,
) -> Tuple[bool, Optional[str], int]:
    """
    Scrape content from a URL and add it to the knowledge base.

    Returns:
        - success: Whether scraping succeeded
        - error: Error message if failed
        - chunk_count: Number of chunks created
    """
    try:
        # Validate URL
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return False, "Invalid URL format", 0

        print(f"[SCRAPER] Fetching URL with Playwright: {url}", flush=True)

        # Use Playwright to render JavaScript
        html, page_title = await fetch_rendered_page(url)

        # Parse HTML
        soup = BeautifulSoup(html, "lxml")

        # Remove script and style elements
        for element in soup(["script", "style", "nav", "header", "footer", "aside", "noscript"]):
            element.decompose()

        # Extract text content
        text = soup.get_text(separator="\n", strip=True)

        print(f"[SCRAPER] Extracted {len(text)} characters of text", flush=True)

        if not text or len(text) < 100:
            return False, "Page contains insufficient text content", 0

        # Clean the text
        cleaned_text = clean_text(text)

        # Split into chunks
        chunks = split_into_chunks(
            cleaned_text,
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
        )

        if not chunks:
            return False, "Failed to create chunks from content", 0

        # Generate embeddings
        chunk_texts = [chunk[0] for chunk in chunks]
        embeddings = generate_embeddings_batch(chunk_texts)

        # Use title from Playwright or fallback
        title = page_title or (soup.title.string if soup.title else urlparse(url).path)

        # Store chunks
        for idx, ((chunk_text, token_count), embedding) in enumerate(
            zip(chunks, embeddings)
        ):
            chunk = Chunk(
                id=uuid.uuid4(),
                project_id=project_id,
                content=chunk_text,
                chunk_index=idx,
                token_count=token_count,
                embedding=embedding,
                chunk_metadata={
                    "source_name": title,
                    "content_type": content_type,
                    "tags": tags or [],
                },
                source_type="url",
                source_url=url,
            )
            db.add(chunk)

        db.commit()
        return True, None, len(chunks)

    except PlaywrightTimeout:
        return False, "Page load timed out - the page may be too slow or unresponsive", 0
    except Exception as e:
        print(f"[SCRAPER] Error: {str(e)}", flush=True)
        return False, f"Scraping error: {str(e)}", 0
