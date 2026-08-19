from __future__ import annotations

import docker
from docker.errors import DockerException

from models import ContainerStats, DockerSnapshot

_client: docker.DockerClient | None = None
_client_error: str | None = None


def initialize() -> bool:
    global _client, _client_error
    try:
        client = docker.from_env()
        client.ping()
    except DockerException as exc:
        _client = None
        _client_error = str(exc)
        return False
    _client = client
    _client_error = None
    return True


def shutdown() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_docker_snapshot() -> DockerSnapshot:
    if _client is None and not initialize():
        return DockerSnapshot(available=False, containers=[], error=_client_error)

    assert _client is not None
    try:
        raw_containers = _client.containers.list(all=True)
    except DockerException as exc:
        # The daemon may have gone away since the last successful call.
        shutdown()
        return DockerSnapshot(available=False, containers=[], error=str(exc))

    containers = [_read_container(c) for c in raw_containers]
    return DockerSnapshot(available=True, containers=containers, error=None)


def _read_container(container) -> ContainerStats:
    cpu_percent = memory_usage_mb = memory_limit_mb = memory_percent = None

    if container.status == "running":
        try:
            stats = container.stats(stream=False)
        except DockerException:
            stats = None

        if stats:
            cpu_percent = _calc_cpu_percent(stats)
            mem = stats.get("memory_stats", {})
            usage = mem.get("usage")
            limit = mem.get("limit")
            if usage is not None:
                memory_usage_mb = usage / (1024**2)
            if limit:
                memory_limit_mb = limit / (1024**2)
            if usage is not None and limit:
                memory_percent = (usage / limit) * 100

    ports: list[str] = []
    port_bindings = (container.attrs.get("NetworkSettings", {}) or {}).get("Ports") or {}
    for container_port, bindings in port_bindings.items():
        for binding in bindings or []:
            ports.append(f"{binding.get('HostIp')}:{binding.get('HostPort')} -> {container_port}")

    image_tags = container.image.tags if container.image else []

    return ContainerStats(
        id=container.short_id,
        name=container.name,
        image=image_tags[0] if image_tags else (container.image.short_id if container.image else "unknown"),
        status=container.status,
        created=container.attrs.get("Created"),
        cpu_percent=cpu_percent,
        memory_usage_mb=memory_usage_mb,
        memory_limit_mb=memory_limit_mb,
        memory_percent=memory_percent,
        ports=ports,
    )


def _calc_cpu_percent(stats: dict) -> float | None:
    try:
        cpu_usage = stats["cpu_stats"]["cpu_usage"]
        precpu_usage = stats["precpu_stats"]["cpu_usage"]
        cpu_delta = cpu_usage["total_usage"] - precpu_usage["total_usage"]
        system_delta = stats["cpu_stats"]["system_cpu_usage"] - stats["precpu_stats"]["system_cpu_usage"]
        online_cpus = stats["cpu_stats"].get("online_cpus") or len(cpu_usage.get("percpu_usage") or [1])
    except (KeyError, TypeError):
        return None

    if system_delta > 0 and cpu_delta >= 0:
        return (cpu_delta / system_delta) * online_cpus * 100
    return None
