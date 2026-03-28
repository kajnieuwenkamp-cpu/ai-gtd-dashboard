# ai-gtd-dashboard

Een fullstack GTD (Getting Things Done) dashboard met AI-functionaliteit.

## Tech stack

- **Frontend:** React
- **Backend:** Python / FastAPI

## Projectstructuur

```
ai-gtd-dashboard/
├── frontend/    # React applicatie
├── backend/     # Python FastAPI server
└── README.md
```

## Aan de slag

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
