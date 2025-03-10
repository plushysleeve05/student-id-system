from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from backend.db_config import Base
from passlib.context import CryptContext
from typing import Optional
from datetime import datetime

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Hash a password using bcrypt
        """
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash
        """
        return pwd_context.verify(plain_password, hashed_password)

    def update_last_login(self, db_session) -> None:
        """
        Update the last login timestamp
        """
        self.last_login = datetime.utcnow()
        db_session.add(self)
        db_session.commit()

    @classmethod
    def get_by_email(cls, db_session, email: str) -> Optional["User"]:
        """
        Get a user by email
        """
        return db_session.query(cls).filter(cls.email == email).first()

    @classmethod
    def get_by_username(cls, db_session, username: str) -> Optional["User"]:
        """
        Get a user by username
        """
        return db_session.query(cls).filter(cls.username == username).first()

    def __repr__(self) -> str:
        return f"<User {self.username}>"
