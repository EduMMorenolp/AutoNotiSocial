# 🔧 Backend - Documentación

Backend de AutoNotiSocial construido con **Node.js** y **Express**, con base de datos **SQLite** y servicios de scraping e IA.

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── index.js              # Punto de entrada principal
│   ├── api/
│   │   ├── index.js          # Configuración de Express
│   │   └── routes/           # Endpoints de la API
│   │       ├── articles.js   # CRUD de artículos
│   │       ├── sources.js    # CRUD de fuentes
│   │       ├── summaries.js  # CRUD de resúmenes
│   │       ├── publications.js # CRUD de publicaciones
│   │       ├── scheduler.js  # Control del scheduler
│   │       ├── settings.js   # Configuraciones
│   │       └── logs.js       # Logs del sistema
│   ├── core/
│   │   └── scheduler.js      # Programador de tareas (node-cron)
│   ├── database/
│   │   ├── init.js           # Inicialización de SQLite
│   │   ├── seed.js           # Datos iniciales
│   │   └── models/           # Modelos de datos
│   ├── services/
│   │   ├── ai/               # Servicios de IA (Gemini/Ollama)
│   │   └── scraper.js        # Web scraping con Puppeteer
│   └── utils/
│       └── logger.js         # Winston logger
├── data/                     # Base de datos SQLite
├── logs/                     # Archivos de log
└── package.json
```

## 🚀 API REST

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 📰 Artículos (`/api/articles`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/articles` | Listar todos los artículos |
| GET | `/articles/:id` | Obtener artículo por ID |
| POST | `/articles` | Crear nuevo artículo |
| PUT | `/articles/:id` | Actualizar artículo |
| DELETE | `/articles/:id` | Eliminar artículo |
| POST | `/articles/:id/summarize` | Generar resumen con IA |

#### 📡 Fuentes (`/api/sources`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/sources` | Listar todas las fuentes |
| GET | `/sources/:id` | Obtener fuente por ID |
| POST | `/sources` | Crear nueva fuente |
| PUT | `/sources/:id` | Actualizar fuente |
| DELETE | `/sources/:id` | Eliminar fuente |
| POST | `/sources/:id/scrape` | Ejecutar scraping de fuente |

#### 📝 Resúmenes (`/api/summaries`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/summaries` | Listar todos los resúmenes |
| GET | `/summaries/:id` | Obtener resumen por ID |
| PUT | `/summaries/:id` | Actualizar resumen |
| DELETE | `/summaries/:id` | Eliminar resumen |

#### 📤 Publicaciones (`/api/publications`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/publications` | Listar publicaciones |
| POST | `/publications` | Crear publicación |
| PUT | `/publications/:id` | Actualizar publicación |
| DELETE | `/publications/:id` | Eliminar publicación |
| POST | `/publications/:id/publish` | Publicar en red social |

#### ⏰ Scheduler (`/api/scheduler`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/scheduler/status` | Estado del scheduler |
| POST | `/scheduler/start` | Iniciar scheduler |
| POST | `/scheduler/stop` | Detener scheduler |
| POST | `/scheduler/run` | Ejecutar ciclo manualmente |

#### ⚙️ Configuración (`/api/settings`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/settings` | Obtener configuración |
| PUT | `/settings` | Actualizar configuración |

#### 📋 Logs (`/api/logs`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/logs` | Obtener logs del sistema |

---

## 🗄️ Base de Datos

### Esquema SQLite

#### Tabla `sources`
```sql
CREATE TABLE sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    type TEXT DEFAULT 'rss',        -- 'rss', 'web', 'api'
    selector TEXT,                   -- CSS selector para scraping
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `articles`
```sql
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    title TEXT NOT NULL,
    url TEXT UNIQUE,
    content TEXT,
    author TEXT,
    published_at DATETIME,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',   -- 'pending', 'summarized', 'published'
    FOREIGN KEY (source_id) REFERENCES sources(id)
);
```

#### Tabla `summaries`
```sql
CREATE TABLE summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER UNIQUE,
    summary TEXT NOT NULL,
    ai_provider TEXT,                -- 'gemini', 'ollama'
    model TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);
```

#### Tabla `publications`
```sql
CREATE TABLE publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    summary_id INTEGER,
    platform TEXT NOT NULL,          -- 'twitter', 'linkedin', 'facebook'
    status TEXT DEFAULT 'draft',     -- 'draft', 'scheduled', 'published', 'failed'
    scheduled_at DATETIME,
    published_at DATETIME,
    external_id TEXT,
    FOREIGN KEY (summary_id) REFERENCES summaries(id)
);
```

---

## 🤖 Servicios de IA

### Configuración

```env
# Proveedor: 'gemini' o 'ollama'
AI_PROVIDER=ollama

# Gemini
GEMINI_API_KEY=tu_api_key

# Ollama
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
```

### Uso Programático

```javascript
const aiService = require('./services/ai');

// Inicializar
aiService.init();

// Generar resumen
const summary = await aiService.summarize(articleContent, {
    maxLength: 280,  // Para Twitter
    style: 'professional'
});
```

---

## 🔍 Scraper

### Características

- **Puppeteer**: Para sitios con JavaScript dinámico
- **Cheerio**: Para parsing HTML estático
- **Auto-detección**: Detecta RSS, HTML o APIs

### Configurar Nueva Fuente

```javascript
// Ejemplo de fuente RSS
{
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    type: "rss"
}

// Ejemplo de fuente web con selector
{
    name: "Hacker News",
    url: "https://news.ycombinator.com/",
    type: "web",
    selector: ".athing .titleline > a"
}
```

---

## 🏃 Ejecución Local

```bash
cd backend

# Instalar dependencias
npm install

# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start

# Tests
npm run test:db      # Test de base de datos
npm run test:scrape  # Test de scraping
npm run test:ai      # Test de IA
```

---

## 📝 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno | `development` |
| `AUTO_START_SCHEDULER` | Iniciar scheduler automáticamente | `true` |
| `AI_PROVIDER` | Proveedor de IA | `ollama` |
| `GEMINI_API_KEY` | API Key de Gemini | - |
| `OLLAMA_URL` | URL de Ollama | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Modelo de Ollama | `llama3.2` |
