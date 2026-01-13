import re
from typing import List, Tuple


def count_tokens(text: str, model: str = "gpt-4") -> int:
    """Estimate token count (roughly 4 chars per token)."""
    return len(text) // 4


def clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    # Replace multiple whitespace with single space
    text = re.sub(r"\s+", " ", text)

    # Remove control characters except newlines
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", text)

    # Normalize unicode
    text = text.encode("utf-8", errors="ignore").decode("utf-8")

    # Remove excessive newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def split_into_chunks(
    text: str,
    chunk_size: int = 600,
    chunk_overlap: int = 100,
    min_chunk_size: int = 50,
) -> List[Tuple[str, int]]:
    """
    Split text into overlapping chunks.
    Uses character-based splitting (4 chars ~ 1 token) for memory efficiency.
    Returns list of (chunk_text, token_count) tuples.
    """
    print(f"[SPLIT] Starting split: text_len={len(text)}, chunk_size={chunk_size}, overlap={chunk_overlap}", flush=True)

    char_chunk_size = chunk_size * 4
    char_overlap = chunk_overlap * 4

    chunks = []
    start = 0
    iteration = 0

    while start < len(text):
        iteration += 1
        if iteration > 1000:
            print(f"[SPLIT] Too many iterations, breaking", flush=True)
            break

        end = min(start + char_chunk_size, len(text))

        if end < len(text):
            chunk_text = text[start:end]
            for break_char in [". ", ".\n", "? ", "?\n", "! ", "!\n"]:
                last_break = chunk_text.rfind(break_char)
                if last_break > len(chunk_text) * 0.5:
                    end = start + last_break + 1
                    break

        chunk_text = text[start:end].strip()

        if len(chunk_text) >= min_chunk_size * 4:
            estimated_tokens = len(chunk_text) // 4
            chunks.append((chunk_text, estimated_tokens))

        new_start = end - char_overlap
        if new_start <= start:
            new_start = start + 1
        start = new_start
        if start >= len(text):
            break

    print(f"[SPLIT] Complete: {len(chunks)} chunks in {iteration} iterations", flush=True)
    return chunks


def _split_by_characters(
    text: str, chunk_size: int, overlap: int
) -> List[Tuple[str, int]]:
    """Fallback character-based splitting."""
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()

        if len(chunk) >= 50:
            # Estimate token count (roughly 4 chars per token)
            estimated_tokens = len(chunk) // 4
            chunks.append((chunk, estimated_tokens))

        start = end - overlap

    return chunks


def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
    """Extract potential keywords from text."""
    # Simple keyword extraction - remove common words
    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
        "being", "have", "has", "had", "do", "does", "did", "will", "would",
        "could", "should", "may", "might", "must", "shall", "can", "this",
        "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
        "what", "which", "who", "when", "where", "why", "how", "all", "each",
        "every", "both", "few", "more", "most", "other", "some", "such", "no",
        "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    }

    # Extract words
    words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())

    # Filter and count
    word_counts = {}
    for word in words:
        if word not in stop_words:
            word_counts[word] = word_counts.get(word, 0) + 1

    # Sort by frequency and return top keywords
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    return [word for word, count in sorted_words[:max_keywords]]


def sanitize_user_input(text: str) -> str:
    """Sanitize user input to prevent prompt injection."""
    # Remove any markdown code blocks
    text = re.sub(r"```[\s\S]*?```", "", text)
    text = re.sub(r"`[^`]*`", "", text)

    # Remove potential system/instruction markers
    patterns_to_remove = [
        r"\[SYSTEM\].*?\[/SYSTEM\]",
        r"\[INST\].*?\[/INST\]",
        r"<<SYS>>.*?<</SYS>>",
        r"<\|im_start\|>.*?<\|im_end\|>",
        r"Human:.*?Assistant:",
    ]
    for pattern in patterns_to_remove:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE | re.DOTALL)

    # Limit length
    text = text[:2000]

    return text.strip()
