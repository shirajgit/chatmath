 # ChatMath — Smart Chat + Math Assistant.

A full-stack real-time chat application with an integrated SymPy-powered math solver.

**Stack:** FastAPI · WebSockets · MongoDB · SymPy · React · Vite · TailwindCSS

---

## Project Structure

```
webfastapi/
├── .env.example
├── README.md
├── backend/
│   ├── main.py               # FastAPI app + WebSocket endpoint
│   ├── websocket_manager.py  # Connection manager
│   ├── database.py           # Motor/MongoDB setup
│   ├── models.py             # Pydantic models
│   ├── requirements.txt
│   └── routes/
│       └── math.py           # POST /api/math  (SymPy solver)
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── styles/
        │   └── globals.css
        └── components/
            ├── Login.jsx
            ├── ChatPanel.jsx
            └── MathSolver.jsx
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| MongoDB | 6+ (running locally on port 27017) |

---

## 1 · Install & Start MongoDB

### macOS (Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Ubuntu / Debian
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Windows
Download from https://www.mongodb.com/try/download/community and start the service.

Verify MongoDB is running:
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

---

## 2 · Configure Environment

```bash
cp .env.example .env
# Edit .env if your MongoDB URI or DB name differs
```

Default `.env`:
```
MONGO_URI=mongodb://localhost:27017
DB_NAME=chatapp
```

---

## 3 · Start the Backend

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at → http://localhost:8000
Interactive API docs → http://localhost:8000/docs

---

## 4 · Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → http://localhost:5173

---

## Usage

1. Open http://localhost:5173 in your browser (open multiple tabs to test multi-user chat).
2. Enter a username and click **Join Chat Room**.
3. **Left panel** — real-time chat shared across all connected users.
4. **Right panel** — type any math expression and click **Solve**.

### Math Solver Examples

| Input | Output |
|-------|--------|
| `12 + 8 * 3` | `36` |
| `sqrt(144)` | `12` |
| `2x + 5 = 15` | `x = 5` |
| `x**2 - 5*x + 6 = 0` | `x = 2, x = 3` |
| `2**10` | `1024` |

---

## API Reference

### WebSocket
```
ws://localhost:8000/ws/{username}
```
- On connect: receives last 20 messages, all clients notified of join.
- Send: `{ "text": "hello" }`
- Receive: `{ "type": "message"|"system", "username": "...", "text": "...", "timestamp": "..." }`

### Math Solver
```
POST /api/math
Content-Type: application/json

{ "problem": "2x + 5 = 15" }
```
Response:
```json
{ "result": "x = 5" }
```

---

## Running Both Servers Concurrently (optional)

Install `concurrently` globally or use two terminals.
Using two terminals is the simplest approach — no extra tools needed.
#
