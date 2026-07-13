import face_recognition
import numpy as np
import cv2

def get_face_encoding(image_bytes: bytes):
    """
    Takes image bytes, decodes it, and returns the first face encoding found.
    Raises ValueError if no faces or multiple faces are found.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Invalid image file")
    
    # Convert image from BGR (OpenCV default) to RGB (face_recognition requirement)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Detect faces
    face_locations = face_recognition.face_locations(rgb_image)
    if len(face_locations) == 0:
        raise ValueError("No face detected in the image.")
    if len(face_locations) > 1:
        raise ValueError("Multiple faces detected. Please upload an image with only one face.")
        
    # Get encoding
    encodings = face_recognition.face_encodings(rgb_image, face_locations)
    return encodings[0].tolist()

def compare_faces(known_encoding: list, unknown_encoding: list, tolerance=0.5):
    """
    Compares two face encodings and returns True if they match.
    """
    known_np = np.array(known_encoding)
    unknown_np = np.array(unknown_encoding)
    
    results = face_recognition.compare_faces([known_np], unknown_np, tolerance=tolerance)
    return bool(results[0])

def find_best_match(known_encodings: list, unknown_encoding: list, tolerance=0.5):
    """
    Given a list of known encodings, find the best match (minimum distance) 
    that is within the tolerance. Returns the index of the best match or None.
    """
    if not known_encodings:
        return None
        
    known_np = np.array(known_encodings)
    unknown_np = np.array(unknown_encoding)
    
    # Calculate euclidean distance between the unknown face and all known faces
    distances = face_recognition.face_distance(known_np, unknown_np)
    
    # Get the index of the face with the minimum distance
    best_match_index = np.argmin(distances)
    
    # Check if the best match is within the tolerance
    if distances[best_match_index] <= tolerance:
        return best_match_index
        
    return None
