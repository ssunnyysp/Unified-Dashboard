export interface CPUStats {
  percent_total: number
  percent_per_core: number[]
  core_count_physical: number | null
  core_count_logical: number | null
  freq_current_mhz: number | null
  freq_max_mhz: number | null
}

export interface MemoryStats {
  total_mb: number
  available_mb: number
  used_mb: number
  percent: number
}

export interface DiskStats {
  path: string
  total_gb: number
  used_gb: number
  free_gb: number
  percent: number
}

export interface SystemStats {
  cpu: CPUStats
  memory: MemoryStats
  disk: DiskStats
  uptime_seconds: number
  process_count: number
}

export interface GPUStats {
  index: number
  name: string
  uuid: string
  memory_total_mb: number
  memory_used_mb: number
  memory_free_mb: number
  gpu_utilization_pct: number
  memory_utilization_pct: number
  temperature_c: number | null
  power_draw_w: number | null
  power_limit_w: number | null
}

export interface GPUSnapshot {
  available: boolean
  driver_version: string | null
  gpus: GPUStats[]
  error: string | null
}

export interface ContainerStats {
  id: string
  name: string
  image: string
  status: string
  created: string | null
  cpu_percent: number | null
  memory_usage_mb: number | null
  memory_limit_mb: number | null
  memory_percent: number | null
  ports: string[]
}

export interface DockerSnapshot {
  available: boolean
  containers: ContainerStats[]
  error: string | null
}

export interface DashboardSummary {
  system: SystemStats
  gpu: GPUSnapshot
  docker: DockerSnapshot
}
