# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Pendiente
- Integración con Twitter/X API
- Integración con LinkedIn API
- Notificaciones push

---

## [1.0.0] - 2024-12-16

### 🎉 Lanzamiento Inicial

#### Añadido
- **Backend**
  - API REST con Express.js
  - Base de datos SQLite con modelos: sources, articles, summaries, publications
  - Servicio de scraping con Puppeteer y Cheerio
  - Integración con Ollama (IA local)
  - Integración con Google Gemini
  - Scheduler con node-cron para automatización
  - Sistema de logging con Winston

- **Frontend**
  - Interfaz React 19 con Vite
  - Dashboard con estadísticas
  - Gestión de fuentes de noticias
  - Visor de artículos
  - Editor de resúmenes
  - Panel de publicaciones
  - Control del scheduler
  - Configuración del sistema
  - Visor de logs

- **Docker**
  - Dockerfile multi-stage optimizado
  - Docker Compose con servicios integrados
  - Ollama incluido en el contenedor
  - Nginx como servidor web y proxy reverso
  - Supervisor para gestión de procesos
  - Volúmenes persistentes para datos y modelos

- **Documentación**
  - README principal
  - Guía del Backend
  - Guía del Frontend
  - Guía de Docker
  - Guía de Ollama

---

## Guía de Versionado

### Formato de versión: `MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

### Tipos de cambios

- `Añadido` - Nuevas funcionalidades
- `Cambiado` - Cambios en funcionalidad existente
- `Obsoleto` - Funcionalidades que serán eliminadas
- `Eliminado` - Funcionalidades eliminadas
- `Corregido` - Corrección de bugs
- `Seguridad` - Vulnerabilidades corregidas

---

[Unreleased]: https://github.com/usuario/autonotisocial/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/usuario/autonotisocial/releases/tag/v1.0.0
