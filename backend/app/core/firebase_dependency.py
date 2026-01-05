from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.crud.user import get_or_create_user

def get_current_user(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    return get_or_create_user(
        db=db,
        firebase_uid=decoded_token["uid"],
        email=decoded_token.get("email"),
    )
