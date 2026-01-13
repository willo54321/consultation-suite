from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/consultation_ai"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # API Keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    admin_api_key: str = "dev-admin-key-change-in-production"

    # OpenAI settings
    openai_chat_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-ada-002"
    embedding_dimensions: int = 1536

    # Document processing
    chunk_size: int = 600  # tokens
    chunk_overlap: int = 100  # tokens
    max_chunks_for_context: int = 15

    # Storage
    s3_bucket: Optional[str] = None
    s3_region: Optional[str] = None
    local_storage_path: str = "./uploads"

    # Rate limiting
    rate_limit_messages_per_hour: int = 20

    # Security
    secret_key: str = "change-this-secret-key-in-production"

    # CORS
    allowed_origins: list[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
