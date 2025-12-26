from fastapi import FastAPI
from app.api.v1.router import router

app = FastAPI()


@app.get("/")
def read_root():
    return {"hello": "world"}

app.include_router(router, prefix="/api/v1")
