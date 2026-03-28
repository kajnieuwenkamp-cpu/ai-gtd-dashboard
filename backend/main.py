from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import tasks, ai

app = FastAPI(
    title="AI GTD Dashboard API",
    description="Backend voor het AI-aangedreven GTD Dashboard",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "AI GTD Dashboard API draait"}


@app.get("/health")
def health():
    return {"status": "healthy"}
