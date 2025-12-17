# =============================================================================
# Dockerfile Multi-stage para AutoNotiSocial
# Contiene Backend (Node.js), Frontend (React/Vite + Nginx) y Ollama
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build del Frontend
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar archivos de dependencias
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente del frontend
COPY frontend/ ./

# Build de producción
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Imagen final con Backend + Frontend + Ollama
# -----------------------------------------------------------------------------
FROM node:20-slim

# Instalar dependencias del sistema necesarias para Puppeteer, Nginx y Ollama
RUN apt-get update && apt-get install -y \
    # Dependencias para Puppeteer/Chromium
    wget \
    curl \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    # Dependencias para better-sqlite3
    python3 \
    make \
    g++ \
    # Nginx para servir el frontend
    nginx \
    # Supervisor para manejar múltiples procesos
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------------------
# Instalar Ollama
# -----------------------------------------------------------------------------
RUN curl -fsSL https://ollama.com/install.sh | sh

# Crear usuario no-root para seguridad
RUN groupadd -r autonotisocial && useradd -r -g autonotisocial autonotisocial

# Configurar directorio de trabajo
WORKDIR /app

# -----------------------------------------------------------------------------
# Configurar Backend
# -----------------------------------------------------------------------------
WORKDIR /app/backend

# Copiar archivos de dependencias del backend
COPY backend/package*.json ./

# Instalar dependencias del backend
RUN npm ci --only=production

# Copiar código fuente del backend
COPY backend/ ./

# Crear directorios para datos y logs
RUN mkdir -p /app/backend/data /app/backend/logs

# -----------------------------------------------------------------------------
# Configurar Frontend (copiar build desde stage anterior)
# -----------------------------------------------------------------------------
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# -----------------------------------------------------------------------------
# Configurar Nginx
# -----------------------------------------------------------------------------
COPY nginx.conf /etc/nginx/nginx.conf

# -----------------------------------------------------------------------------
# Configurar Supervisor
# -----------------------------------------------------------------------------
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# -----------------------------------------------------------------------------
# Script de inicio
# -----------------------------------------------------------------------------
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# -----------------------------------------------------------------------------
# Permisos
# -----------------------------------------------------------------------------
RUN chown -R autonotisocial:autonotisocial /app
RUN chown -R autonotisocial:autonotisocial /usr/share/nginx/html
RUN chown -R autonotisocial:autonotisocial /var/log/nginx
RUN chown -R autonotisocial:autonotisocial /var/lib/nginx
RUN touch /run/nginx.pid && chown autonotisocial:autonotisocial /run/nginx.pid

# Exponer puertos (Backend, Frontend, Ollama)
EXPOSE 3000 80 11434

# Usar script de inicio que maneja Ollama y supervisor
CMD ["/app/start.sh"]
