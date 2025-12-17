# 📚 AutoNotiSocial - Documentación

Sistema automatizado de extracción, resumen y publicación de noticias tecnológicas usando inteligencia artificial.

## 📁 Estructura de la Documentación

| Documento | Descripción |
|-----------|-------------|
| [Backend](./BACKEND.md) | API REST, servicios, base de datos y scraping |
| [Frontend](./FRONTEND.md) | Interfaz React/Vite, componentes y vistas |
| [Docker](./DOCKER.md) | Contenedorización, docker-compose y despliegue |
| [Ollama](./OLLAMA.md) | Integración con modelos LLM locales |

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      AutoNotiSocial                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌───────────────────────────────┐  │
│  │     Frontend     │◄──►│           Backend             │  │
│  │    (React/Vite)  │    │       (Node.js/Express)       │  │
│  │       :80        │    │           :3000               │  │
│  └──────────────────┘    └───────────────────────────────┘  │
│                                      │                      │
│                                      ▼                      │
│  ┌──────────────────┐    ┌───────────────────────────────┐  │
│  │      Ollama      │◄──►│          Scraper              │  │
│  │   (LLM Local)    │    │     (Puppeteer/Cheerio)       │  │
│  │      :11434      │    │                               │  │
│  └──────────────────┘    └───────────────────────────────┘  │
│                                      │                      │
│                                      ▼                      │
│                          ┌───────────────────────────────┐  │
│                          │         SQLite DB             │  │
│                          │    (data/database.sqlite)     │  │
│                          └───────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Trabajo

1. **Extracción**: El scheduler ejecuta el scraper para obtener artículos de las fuentes configuradas
2. **Almacenamiento**: Los artículos se guardan en SQLite con su contenido completo
3. **Resumen IA**: Ollama o Gemini genera resúmenes de los artículos
4. **Publicación**: Los resúmenes se pueden publicar en redes sociales configuradas

## 🚀 Inicio Rápido

```bash
# Clonar y configurar
git clone <repository>
cd AutoNotiSocial
cp .env.example .env

# Ejecutar con Docker (recomendado)
docker-compose up --build

# Acceder
# Frontend: http://localhost
# API: http://localhost:3000/api
```

## 📋 Requisitos

- **Docker**: v20.10+ (recomendado)
- **Node.js**: v20+ (para desarrollo local)
- **RAM**: Mínimo 4GB, recomendado 8GB (para Ollama)
- **Disco**: ~5GB (incluye modelos LLM)
