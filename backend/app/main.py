from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router as api_v1_router
from fastapi.staticfiles import StaticFiles
from app.core.firebase_admin import init_firebase_admin
from app.api.v1.firebase_router import router as firebase_router
from app.api.v1.me_router import router as me_router

app = FastAPI()

# ===== CORS設定 =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Firebase Admin 初期化 =====
@app.on_event("startup")
def startup_event():
    init_firebase_admin()
    print ("🔥Firebase Admin初期化OK")

# ===== API ルーティング =====
app.include_router(api_v1_router, prefix="/api/v1")

# ===== 静的ファイル配信 =====
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
def read_root():
    return {"hello": "world"}


#app.include_router(router, prefix="/api/v1")
