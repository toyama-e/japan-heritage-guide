from fastapi import FastAPI
from app.api.v1.router import router
from fastapi.staticfiles import StaticFiles
from app.core.firebase_admin import init_firebase_admin
from app.api.v1.firebase_router import router as firebase_router

app = FastAPI()


@app.on_event("startup")
def startup_event():
    init_firebase_admin()
    print ("🔥Firebase Admin初期化OK")


@app.get("/")
def read_root():
    return {"hello": "world"}


@app.get("/badges")
def read_badges():
    pass


app.include_router(router, prefix="/api/v1")
app.include_router(firebase_router, prefix="/api/v1")
app.mount("/static", StaticFiles(directory="app/static"), name="static")