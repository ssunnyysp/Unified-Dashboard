const DEFAULT_HTTP_BASE = 'http://localhost:8000'

const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_HTTP_BASE

export const API_BASE_URL = rawBase.replace(/\/$/, '')
export const WS_SUMMARY_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/ws/summary`
