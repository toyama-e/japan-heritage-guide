from fastapi import FastAPI
from app.api.v1.router import router as api_v1_router
from fastapi.staticfiles import StaticFiles

app = FastAPI()
# API をまとめて /api/v1 配下にする
app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"hello": "world"}

# 静的ファイル配信（画像など）
app.mount("/static", StaticFiles(directory="app/static"), name="static")
