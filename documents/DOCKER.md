# 🐳 Docker - Documentación

Guía completa para ejecutar AutoNotiSocial con Docker.

## 📁 Archivos de Configuración

```
AutoNotiSocial/
├── docker-compose.yml    # Orquestador de servicios
├── Dockerfile            # Imagen multi-stage
├── nginx.conf            # Configuración del servidor web
├── supervisord.conf      # Gestor de procesos
├── start.sh              # Script de inicio
├── .dockerignore         # Archivos excluidos del build
└── .env.example          # Variables de entorno de ejemplo
```

## 🏗️ Arquitectura del Contenedor

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Container                         │
│                    (autonotisocial)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Nginx     │  │   Node.js   │  │       Ollama        │  │
│  │  (Frontend) │  │  (Backend)  │  │       (LLM)         │  │
│  │    :80      │  │   :3000     │  │      :11434         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │               │                   │               │
│         └───────────────┼───────────────────┘               │
│                         │                                   │
│                  ┌──────┴──────┐                            │
│                  │ Supervisor  │                            │
│                  │  (Gestor)   │                            │
│                  └─────────────┘                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Volúmenes:                                                 │
│  • ./data → /app/backend/data (SQLite)                      │
│  • ./logs → /app/backend/logs (Logs)                        │
│  • ollama_models → /root/.ollama (Modelos LLM)              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar si es necesario (opcional, los valores por defecto funcionan)
nano .env
```

### 2. Construir y Ejecutar

```bash
# Construir imagen y ejecutar
docker-compose up --build

# Ejecutar en background
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

### 3. Acceder a la Aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost | Interfaz web |
| API | http://localhost/api | API REST |
| API (directo) | http://localhost:3000 | API sin proxy |
| Ollama | http://localhost:11434 | API de Ollama |

---

## 📋 Comandos Útiles

### Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose build --no-cache

# Ver logs en tiempo real
docker-compose logs -f

# Ver estado
docker-compose ps

# Ejecutar comando en contenedor
docker-compose exec autonotisocial bash

# Reiniciar servicio
docker-compose restart
```

### Gestión de Volúmenes

```bash
# Ver volúmenes
docker volume ls

# Eliminar volumen de modelos (libera espacio)
docker volume rm autonotisocial_ollama_models

# Backup de base de datos
docker-compose exec autonotisocial cp /app/backend/data/database.sqlite /tmp/
docker cp autonotisocial:/tmp/database.sqlite ./backup/
```

### Ollama dentro del Contenedor

```bash
# Listar modelos instalados
docker-compose exec autonotisocial ollama list

# Descargar nuevo modelo
docker-compose exec autonotisocial ollama pull mistral

# Probar modelo
docker-compose exec autonotisocial ollama run llama3.2 "Hola, ¿cómo estás?"

# Ver modelo actual
docker-compose exec autonotisocial ollama show llama3.2
```

---

## ⚙️ Configuración Detallada

### docker-compose.yml

```yaml
version: '3.8'

services:
  autonotisocial:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: autonotisocial
    restart: unless-stopped
    ports:
      - "3000:3000"    # Backend
      - "80:80"        # Frontend
      - "11434:11434"  # Ollama
    environment:
      - NODE_ENV=production
      - PORT=3000
      - AUTO_START_SCHEDULER=true
      - AI_PROVIDER=${AI_PROVIDER:-ollama}
      - OLLAMA_URL=http://127.0.0.1:11434
      - OLLAMA_MODEL=${OLLAMA_MODEL:-llama3.2}
      - OLLAMA_PULL_MODEL=${OLLAMA_PULL_MODEL:-llama3.2}
    volumes:
      - ./data:/app/backend/data
      - ./logs:/app/backend/logs
      - ollama_models:/root/.ollama
    shm_size: '2gb'
    cap_add:
      - SYS_ADMIN
    deploy:
      resources:
        limits:
          memory: 8G
        reservations:
          memory: 4G

volumes:
  ollama_models:
```

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | Proveedor IA: `ollama` o `gemini` | `ollama` |
| `OLLAMA_MODEL` | Modelo a usar | `llama3.2` |
| `OLLAMA_PULL_MODEL` | Modelo a descargar al iniciar | `llama3.2` |
| `GEMINI_API_KEY` | API Key de Gemini | - |
| `AUTO_START_SCHEDULER` | Iniciar scheduler automáticamente | `true` |

---

## 🔧 Dockerfile Multi-Stage

El Dockerfile usa un build multi-stage para optimizar el tamaño:

### Stage 1: Build del Frontend
```dockerfile
FROM node:20-alpine AS frontend-builder
# Instala dependencias y ejecuta npm run build
# Resultado: /app/frontend/dist con archivos optimizados
```

### Stage 2: Imagen Final
```dockerfile
FROM node:20-slim
# Instala: Puppeteer deps, Nginx, Supervisor, Ollama
# Copia: frontend build, backend src
# Ejecuta: start.sh → Supervisor
```

### Componentes Incluidos:
- **Node.js 20**: Runtime para el backend
- **Nginx**: Servidor web para el frontend
- **Chromium**: Para Puppeteer (web scraping)
- **Ollama**: LLM local
- **Supervisor**: Gestor de procesos

---

## 🌐 Nginx Configuration

```nginx
# Servir frontend SPA
location / {
    try_files $uri $uri/ /index.html;
}

# Proxy reverso para API
location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Cache de assets estáticos
location ~* \.(js|css|png|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔒 Seguridad

### Headers de Seguridad (Nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### Capabilities de Docker
```yaml
cap_add:
  - SYS_ADMIN  # Requerido para Puppeteer sandbox
```

### Usuario No-Root
El backend se ejecuta como usuario `autonotisocial` para mayor seguridad.

---

## 💾 Persistencia de Datos

| Volumen | Ruta en Contenedor | Descripción |
|---------|-------------------|-------------|
| `./data` | `/app/backend/data` | Base de datos SQLite |
| `./logs` | `/app/backend/logs` | Archivos de log |
| `ollama_models` | `/root/.ollama` | Modelos de Ollama |

### Backup Completo

```bash
# Detener contenedor
docker-compose down

# Crear backup
tar -czvf backup-$(date +%Y%m%d).tar.gz data/ logs/

# Reiniciar
docker-compose up -d
```

---

## 🐛 Troubleshooting

### El contenedor no inicia
```bash
# Ver logs de inicio
docker-compose logs -f

# Verificar que los puertos no estén ocupados
netstat -tulpn | grep -E "80|3000|11434"
```

### Ollama no descarga el modelo
```bash
# Descargar manualmente
docker-compose exec autonotisocial ollama pull llama3.2

# Verificar conexión
docker-compose exec autonotisocial curl http://127.0.0.1:11434/api/tags
```

### Error de memoria
```bash
# Usar modelo más pequeño
OLLAMA_PULL_MODEL=llama3.2:1b docker-compose up -d
```

### Frontend no carga
```bash
# Verificar que nginx esté corriendo
docker-compose exec autonotisocial supervisorctl status

# Ver logs de nginx
docker-compose exec autonotisocial cat /var/log/nginx/error.log
```
