from typing import List
import openai
from config import get_settings

settings = get_settings()

# Initialize OpenAI client
client = openai.OpenAI(api_key=settings.openai_api_key)


def generate_embedding(text: str) -> List[float]:
    """Generate embedding for a single text using OpenAI."""
    response = client.embeddings.create(
        model=settings.embedding_model,
        input=text,
    )
    return response.data[0].embedding


def generate_embeddings_batch(texts: List[str], batch_size: int = 5) -> List[List[float]]:
    """Generate embeddings for multiple texts in batches."""
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = client.embeddings.create(
            model=settings.embedding_model,
            input=batch,
        )
        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)

    return all_embeddings
