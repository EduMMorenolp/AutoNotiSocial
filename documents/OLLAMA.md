# 🦙 Ollama - Documentación

Guía de integración de **Ollama** como proveedor de IA local en AutoNotiSocial.

## 📖 ¿Qué es Ollama?

Ollama es una herramienta que permite ejecutar modelos de lenguaje grandes (LLMs) de forma local. En AutoNotiSocial, se usa para:

- **Generar resúmenes** de artículos de noticias
- **Crear contenido** para publicaciones en redes sociales
- **Procesar texto** sin depender de APIs externas

### Ventajas de Ollama

| Característica | Descripción |
|----------------|-------------|
| 🔒 **Privacidad** | Los datos nunca salen de tu servidor |
| 💰 **Sin costos** | No hay cargos por uso de API |
| ⚡ **Sin límites** | Sin rate limits ni restricciones |
| 🌐 **Offline** | Funciona sin conexión a internet |

---

## 🚀 Modelos Disponibles

### Modelos Recomendados

| Modelo | Tamaño | RAM Mínima | Descripción |
|--------|--------|------------|-------------|
| `llama3.2` | 2GB | 4GB | Mejor balance calidad/velocidad |
| `llama3.2:1b` | 1.3GB | 2GB | Más rápido, ideal para servidores pequeños |
| `mistral` | 4GB | 8GB | Excelente para resúmenes |
| `phi3` | 2.3GB | 4GB | Microsoft, muy preciso |
| `gemma2` | 5GB | 8GB | Google, multilingüe |
| `qwen2` | 4GB | 8GB | Alibaba, bueno en español |

### Cambiar Modelo

```bash
# Vía variable de entorno
OLLAMA_MODEL=mistral docker-compose up -d

# O editar .env
echo "OLLAMA_MODEL=mistral" >> .env
echo "OLLAMA_PULL_MODEL=mistral" >> .env
docker-compose up -d --build
```

---

## ⚙️ Configuración

### Variables de Entorno

```env
# Proveedor de IA
AI_PROVIDER=ollama

# URL del servidor Ollama (dentro del contenedor)
OLLAMA_URL=http://127.0.0.1:11434

# Modelo a usar para generar resúmenes
OLLAMA_MODEL=llama3.2

# Modelo a descargar automáticamente al iniciar
OLLAMA_PULL_MODEL=llama3.2
```

### Configuración del Backend

El servicio de IA se configura automáticamente en `backend/src/services/ai/`:

```javascript
// Inicialización
const provider = process.env.AI_PROVIDER || 'ollama';
const model = process.env.OLLAMA_MODEL || 'llama3.2';
const url = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
```

---

## 🔧 Comandos Útiles

### Gestión de Modelos

```bash
# Listar modelos instalados
docker-compose exec autonotisocial ollama list

# Descargar nuevo modelo
docker-compose exec autonotisocial ollama pull mistral

# Eliminar modelo (liberar espacio)
docker-compose exec autonotisocial ollama rm llama3.2

# Ver información del modelo
docker-compose exec autonotisocial ollama show llama3.2
```

### Probar Modelo

```bash
# Prueba interactiva
docker-compose exec autonotisocial ollama run llama3.2

# Prueba con prompt específico
docker-compose exec autonotisocial ollama run llama3.2 "Resume en 3 líneas: La inteligencia artificial está transformando la industria tecnológica..."
```

### API de Ollama

```bash
# Verificar que Ollama está corriendo
curl http://localhost:11434/api/tags

# Generar texto
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hola, ¿cómo estás?",
  "stream": false
}'

# Chat
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    {"role": "user", "content": "Resume este artículo: ..."}
  ],
  "stream": false
}'
```

---

## 📊 Uso en el Sistema

### Flujo de Resumen

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Artículo  │────►│   Backend    │────►│   Ollama    │
│  (Scrapeado)│     │  (ai.js)     │     │  (LLM)      │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           │◄───────────────────┘
                           │     Resumen
                           ▼
                    ┌──────────────┐
                    │    SQLite    │
                    │  (summaries) │
                    └──────────────┘
```

### Prompt de Resumen

El sistema usa un prompt optimizado para noticias tecnológicas:

```
Eres un periodista tecnológico experto. Resume el siguiente artículo 
en un formato adecuado para redes sociales.

Requisitos:
- Máximo 280 caracteres (para Twitter)
- Incluye los puntos clave
- Tono profesional pero accesible
- En español

Artículo:
{contenido_del_articulo}
```

---

## 🎛️ Optimización de Rendimiento

### Parámetros de Generación

```javascript
const options = {
    temperature: 0.7,      // Creatividad (0-1)
    top_p: 0.9,           // Nucleus sampling
    top_k: 40,            // Top-k sampling
    num_predict: 150,     // Máximo de tokens
    repeat_penalty: 1.1   // Penalización de repetición
};
```

### Ajustes por Caso de Uso

| Caso de Uso | Temperature | Tokens |
|-------------|-------------|--------|
| Resúmenes precisos | 0.3 | 100 |
| Contenido creativo | 0.8 | 200 |
| Traducciones | 0.1 | 300 |

---

## 💻 Requisitos de Hardware

### Mínimos

| Componente | Requisito |
|------------|-----------|
| RAM | 4GB |
| CPU | 4 cores |
| Disco | 10GB libres |
| Modelo | `llama3.2:1b` |

### Recomendados

| Componente | Requisito |
|------------|-----------|
| RAM | 8GB+ |
| CPU | 8 cores |
| GPU | NVIDIA con 4GB+ VRAM (opcional) |
| Disco | 20GB+ SSD |
| Modelo | `llama3.2` o `mistral` |

### Con GPU (Aceleración)

Para usar GPU NVIDIA dentro de Docker:

```yaml
# docker-compose.yml
services:
  autonotisocial:
    # ... otras configuraciones ...
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

## 🔄 Ollama vs Gemini

| Característica | Ollama | Gemini |
|----------------|--------|--------|
| Costo | Gratis | Pago por uso |
| Privacidad | 100% local | Datos en la nube |
| Velocidad | Depende del hardware | Muy rápido |
| Calidad | Buena-Excelente | Excelente |
| Offline | ✅ Sí | ❌ No |
| Configuración | Incluido en Docker | Solo API Key |

### Cambiar entre Proveedores

```bash
# Usar Gemini
AI_PROVIDER=gemini GEMINI_API_KEY=tu_key docker-compose up -d

# Usar Ollama
AI_PROVIDER=ollama docker-compose up -d
```

---

## 🐛 Troubleshooting

### Ollama no responde

```bash
# Verificar estado
docker-compose exec autonotisocial supervisorctl status ollama

# Reiniciar Ollama
docker-compose exec autonotisocial supervisorctl restart ollama

# Ver logs
docker-compose exec autonotisocial supervisorctl tail -f ollama
```

### Modelo no se descarga

```bash
# Descargar manualmente
docker-compose exec autonotisocial ollama pull llama3.2

# Verificar espacio en disco
docker-compose exec autonotisocial df -h
```

### Respuestas lentas

1. **Usar modelo más pequeño**: `llama3.2:1b`
2. **Aumentar memoria del contenedor** en `docker-compose.yml`
3. **Habilitar GPU** si está disponible

### Error "out of memory"

```bash
# Cambiar a modelo más pequeño
OLLAMA_MODEL=llama3.2:1b docker-compose up -d

# O aumentar límite de memoria
# En docker-compose.yml:
# deploy.resources.limits.memory: 16G
```

---

## 📚 Recursos

- [Ollama Official](https://ollama.com/)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Modelos Disponibles](https://ollama.com/library)
- [API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
