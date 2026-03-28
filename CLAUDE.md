# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AI-aangedreven GTD (Getting Things Done) dashboard. **Stack:** React frontend (nog op te zetten) + Python/FastAPI backend + Claude Opus 4.6 als AI.

## Backend starten

```bash
cd backend

# Eerste keer
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # vul ANTHROPIC_API_KEY in

# Server starten — belangrijk: altijd vanuit de backend/ map starten
# zodat load_dotenv(.env) het bestand vindt
venv\Scripts\uvicorn main:app --reload --port 8000
```

**Windows-specifiek:** De `ANTHROPIC_API_KEY` moet als omgevingsvariabele beschikbaar zijn vóórdat de server start. Bij problemen: start de server via PowerShell en zet de key expliciet:

```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
uvicorn main:app --reload --port 8000
```

API docs beschikbaar op `http://localhost:8000/docs`.

## Backend architectuur

```
backend/
├── main.py          # FastAPI app, CORS, load_dotenv met absoluut pad
├── models/task.py   # Pydantic modellen: Task, TaskCreate, TaskUpdate, AIRequest
└── routers/
    ├── tasks.py     # CRUD /tasks — in-memory dict (tasks_db), nog geen database
    └── ai.py        # /ai/chat (SSE streaming) en /ai/process-inbox (JSON)
```

**Data flow:** Taken worden opgeslagen in een in-memory `dict[str, Task]` in `routers/tasks.py`. Er is nog geen database — data verdwijnt bij herstart. Database-integratie is een geplande volgende stap.

**AI-integratie:** `get_client()` in `routers/ai.py` maakt een nieuwe `anthropic.Anthropic(api_key=os.environ.get(...))` per request. Model: `claude-opus-4-6`. De `/ai/chat` endpoint streamt via SSE (`text/event-stream`), de `/ai/process-inbox` endpoint retourneert gesynchroniseerde JSON.

## API-endpoints

| Method | Pad | Beschrijving |
|---|---|---|
| GET | `/tasks` | Taken ophalen (query params: `status`, `project`) |
| POST | `/tasks` | Taak aanmaken |
| PATCH | `/tasks/{id}` | Taak gedeeltelijk updaten |
| DELETE | `/tasks/{id}` | Taak verwijderen |
| POST | `/ai/chat` | Streaming GTD-assistent chat (SSE) |
| POST | `/ai/process-inbox` | Inbox-item verwerken naar GTD-actie (JSON) |

## GTD-domeinmodel

`Status` enum: `inbox` → `next_action` / `waiting` / `someday` → `done`
`Priority` enum: `low` / `medium` / `high`
Optionele velden: `project`, `context` (GTD @context label), `due_date`

## Frontend

De `frontend/` map is nog leeg. Te bouwen met React (Vite aanbevolen). CORS staat al open voor `localhost:3000` en `localhost:5173`.
