import uuid
import re
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import Chunk, ManualQA
from services.embeddings import generate_embedding
from config import get_settings

settings = get_settings()

# Query expansion for common consultation terms
# Each word that users might type should be a KEY with related terms as VALUES
QUERY_EXPANSIONS = {
    # Time/date terms
    "close": ["closing", "deadline", "end", "until", "open until", "closes", "finish"],
    "closing": ["close", "deadline", "end", "until", "open until", "finish"],
    "deadline": ["close", "closing", "end", "until", "open until", "finish"],
    "start": ["begin", "starting", "launch", "opens", "commence"],
    "when": ["date", "time", "deadline", "close", "open", "until"],
    "date": ["when", "deadline", "close", "open", "until", "january", "february"],
    # Housing terms
    "homes": ["houses", "properties", "dwellings", "units", "housing", "residential"],
    "houses": ["homes", "properties", "dwellings", "units", "housing", "residential"],
    "housing": ["homes", "houses", "properties", "dwellings", "units", "residential"],
    "affordable": ["social", "rent", "shared ownership", "low cost", "housing association"],
    "rent": ["affordable", "social housing", "shared ownership", "tenants"],
    # Transport terms - add all variants as keys
    "traffic": ["transport", "roads", "congestion", "highways", "vehicles", "cars", "junction"],
    "transport": ["traffic", "roads", "bus", "train", "cycling", "walking", "highways"],
    "roads": ["traffic", "transport", "highways", "congestion", "vehicles", "junction", "access"],
    "cars": ["traffic", "parking", "vehicles", "congestion", "roads"],
    "parking": ["cars", "vehicles", "spaces", "traffic"],
    "bus": ["transport", "public transport", "services", "routes"],
    "cycling": ["transport", "bikes", "cycle paths", "walking"],
    # S106 and infrastructure terms
    "s106": ["section 106", "contributions", "infrastructure", "community benefits", "developer contributions"],
    "106": ["s106", "section 106", "contributions", "infrastructure", "developer"],
    "contributions": ["s106", "section 106", "funding", "investment", "payment", "developer"],
    "infrastructure": ["s106", "facilities", "services", "community", "investment"],
    "funding": ["contributions", "s106", "money", "investment", "payment"],
    "money": ["funding", "contributions", "cost", "investment", "payment", "s106"],
    # Education terms - add all variants
    "schools": ["education", "primary", "secondary", "pupil", "school places", "children"],
    "school": ["schools", "education", "primary", "secondary", "pupil", "children"],
    "education": ["schools", "primary", "secondary", "pupil", "school places", "learning"],
    "children": ["schools", "education", "pupils", "families", "young people"],
    "primary": ["schools", "education", "children", "pupils"],
    "secondary": ["schools", "education", "children", "pupils"],
    # Health terms - add all variants as keys
    "healthcare": ["health", "gp", "medical", "nhs", "doctors", "surgery"],
    "health": ["healthcare", "gp", "medical", "nhs", "doctors", "surgery", "hospital"],
    "gp": ["doctors", "surgery", "healthcare", "medical", "health", "nhs"],
    "doctors": ["gp", "surgery", "healthcare", "medical", "health", "nhs"],
    "surgery": ["gp", "doctors", "healthcare", "medical", "health"],
    "hospital": ["healthcare", "health", "medical", "nhs"],
    "nhs": ["healthcare", "health", "gp", "doctors", "medical"],
    # Environment terms - add all variants as keys
    "environment": ["wildlife", "ecology", "biodiversity", "nature", "green", "trees"],
    "wildlife": ["ecology", "biodiversity", "nature", "animals", "habitats", "species"],
    "animals": ["wildlife", "ecology", "species", "habitats", "biodiversity", "nature"],
    "ecology": ["wildlife", "biodiversity", "nature", "animals", "habitats", "environment"],
    "nature": ["wildlife", "ecology", "biodiversity", "animals", "green", "trees"],
    "trees": ["nature", "green", "environment", "woodland", "hedgerows"],
    "green": ["nature", "trees", "environment", "open space", "parks"],
    # Flooding/drainage - add variants
    "flooding": ["drainage", "water", "flood risk", "surface water", "suds"],
    "flood": ["flooding", "drainage", "water", "flood risk", "surface water"],
    "drainage": ["flooding", "water", "sewage", "suds", "surface water"],
    "water": ["flooding", "drainage", "flood risk", "surface water", "sewage"],
    # Cost/money terms
    "cost": ["price", "affordable", "expensive", "budget", "money", "funding"],
    "price": ["cost", "affordable", "expensive", "budget", "money"],
    # Location terms
    "where": ["location", "site", "land", "area", "hookwood", "reigate"],
    "location": ["where", "site", "land", "area", "address"],
    "site": ["location", "land", "area", "where", "development"],
    # General planning terms
    "objection": ["concern", "oppose", "against", "object", "complaint", "issue"],
    "concern": ["objection", "issue", "problem", "worry", "oppose"],
    "support": ["favour", "favor", "agree", "positive", "benefit"],
    "feedback": ["comment", "response", "view", "opinion", "consultation"],
    "comment": ["feedback", "response", "view", "opinion", "have your say"],
    # Common question words
    "what": ["tell me", "explain", "describe", "information"],
    "why": ["reason", "because", "purpose", "benefit"],
    "how": ["way", "method", "process", "will"],
}


def extract_keywords(query: str) -> List[str]:
    """Extract important keywords from query and expand with synonyms."""
    # Clean and split query
    words = re.findall(r'\b\w+\b', query.lower())

    # Remove stop words
    stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'will', 'be', 'been',
                  'do', 'does', 'did', 'have', 'has', 'had', 'can', 'could', 'would',
                  'should', 'may', 'might', 'must', 'shall', 'this', 'that', 'these',
                  'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
                  'who', 'whom', 'when', 'where', 'why', 'how', 'there', 'here', 'about',
                  'for', 'with', 'on', 'in', 'at', 'to', 'of', 'and', 'or', 'but'}

    keywords = [w for w in words if w not in stop_words and len(w) > 2]

    # Expand with synonyms
    expanded = set(keywords)
    for word in keywords:
        if word in QUERY_EXPANSIONS:
            expanded.update(QUERY_EXPANSIONS[word])

    return list(expanded)


def calculate_keyword_boost(content: str, keywords: List[str]) -> float:
    """Calculate a boost score based on keyword matches in content."""
    if not keywords:
        return 0.0

    content_lower = content.lower()
    matches = sum(1 for kw in keywords if kw in content_lower)

    # Return a boost between 0 and 0.25 based on keyword matches
    # Higher boost = keywords matter more relative to semantic similarity
    return min(matches / len(keywords) * 0.25, 0.25)


def keyword_search_chunks(
    db: Session,
    project_id: uuid.UUID,
    keywords: List[str],
    limit: int = 20,
) -> List[Chunk]:
    """Search for chunks containing specific keywords using SQL ILIKE."""
    if not keywords:
        return []

    # Build OR conditions for each keyword
    conditions = " OR ".join([f"content ILIKE :kw{i}" for i in range(len(keywords))])
    params = {f"kw{i}": f"%{kw}%" for i, kw in enumerate(keywords)}
    params["project_id"] = str(project_id)
    params["limit"] = limit

    sql = text(f"""
        SELECT id FROM chunks
        WHERE project_id = :project_id AND ({conditions})
        LIMIT :limit
    """)

    result = db.execute(sql, params)
    chunk_ids = [row.id for row in result]

    chunks = db.query(Chunk).filter(Chunk.id.in_(chunk_ids)).all() if chunk_ids else []
    return chunks


def retrieve_relevant_chunks(
    db: Session,
    project_id: uuid.UUID,
    query: str,
    top_k: int = None,
    content_type_filter: Optional[str] = None,
) -> List[Tuple[Chunk, float]]:
    """
    Retrieve the most relevant chunks using hybrid search (semantic + keyword).
    Returns list of (chunk, similarity_score) tuples.
    """
    if top_k is None:
        top_k = settings.max_chunks_for_context

    # Extract keywords for hybrid search (includes synonym expansion)
    keywords = extract_keywords(query)
    print(f"[RETRIEVAL] Query: {query[:50]}..., keywords: {keywords}", flush=True)

    # Always do keyword search alongside semantic search for robust retrieval
    # This ensures we find content with specific terms that semantic search might miss
    keyword_chunks = []
    if keywords:
        keyword_chunks = keyword_search_chunks(db, project_id, keywords, limit=50)
        print(f"[RETRIEVAL] Keyword search: found {len(keyword_chunks)} chunks matching: {keywords[:5]}...", flush=True)

    # Generate embedding for the query
    query_embedding = generate_embedding(query)

    # Fetch more candidates than needed for re-ranking
    # With large knowledge bases, we need more candidates for keyword boosting to work
    candidate_count = min(top_k * 10, 150)

    # Build the SQL query for pgvector similarity search
    sql = text("""
        SELECT
            id,
            content,
            document_id,
            page_number,
            chunk_index,
            token_count,
            chunk_metadata,
            source_type,
            source_url,
            1 - (embedding <=> CAST(:query_embedding AS vector)) as similarity
        FROM chunks
        WHERE project_id = :project_id
        ORDER BY embedding <=> CAST(:query_embedding AS vector)
        LIMIT :candidate_count
    """)

    embedding_str = str(query_embedding)
    print(f"[RETRIEVAL] Project ID: {project_id}, fetching {candidate_count} candidates", flush=True)

    result = db.execute(
        sql,
        {
            "query_embedding": embedding_str,
            "project_id": str(project_id),
            "candidate_count": candidate_count,
        },
    )

    # Re-rank with keyword boosting
    candidates = []
    seen_ids = set()

    for row in result:
        chunk = db.query(Chunk).filter(Chunk.id == row.id).first()
        if chunk and chunk.id not in seen_ids:
            seen_ids.add(chunk.id)
            # Apply content type filter if specified
            if content_type_filter:
                metadata = chunk.chunk_metadata or {}
                if metadata.get("content_type") != content_type_filter:
                    continue

            # Calculate hybrid score: semantic similarity + keyword boost
            keyword_boost = calculate_keyword_boost(chunk.content, keywords)
            hybrid_score = row.similarity + keyword_boost
            candidates.append((chunk, hybrid_score, row.similarity, keyword_boost))

    # Add keyword-found chunks that weren't in semantic results
    # Give them a base semantic score of 0.7 (decent relevance)
    for chunk in keyword_chunks:
        if chunk.id not in seen_ids:
            seen_ids.add(chunk.id)
            if content_type_filter:
                metadata = chunk.chunk_metadata or {}
                if metadata.get("content_type") != content_type_filter:
                    continue

            keyword_boost = calculate_keyword_boost(chunk.content, keywords)
            base_score = 0.7
            hybrid_score = base_score + keyword_boost + 0.1  # Extra boost for keyword-found chunks
            candidates.append((chunk, hybrid_score, base_score, keyword_boost))
            print(f"[RETRIEVAL] Added keyword chunk {chunk.id}: hybrid={hybrid_score:.4f}", flush=True)

    # Sort by hybrid score and take top_k
    candidates.sort(key=lambda x: x[1], reverse=True)
    top_candidates = candidates[:top_k]

    # Log the re-ranking results
    print(f"[RETRIEVAL] Re-ranked {len(candidates)} candidates, returning {len(top_candidates)}", flush=True)
    for chunk, hybrid, semantic, boost in top_candidates[:5]:
        print(f"[RETRIEVAL] Chunk {chunk.id}: hybrid={hybrid:.4f} (semantic={semantic:.4f} + boost={boost:.4f})", flush=True)

    # Return in expected format
    return [(chunk, hybrid_score) for chunk, hybrid_score, _, _ in top_candidates]


def check_manual_qa_match(
    db: Session,
    project_id: uuid.UUID,
    query: str,
    similarity_threshold: float = 0.25,  # Lower threshold - just need 2+ keywords
) -> Optional[ManualQA]:
    """
    Check if there's a manual Q&A that matches the query.
    Uses keyword matching and returns the highest priority match.
    """
    query_lower = query.lower()
    query_words = set(query_lower.split())

    print(f"[MANUAL_QA] Checking query: {query_lower}", flush=True)

    # Get all active manual Q&As for the project
    manual_qas = (
        db.query(ManualQA)
        .filter(ManualQA.project_id == project_id, ManualQA.active == True)
        .order_by(ManualQA.priority.desc())
        .all()
    )

    print(f"[MANUAL_QA] Found {len(manual_qas)} active Q&As", flush=True)

    best_match = None
    best_score = 0

    for qa in manual_qas:
        # Check keyword matches
        if qa.keywords:
            matched_keywords = [kw for kw in qa.keywords if kw.lower() in query_lower]
            keyword_matches = len(matched_keywords)
            if keyword_matches > 0:
                # Score: at least 2 keyword matches = good match
                score = keyword_matches / len(qa.keywords)
                print(f"[MANUAL_QA] Q: '{qa.question[:30]}...' matched {keyword_matches}/{len(qa.keywords)} keywords: {matched_keywords}, score={score:.2f}", flush=True)
                if score > best_score:
                    best_score = score
                    best_match = qa

        # Also check if query is similar to the stored question
        qa_words = set(qa.question.lower().split())
        common_words = query_words & qa_words
        if len(common_words) >= 2:  # At least 2 common words
            word_score = len(common_words) / max(len(query_words), len(qa_words))
            print(f"[MANUAL_QA] Q: '{qa.question[:30]}...' word match: {common_words}, score={word_score:.2f}", flush=True)
            if word_score > best_score:
                best_score = word_score
                best_match = qa

    print(f"[MANUAL_QA] Best score: {best_score:.2f}, threshold: {similarity_threshold}", flush=True)

    # Only return if we have a decent match
    if best_score >= similarity_threshold:
        print(f"[MANUAL_QA] MATCHED: {best_match.question}", flush=True)
        return best_match

    print(f"[MANUAL_QA] No match found", flush=True)
    return None


def build_context_from_chunks(
    chunks: List[Tuple[Chunk, float]],
    max_tokens: int = 4000,
) -> str:
    """Build context string from retrieved chunks, respecting token limit."""
    context_parts = []
    total_tokens = 0

    for chunk, score in chunks:
        if total_tokens + chunk.token_count > max_tokens:
            break

        # Add source info
        metadata = chunk.chunk_metadata or {}
        source = metadata.get("source_file") or metadata.get("source_name", "Document")

        if chunk.page_number:
            source_info = f"[Source: {source}, Page {chunk.page_number}]"
        else:
            source_info = f"[Source: {source}]"

        context_parts.append(f"{source_info}\n{chunk.content}")
        total_tokens += chunk.token_count

    return "\n\n---\n\n".join(context_parts)
