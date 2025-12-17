#!/bin/bash
# =============================================================================
# Script de inicio para AutoNotiSocial
# Inicia Ollama, descarga el modelo configurado, y luego inicia Supervisor
# =============================================================================

set -e

echo "🚀 Iniciando AutoNotiSocial..."

# Crear directorio de logs para supervisor si no existe
mkdir -p /var/log/supervisor

# -----------------------------------------------------------------------------
# Iniciar Ollama en background para descargar el modelo
# -----------------------------------------------------------------------------
echo "📦 Iniciando Ollama..."
ollama serve &
OLLAMA_PID=$!

# Esperar a que Ollama esté listo
echo "⏳ Esperando a que Ollama esté listo..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Ollama no respondió después de $MAX_RETRIES intentos"
        break
    fi
    echo "   Intento $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

# -----------------------------------------------------------------------------
# Descargar modelo si está configurado
# -----------------------------------------------------------------------------
if [ -n "$OLLAMA_PULL_MODEL" ]; then
    echo "📥 Descargando modelo: $OLLAMA_PULL_MODEL..."
    ollama pull "$OLLAMA_PULL_MODEL" || echo "⚠️ No se pudo descargar el modelo $OLLAMA_PULL_MODEL"
fi

# Detener Ollama temporal (supervisor lo reiniciará)
echo "🔄 Reiniciando Ollama bajo Supervisor..."
kill $OLLAMA_PID 2>/dev/null || true
sleep 2

# -----------------------------------------------------------------------------
# Iniciar Supervisor (gestiona Ollama, Nginx y Backend)
# -----------------------------------------------------------------------------
echo "✅ Iniciando servicios con Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
