import os
import mimetypes
import requests

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "diary-images")


ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def _safe_ext(filename: str) -> str:
    if not filename:
        return ".jpg"
    dot = filename.rfind(".")
    if dot == -1:
        return ".jpg"
    ext = filename[dot:].lower()
    return ext if ext in ALLOWED_EXT else ".jpg"


def upload_diary_cover_image(*, user_id: int, diary_id: int, filename: str, content: bytes) -> str:
    """
    diaries/{user_id}/{diary_id}/cover.{ext} に上書きアップロード（差し替え）
    """
    ext = _safe_ext(filename)
    path = f"diaries/{user_id}/{diary_id}/cover{ext}"

    # Storage Object API
    # POST /storage/v1/object/{bucket}/{path}
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{path}"

    mime = mimetypes.guess_type(filename)[0] or "application/octet-stream"

    res = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "apikey": SERVICE_ROLE_KEY,
            "Content-Type": mime,
            "x-upsert": "true",  # ✅ 同じパスに上書き
        },
        data=content,
        timeout=30,
    )

    if not res.ok:
        raise RuntimeError(f"Storage upload failed: {res.status_code} {res.text}")

    # public バケット前提：public URL を返す
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{path}"
    return public_url
