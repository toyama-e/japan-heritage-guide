from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router

app = FastAPI()

# ===== CORS設定（ここから） =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ===== CORS設定（ここまで） =====

@app.get("/")
def read_root():
    return {"hello": "world"}

app.include_router(router, prefix="/api/v1")
