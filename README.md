# unified dashboard

A small dashboard for keeping an eye on what my machine is doing while I run things locally, mostly local LLMs. It started because I got tired of alt-tabbing to Task Manager every few minutes to check CPU and VRAM.

## What it shows

- CPU usage, total and per-thread, plus core count and clock speed
- Memory and disk usage
- GPU stats through NVML: utilization, VRAM, temperature, power draw (NVIDIA only)
- Docker containers, if Docker is running on the machine

Everything updates live over a websocket. The backend only reports current state, it doesn't keep any history in a database. The little trend charts in the UI just hold a short rolling buffer in memory on the frontend, so refreshing the page resets them.

## Stack

Backend: FastAPI, psutil, pynvml, the Docker SDK.
Frontend: React + Vite, plain CSS, no UI library.

## Running it

Backend:

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:

```
cd frontend
npm install
npm run dev
```

Open whatever URL Vite prints, usually `http://localhost:5173`. If the backend isn't on port 8000, copy `frontend/.env.example` to `.env` and set `VITE_API_BASE_URL` to wherever it's actually running.
