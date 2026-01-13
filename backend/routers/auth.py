"""
Authentication Router
Handles user login, registration, and JWT token management
"""

from datetime import datetime, timedelta
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import bcrypt
import jwt

from database import get_db, User
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = settings.secret_key or "consultation-suite-secret-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


# ============================================================================
# Pydantic Models
# ============================================================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# ============================================================================
# Helper Functions
# ============================================================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(user_id: str, email: str, role: str) -> str:
    """Create a JWT access token."""
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ============================================================================
# Dependencies
# ============================================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT token."""
    token = credentials.credentials
    payload = decode_token(token)

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="User is inactive")

    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require the current user to be an admin."""
    if current_user.role not in ["super_admin", "account_manager"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get the current user if authenticated, otherwise return None."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


# ============================================================================
# Routes
# ============================================================================

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        id=uuid.uuid4(),
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        name=data.name,
        role="member"  # Default role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token(str(user.id), user.email, user.role)

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token."""
    user = db.query(User).filter(User.email == data.email.lower()).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is inactive")

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Generate token
    token = create_access_token(str(user.id), user.email, user.role)

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )


@router.put("/me", response_model=UserResponse)
async def update_me(
    name: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    if name:
        current_user.name = name
        db.commit()
        db.refresh(current_user)

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )


@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password."""
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = hash_password(data.new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token."""
    token = create_access_token(str(current_user.id), current_user.email, current_user.role)

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(current_user.id),
            email=current_user.email,
            name=current_user.name,
            role=current_user.role,
            is_active=current_user.is_active,
            created_at=current_user.created_at
        )
    )
