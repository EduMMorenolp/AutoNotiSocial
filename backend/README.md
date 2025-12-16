# AutoNotiSocial

Sistema de extracción de noticias de tecnología/desarrollo, generación de resúmenes con IA, y preparación para publicación en redes sociales.

## 🚀 Características

- **Web Scraping**: Extrae noticias de sitios configurables (Dev.to, Hacker News, TechCrunch, etc.)
- **IA Multi-Provider**: Genera resúmenes con Gemini o modelos locales (Ollama)
- **API REST**: Control completo del sistema vía HTTP
- **Scheduler**: Ejecución programada con cron expressions
- **SQLite**: Almacenamiento persistente de artículos, resúmenes y logs
- **Postman Collection**: Colección lista para importar y probar

## 📋 Requisitos

- Node.js 18+
- API Key de Google Gemini (o Ollama instalado localmente)

## 🛠️ Instalación

```bash
# Clonar el repositorio
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API key de Gemini

# Iniciar el servidor
npm start
```

## ⚙️ Configuración

Edita el archivo `.env`:

```env
# Puerto del servidor
PORT=3000

# Proveedor de IA: 'gemini' o 'ollama'
AI_PROVIDER=gemini

# API Key de Gemini
GEMINI_API_KEY=tu_api_key_aqui

# Ollama (opcional, para uso local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Programación de scraping (cada 6 horas por defecto)
SCRAPE_SCHEDULE=0 */6 * * *
```

## 🔌 API Endpoints

### Health
- `GET /api/health` - Estado del servidor

### Sources (Fuentes de noticias)
- `GET /api/sources` - Listar fuentes
- `POST /api/sources` - Crear fuente
- `PUT /api/sources/:id` - Actualizar fuente
- `DELETE /api/sources/:id` - Eliminar fuente
- `POST /api/sources/:id/scrape` - Ejecutar scraping manual

### Articles (Artículos)
- `GET /api/articles` - Listar artículos
- `GET /api/articles/:id` - Obtener artículo con resumen
- `GET /api/articles/pending` - Artículos sin resumen

### Summaries (Resúmenes)
- `GET /api/summaries` - Listar resúmenes
- `POST /api/summaries/generate/:articleId` - Generar resumen
- `POST /api/summaries/process-pending` - Procesar pendientes
- `PUT /api/summaries/:id` - Editar resumen

### Publications (Publicaciones)
- `GET /api/publications` - Historial
- `GET /api/publications/stats` - Estadísticas
- `POST /api/publications` - Crear publicación

### Scheduler
- `GET /api/scheduler/status` - Estado del scheduler
- `POST /api/scheduler/start` - Iniciar
- `POST /api/scheduler/stop` - Detener
- `POST /api/scheduler/run/:sourceId` - Ejecutar fuente manualmente

### Settings
- `GET /api/settings` - Ver configuración
- `PUT /api/settings/ai-provider` - Cambiar proveedor de IA
- `POST /api/settings/ai/test` - Probar IA

### Logs
- `GET /api/logs` - Ver logs del sistema
- `GET /api/logs/stats` - Estadísticas de logs

## 📬 Postman

Importa la colección desde `postman/AutoNotiSocial.postman_collection.json` para probar todos los endpoints.

## 🗄️ Base de Datos

SQLite con las siguientes tablas:

- **sources**: Fuentes de noticias configuradas
- **articles**: Artículos scrapeados
- **summaries**: Resúmenes generados por IA
- **publications**: Historial de publicaciones
- **system_logs**: Logs del sistema

## 📝 Ejemplo de Uso

### 1. Agregar una fuente

```bash
curl -X POST http://localhost:3000/api/sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dev.to",
    "url": "https://dev.to",
    "selectors": {
      "articleList": ".crayons-story",
      "title": ".crayons-story__title a"
    }
  }'
```

### 2. Ejecutar scraping manual

```bash
curl -X POST http://localhost:3000/api/sources/1/scrape
```

### 3. Generar resumen para un artículo

```bash
curl -X POST http://localhost:3000/api/summaries/generate/1
```

### 4. Cambiar a Ollama (modelo local)

```bash
curl -X PUT http://localhost:3000/api/settings/ai-provider \
  -H "Content-Type: application/json" \
  -d '{"provider": "ollama"}'
```

## 🔧 Desarrollo

```bash
# Modo desarrollo con auto-reload
npm run dev
```

## 📄 Licencia

MIT
