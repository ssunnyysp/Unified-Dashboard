from __future__ import annotations

import time

import psutil

from models import CPUStats, DiskStats, MemoryStats, SystemStats

_BOOT_TIME = psutil.boot_time()
_DEFAULT_DISK_PATH = "C:\\"


def prime() -> None:
    """Take a throwaway cpu_percent reading so the first real call isn't meaningless.

    psutil.cpu_percent compares against the previous call; without a prior
    baseline it always reports 0.0.
    """
    psutil.cpu_percent(interval=None)
    psutil.cpu_percent(interval=None, percpu=True)


def get_cpu_stats() -> CPUStats:
    freq = psutil.cpu_freq()
    return CPUStats(
        percent_total=psutil.cpu_percent(interval=None),
        percent_per_core=psutil.cpu_percent(interval=None, percpu=True),
        core_count_physical=psutil.cpu_count(logical=False),
        core_count_logical=psutil.cpu_count(logical=True),
        freq_current_mhz=freq.current if freq else None,
        freq_max_mhz=freq.max if freq else None,
    )


def get_memory_stats() -> MemoryStats:
    vm = psutil.virtual_memory()
    return MemoryStats(
        total_mb=vm.total / (1024**2),
        available_mb=vm.available / (1024**2),
        used_mb=vm.used / (1024**2),
        percent=vm.percent,
    )


def get_disk_stats(path: str = _DEFAULT_DISK_PATH) -> DiskStats:
    du = psutil.disk_usage(path)
    return DiskStats(
        path=path,
        total_gb=du.total / (1024**3),
        used_gb=du.used / (1024**3),
        free_gb=du.free / (1024**3),
        percent=du.percent,
    )


def get_system_stats() -> SystemStats:
    return SystemStats(
        cpu=get_cpu_stats(),
        memory=get_memory_stats(),
        disk=get_disk_stats(),
        uptime_seconds=time.time() - _BOOT_TIME,
        process_count=len(psutil.pids()),
    )
