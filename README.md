# TicketAI Dashboard

Clean SaaS dashboard for an AI Support Ticket Auto-Reply system.

## Tech Stack

- Frontend: React + Vite + TypeScript + TailwindCSS + Recharts
- Backend: Django + Django Rest Framework + Token Auth

## Project Structure

- `frontend/`: UI dashboard app
- `backend/`: Django REST API

## Run Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend URL: `http://127.0.0.1:8000`

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://127.0.0.1:5173`

## Auth

- Go to `/login`
- Use any username/password
- If user does not exist, backend auto-creates it

## Main API Endpoints

- `POST /api/auth/login/`
- `GET /api/dashboard/`
- `GET /api/tickets/`
- `GET /api/tickets/:id/`
- `POST /api/tickets/:id/approve/`
- `GET /api/ai-suggestions/`
- `PATCH /api/ai-suggestions/:id/`
- `POST /api/ai-suggestions/:id/approve/`
- `POST /api/ai-suggestions/:id/reject/`
- `GET, POST /api/knowledge-documents/`
- `GET, PUT /api/settings/`
- `GET /api/integrations/gmail/status/`
- `POST /api/integrations/gmail/connect/`
- `POST /api/integrations/gmail/disconnect/`
- `POST /api/integrations/gmail/sync/`
- `POST /api/integrations/gmail/approve-and-reply/`

All responses follow:

```json
{
  "data": {},
  "pagination": {}
}
```
