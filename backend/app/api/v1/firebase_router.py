from fastapi import APIRouter, Depends

from app.core.firebase_auth import verify_firebase_token

router = APIRouter()


@router.get("/auth-test")
def auth_test(decoded_token: dict = Depends(verify_firebase_token)):
    return {
        "uid": decoded_token["uid"],
        "email": decoded_token.get("email"),
    }
