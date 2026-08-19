from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import containers
import cpu
import gpu
from models import DashboardSummary, DockerSnapshot, GPUSnapshot, SystemStats

MIN_STREAM_INTERVAL_SECONDS = 0.5
DEFAULT_STREAM_INTERVAL_SECONDS = 2.0


@asynccontextmanager
async def lifespan(app: FastAPI):
    cpu.prime()
    gpu.initialize()  # no-op snapshot reports unavailable if there's no NVIDIA GPU/driver
    containers.initialize()  # no-op snapshot reports unavailable if the Docker daemon isn't reachable
    yield
    gpu.shutdown()
    containers.shutdown()


app = FastAPI(title="Unified Dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http://localhost(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_summary() -> DashboardSummary:
    system, gpu_snapshot, docker_snapshot = await asyncio.gather(
        asyncio.to_thread(cpu.get_system_stats),
        asyncio.to_thread(gpu.get_gpu_snapshot),
        asyncio.to_thread(containers.get_docker_snapshot),
    )
    return DashboardSummary(system=system, gpu=gpu_snapshot, docker=docker_snapshot)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/system", response_model=SystemStats)
def system_stats() -> SystemStats:
    return cpu.get_system_stats()


@app.get("/api/gpu", response_model=GPUSnapshot)
def gpu_stats() -> GPUSnapshot:
    return gpu.get_gpu_snapshot()


@app.get("/api/docker/containers", response_model=DockerSnapshot)
def docker_containers() -> DockerSnapshot:
    return containers.get_docker_snapshot()


@app.get("/api/summary", response_model=DashboardSummary)
async def summary() -> DashboardSummary:
    return await get_summary()


@app.websocket("/ws/summary")
async def stream_summary(websocket: WebSocket, interval: float = DEFAULT_STREAM_INTERVAL_SECONDS) -> None:
    interval = max(interval, MIN_STREAM_INTERVAL_SECONDS)
    await websocket.accept()
    try:
        while True:
            data = await get_summary()
            await websocket.send_json(data.model_dump())
            await asyncio.sleep(interval)
    except (WebSocketDisconnect, RuntimeError):
        # We never call receive(), so Starlette's client_state tracking can't
        # tell us the client already disconnected — a send/close against a
        # transport the client (or uvicorn) already closed raises RuntimeError.
        pass
    finally:
        try:
            await websocket.close()
        except RuntimeError:
            pass


if __name__ == "__main__":
    # Exercises cpu.py/gpu.py/containers.py directly - no uvicorn, no frontend.
    # Run with: python main.py
    async def _smoke_test() -> None:
        cpu.prime()
        gpu.initialize()
        containers.initialize()
        try:
            summary_data = await get_summary()
            print(summary_data.model_dump_json(indent=2))
        finally:
            gpu.shutdown()
            containers.shutdown()

    asyncio.run(_smoke_test())
