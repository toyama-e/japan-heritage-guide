from fastapi import FastAPI
from app.api.v1.router import router
from fastapi.staticfiles import StaticFiles

app = FastAPI()


@app.get("/")
def read_root():
    return {"hello": "world"}

app.include_router(router, prefix="/api/v1")

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/badges")
def read_badges():
    pass