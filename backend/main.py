from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import schemas, models, database, face_utils

# Create DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Face Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "supersecretkey_please_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/api/register", response_model=schemas.UserResponse)
async def register(
    username: str = Form(...),
    full_name: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    # Read image
    image_bytes = await file.read()
    
    # Get face encoding
    try:
        encoding = face_utils.get_face_encoding(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # Create user
    new_user = models.User(
        username=username,
        full_name=full_name,
        face_encoding=encoding
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.post("/api/login", response_model=schemas.Token)
async def login(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    image_bytes = await file.read()
    
    # Get face encoding from uploaded image
    try:
        login_encoding = face_utils.get_face_encoding(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # Find matching user in DB
    users = db.query(models.User).all()
    if users:
        known_encodings = [user.face_encoding for user in users]
        best_match_index = face_utils.find_best_match(known_encodings, login_encoding)
        
        if best_match_index is not None:
            # Match found!
            matched_user = users[int(best_match_index)]
            access_token = create_access_token(data={"sub": matched_user.username})
            return {"access_token": access_token, "token_type": "bearer", "user": matched_user}
            
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Face not recognized or user not registered",
    )

@app.get("/api/me", response_model=schemas.UserResponse)
async def get_me(token: str, db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
