from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import LoginRequest, RegisterRequest, AuthResponse, UserResponse
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Verificar se já existe
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já cadastrado com este documento",
        )

    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        type=req.type,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(
        token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
        )

    if user.type != req.type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Este documento não pertence a um {req.type}",
        )

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(
        token=token,
        user=UserResponse.model_validate(user),
    )
