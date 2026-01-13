from fastapi import HTTPException, Security, Depends
from fastapi.security import APIKeyHeader
from config import get_settings

settings = get_settings()

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_admin_api_key(api_key: str = Security(api_key_header)) -> str:
    """Verify admin API key for protected endpoints. DISABLED FOR DEV."""
    # API key check disabled for development
    return api_key or "dev"


def hash_ip(ip_address: str) -> str:
    """Hash IP address for privacy-preserving analytics."""
    import hashlib

    # Add a salt for extra privacy
    salted = f"{ip_address}:{settings.secret_key}"
    return hashlib.sha256(salted.encode()).hexdigest()[:16]
