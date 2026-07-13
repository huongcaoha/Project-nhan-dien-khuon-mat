from sqlalchemy import Column, Integer, String, Float, ARRAY
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    # Face encoding from face_recognition is a 128-dimensional array of floats
    face_encoding = Column(ARRAY(Float), nullable=False)
