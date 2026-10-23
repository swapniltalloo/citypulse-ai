# 🏙️ CityPulse AI — Autonomous Urban Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.12%20%7C%203.13-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain%20%2F%20LangGraph-0.3+-1C3C3C.svg?logo=langchain&logoColor=white)](https://www.langchain.com/)
[![Groq](https://img.shields.io/badge/Groq-Ultra--Fast%20LPU-f55036.svg)](https://groq.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)

**CityPulse AI** is a production-grade, event-driven autonomous AI agent platform designed for real-time urban reconnaissance, environmental tracking, and geospatial intelligence. Powered by **Groq High-Speed LPUs**, **OpenWeatherMap**, and **Tavily Verified Search**, it autonomously coordinates multi-tool execution pipelines with streaming telemetry and interactive Human-in-the-Loop guardrails.

---

## 🌟 Resume & Portfolio Highlights

- **Event-Driven Agent Architecture**: Engineered with LangChain , utilizing tool-binding protocols and dynamic multi-step reasoning loops.
- **Real-Time SSE Streaming Telemetry**: Streams token chunks, intermediate agent thoughts, and tool execution lifecycles over Server-Sent Events (`/api/chat/stream`).
- **Interactive Human-In-The-Loop (HITL) Guardrails**: Non-blocking asynchronous approval flow (`/api/chat/approve`) allowing human operators to authorize or deny tool actions in real time directly from the chat UI.
- **Geospatial Intelligence Tool Suite**:
  - `get_weather`: Global geocoding coordinates, temperature in °C/°F, humidity, barometric pressure, wind vectors.
  - `get_news`: Tavily real-time web search with source citation metadata and URL verification.
  - `get_city_points_of_interest`: Curated urban landmarks, tech epicenters, and cultural hubs.
  - `get_city_time`: Timezone offset resolution, day/night period, and active business hours status.
  - `get_air_quality`: Real-time particulate levels (PM2.5, PM10, NO2) with health risk classification.
- **Glassmorphic Cyberpunk UI**: Built with React 19, TypeScript, and Tailwind CSS, featuring rich interactive widgets (Weather Card, News Dispatches, Clock, AQI Barometer), Speech Synthesis (TTS), and Markdown export.
- **Production-Ready & Containerized**: Single-port deployment via FastAPI static mount, multi-stage Docker build, health check endpoints, and OpenAPI/Swagger documentation.

---

## 📐 System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 19 + TypeScript)"]
        UI["Glassmorphic Cyber-Dashboard"]
        SSE_Client["SSE Stream Consumer"]
        HITL_Card["HITL Approval Modal"]
        Widgets["Dynamic Visual Widgets (Weather, News, AQI, POI)"]
    end

    subgraph Gateway ["FastAPI Production Gateway"]
        CORS["CORS & Session Manager"]
        Router_Chat["/api/chat/stream (SSE)"]
        Router_HITL["/api/chat/approve"]
        Router_Health["/api/health & /api/tools"]
        Static["SPA Static Mounting (/)"]
    end

    subgraph AgentCore ["Agent Runtime (LangGraph / LangChain)"]
        Agent["CityPulse Autonomous Agent"]
        HITL_Engine["HITL Guardrail Interceptor"]
        LLM["Groq LPU (GPT-OSS / Llama)"]
    end

    subgraph Tools ["Tool Registry"]
        T1["🌦️ OpenWeather (Atmospheric Data)"]
        T2["📰 Tavily (Real-Time News)"]
        T3["📍 Urban POI Registry"]
        T4["⏱️ Geospatial Clock"]
        T5["🍃 AQI Pollution Service"]
    end

    UI --> SSE_Client
    SSE_Client --> Router_Chat
    HITL_Card --> Router_HITL
    Router_Chat --> Agent
    Agent <--> LLM
    Agent --> HITL_Engine
    HITL_Engine -- "Approved" --> Tools
    Tools --> Agent
    Agent --> Router_Chat
    Router_Chat --> UI
    UI --> Widgets
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ (for development or frontend re-compilation)
- Free API Keys:
  - **Groq API Key**: [console.groq.com](https://console.groq.com)
  - **OpenWeather API Key**: [openweathermap.org](https://openweathermap.org/api)
  - **Tavily API Key**: [tavily.com](https://tavily.com)

### 2. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```
Populate your API keys in `.env`:
```ini
GROQ_API_KEY=gsk_...
OPENWEATHER_API_KEY=...
TAVILY_API_KEY=tvly-...
DEFAULT_MODEL=openai/gpt-oss-120b
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

---

## 💻 Running the Application

### Option A: Complete Web Platform (Recommended)
Launch the unified production server (serves both API and the pre-built React UI on a single port):
```bash
python Agents.py --serve
```
👉 Open your browser at: **`http://localhost:8000`**  
👉 Interactive API Documentation: **`http://localhost:8000/docs`**

---

### Option B: Interactive Terminal CLI Mode
Want to test the enhanced agent in pure CLI with terminal graphics and rich tables?
```bash
python Agents.py --cli
```

---

### Option C: Development Mode (Vite Hot-Reload)
Run FastAPI backend and Vite frontend separately for live frontend code editing:

**Terminal 1 (Backend):**
```bash
python Agents.py --serve --reload
```

**Terminal 2 (Frontend Dev Server):**
```bash
cd frontend
npm install
npm run dev
```
👉 Development UI URL: **`http://localhost:5173`** (automatically proxies API requests to backend port 8000).

---

## 🐳 Docker Deployment

Run the complete platform inside a hardened, isolated Docker container:

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Or build directly with Docker
docker build -t citypulse-agent .
docker run -p 8000:8000 --env-file .env citypulse-agent
```

---

## 📡 REST & Streaming API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat/stream` | Server-Sent Events (SSE) streaming chat endpoint |
| `POST` | `/api/chat/approve` | Human-In-The-Loop approval/rejection endpoint |
| `GET` | `/api/sessions` | List active chat sessions |
| `POST` | `/api/sessions` | Create a new session |
| `GET` | `/api/sessions/{id}/messages` | Get message history and tool trace records |
| `DELETE` | `/api/sessions/{id}` | Delete a session |
| `GET` | `/api/tools` | Schema catalog of all registered agent tools |
| `GET` | `/api/health` | Health checks and API key configuration status |

---

## 🛡️ Human-In-The-Loop (HITL) Guardrail Modes

The agent supports 3 runtime guardrail security modes:
1. **Auto-Pilot (`auto`)**: Autonomous execution of all tools without human pause.
2. **Guarded (`sensitive_only`)**: Automatically executes safe read tools (weather, time), but prompts human operator approval for external search (`get_news`).
3. **Strict HITL (`always_ask`)**: Halts execution before every tool call, rendering an authorization card in the UI.

---

## 📜 License
MIT License. Built for production portfolios, high-performance demonstrations, and enterprise AI engineering.
