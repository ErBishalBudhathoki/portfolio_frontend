FROM node:20-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

FROM python:3.11-slim AS backend
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend .

FROM python:3.11-slim
WORKDIR /app
COPY --from=frontend /app/frontend /app/frontend
COPY --from=backend /app/backend /app/backend
COPY start.sh .
RUN chmod +x start.sh

# Install Node.js in the final image
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

EXPOSE 3000 8000
CMD ["./start.sh"] 