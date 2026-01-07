from fastapi import HTTPException, status, Header
from firebase_admin import auth


def verify_firebase_token(authorization: str = Header(...)):
    """
    Authorization: Bearer <Firebase ID Token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format",
        )

    token = authorization.replace("Bearer ", "")

    try:
        decoded_token = auth.verify_id_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
        )

    return decoded_token
