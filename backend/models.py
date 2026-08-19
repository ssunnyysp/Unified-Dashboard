from __future__ import annotations

from pydantic import BaseModel


class GPUStats(BaseModel):
    index: int
    name: str
    uuid: str
    memory_total_mb: float
    memory_used_mb: float
    memory_free_mb: float
    gpu_utilization_pct: float
    memory_utilization_pct: float
    temperature_c: float | None = None
    power_draw_w: float | None = None
    power_limit_w: float | None = None


class GPUSnapshot(BaseModel):
    available: bool
    driver_version: str | None = None
    gpus: list[GPUStats] = []
    error: str | None = None


class CPUStats(BaseModel):
    percent_total: float
    percent_per_core: list[float]
    core_count_physical: int | None
    core_count_logical: int | None
    freq_current_mhz: float | None = None
    freq_max_mhz: float | None = None


class MemoryStats(BaseModel):
    total_mb: float
    available_mb: float
    used_mb: float
    percent: float


class DiskStats(BaseModel):
    path: str
    total_gb: float
    used_gb: float
    free_gb: float
    percent: float


class SystemStats(BaseModel):
    cpu: CPUStats
    memory: MemoryStats
    disk: DiskStats
    uptime_seconds: float
    process_count: int


class ContainerStats(BaseModel):
    id: str
    name: str
    image: str
    status: str
    created: str | None
    cpu_percent: float | None = None
    memory_usage_mb: float | None = None
    memory_limit_mb: float | None = None
    memory_percent: float | None = None
    ports: list[str] = []


class DockerSnapshot(BaseModel):
    available: bool
    containers: list[ContainerStats] = []
    error: str | None = None


class DashboardSummary(BaseModel):
    system: SystemStats
    gpu: GPUSnapshot
    docker: DockerSnapshot
