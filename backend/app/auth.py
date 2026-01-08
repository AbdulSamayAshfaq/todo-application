from datetime import timedelta
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, utils, database

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """Get current user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except jwt.JWTError:
        raise credentials_exception

    if username == "admin":
        # Return mock admin user
        return models.User(
            id=1,
            username="admin",
            email="admin@example.com",
            hashed_password="",
            is_active=True
        )

    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    """Login endpoint to get access token"""
    user = utils.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """Create a new user account"""
    # Check if user already exists
    db_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    # Create new user
    hashed_password = utils.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    """Get current user information"""
    return current_user