FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml /app/pyproject.toml
COPY src /app/src
COPY backend /app/backend
COPY data /app/data
COPY artifacts /app/artifacts

RUN pip install --no-cache-dir -e .

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
