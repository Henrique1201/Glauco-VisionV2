
# Sistema Avicena (Glauco-VisionV2)

Sistema de diagnóstico médico assistido por inteligência artificial.

## Estrutura do projeto

```
├── backend/     # API Python (FastAPI + SQLite)
├── frontend/    # Interface React (Vite + Tailwind)
├── guidelines/  # Diretrizes de design
└── README.md
```

## Como executar

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# → http://localhost:8000 (Swagger: http://localhost:8000/docs)
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:5173
```