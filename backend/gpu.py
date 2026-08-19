from __future__ import annotations

import pynvml

from models import GPUSnapshot, GPUStats

_initialized = False
_init_error: str | None = None


def initialize() -> bool:
    """Attempt to bring up NVML once at process startup. Safe to call again."""
    global _initialized, _init_error
    if _initialized:
        return True
    try:
        pynvml.nvmlInit()
        _initialized = True
        _init_error = None
    except pynvml.NVMLError as exc:
        _initialized = False
        _init_error = str(exc)
    return _initialized


def shutdown() -> None:
    global _initialized
    if _initialized:
        pynvml.nvmlShutdown()
        _initialized = False


def get_gpu_snapshot() -> GPUSnapshot:
    if not _initialized and not initialize():
        return GPUSnapshot(available=False, driver_version=None, gpus=[], error=_init_error)

    try:
        driver_version = _decode(pynvml.nvmlSystemGetDriverVersion())
        device_count = pynvml.nvmlDeviceGetCount()
        gpus = [_read_gpu(index) for index in range(device_count)]
        return GPUSnapshot(available=True, driver_version=driver_version, gpus=gpus, error=None)
    except pynvml.NVMLError as exc:
        return GPUSnapshot(available=False, driver_version=None, gpus=[], error=str(exc))


def _read_gpu(index: int) -> GPUStats:
    handle = pynvml.nvmlDeviceGetHandleByIndex(index)
    mem = pynvml.nvmlDeviceGetMemoryInfo(handle)
    util = pynvml.nvmlDeviceGetUtilizationRates(handle)

    return GPUStats(
        index=index,
        name=_decode(pynvml.nvmlDeviceGetName(handle)),
        uuid=_decode(pynvml.nvmlDeviceGetUUID(handle)),
        memory_total_mb=mem.total / (1024**2),
        memory_used_mb=mem.used / (1024**2),
        memory_free_mb=mem.free / (1024**2),
        gpu_utilization_pct=util.gpu,
        memory_utilization_pct=util.memory,
        temperature_c=_try(pynvml.nvmlDeviceGetTemperature, handle, pynvml.NVML_TEMPERATURE_GPU),
        power_draw_w=_try_milliwatts(pynvml.nvmlDeviceGetPowerUsage, handle),
        power_limit_w=_try_milliwatts(pynvml.nvmlDeviceGetEnforcedPowerLimit, handle),
    )


def _decode(value: str | bytes) -> str:
    return value.decode() if isinstance(value, bytes) else value


def _try(fn, *args) -> float | None:
    try:
        return fn(*args)
    except pynvml.NVMLError:
        return None


def _try_milliwatts(fn, *args) -> float | None:
    value = _try(fn, *args)
    return value / 1000 if value is not None else None
