from __future__ import annotations

import time

import psutil

from models import CPUStats, DiskStats, MemoryStats, ProcessMemoryStats, SystemStats

_BOOT_TIME = psutil.boot_time()
_DEFAULT_DISK_PATH = "C:\\"
_TOP_PROCESS_COUNT = 5
_TOP_PROCESS_CACHE_SECONDS = 5.0

_top_process_cache: list[ProcessMemoryStats] = []
_top_process_cache_time: float = float("-inf")


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


def get_top_memory_processes(limit: int = _TOP_PROCESS_COUNT) -> list[ProcessMemoryStats]:
    """Rank processes by RSS, grouped by executable name.

    Grouped rather than per-PID: a browser or IDE spreads its memory across dozens of
    child processes, so ranking individual PIDs would bury the actual top consumer behind
    a wall of modest-looking helper processes.

    Walking every process's memory info takes 300-600ms on a machine with a few hundred
    processes (measured), against low-single-digit-millisecond for every other stat in
    this module - too slow to redo on every poll, especially at the 1s refresh option in
    the UI. Rankings don't shift meaningfully within a few seconds anyway, so this is
    cached and only recomputed every _TOP_PROCESS_CACHE_SECONDS.
    """
    global _top_process_cache, _top_process_cache_time

    now = time.monotonic()
    if now - _top_process_cache_time < _TOP_PROCESS_CACHE_SECONDS:
        return _top_process_cache

    total_bytes: dict[str, float] = {}
    counts: dict[str, int] = {}

    for proc in psutil.process_iter(["name", "memory_info"]):
        try:
            mem_info = proc.info["memory_info"]
            if mem_info is None:
                continue
            name = proc.info["name"] or "unknown"
            total_bytes[name] = total_bytes.get(name, 0.0) + mem_info.rss
            counts[name] = counts.get(name, 0) + 1
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    total_system_bytes = psutil.virtual_memory().total
    ranked = sorted(total_bytes.items(), key=lambda item: item[1], reverse=True)[:limit]

    _top_process_cache = [
        ProcessMemoryStats(
            name=name,
            process_count=counts[name],
            memory_mb=rss_bytes / (1024**2),
            percent=(rss_bytes / total_system_bytes) * 100,
        )
        for name, rss_bytes in ranked
    ]
    _top_process_cache_time = now
    return _top_process_cache


def get_memory_stats() -> MemoryStats:
    vm = psutil.virtual_memory()
    return MemoryStats(
        total_mb=vm.total / (1024**2),
        available_mb=vm.available / (1024**2),
        used_mb=vm.used / (1024**2),
        percent=vm.percent,
        top_processes=get_top_memory_processes(),
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
