from fastapi import FastAPI
from app.api import router

app = FastAPI(
    title="Reader Python API",
    description="电子书阅读平台后端服务",
    version="0.1.0",
)

app.include_router(router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok"}