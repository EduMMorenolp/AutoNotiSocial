import { useState, useEffect } from "react";
import * as api from "../services/api";
import { getFaviconUrl } from "../utils/helpers";

// Plantillas predefinidas de fuentes
function Sources({ toast }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [templates, setTemplates] = useState({});
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    schedule: "0 */6 * * *",
    enabled: true,
    selectors: {
      articleList: "",
      title: "",
      image: "",
      author: "",
      content: "",
    },
  });

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    try {
      setLoading(true);
      const result = await api.getSources();
      setSources(result.data || []);
    } catch (error) {
      toast.error("Error al cargar fuentes");
    } finally {
      setLoading(false);
    }
  }

  function openModal(source = null) {
    if (source) {
      setEditingSource(source);
      setFormData({
        name: source.name,
        url: source.url,
        schedule: source.schedule,
        enabled: source.enabled,
        selectors: source.selectors || {},
      });
      setShowTemplates(false);
    } else {
      setEditingSource(null);
      setFormData({
        name: "",
        url: "",
        schedule: "0 */6 * * *",
        enabled: true,
        selectors: {
          articleList: "article",
          title: "h2 a",
          image: "img",
          author: ".author",
          content: "article",
        },
      });
      setShowTemplates(true);
    }
    setShowModal(true);
  }

  function applyTemplate(template) {
    setFormData({
      name: template.name,
      url: template.url,
      schedule: template.schedule || "0 */6 * * *",
      enabled: true,
      selectors: template.selectors,
    });
    setShowTemplates(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editingSource) {
        await api.updateSource(editingSource.id, formData);
        toast.success("Fuente actualizada");
      } else {
        await api.createSource(formData);
        toast.success("Fuente creada");
      }
      setShowModal(false);
      loadSources();
    } catch (error) {
      toast.error(error.message || "Error al guardar");
    }
  }

  async function handleDelete(source) {
    if (!confirm(`¿Eliminar "${source.name}"?`)) return;

    try {
      await api.deleteSource(source.id);
      toast.success("Fuente eliminada");
      loadSources();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  }

  async function handleToggle(source) {
    try {
      await api.toggleSource(source.id);
      toast.success(source.enabled ? "Fuente desactivada" : "Fuente activada");
      loadSources();
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  }

  async function handleScrape(source) {
    try {
      toast.info(`Scrapeando ${source.name}...`);
      const result = await api.scrapeSource(source.id);
      toast.success(
        `Encontrados: ${result.data.scraping?.articlesFound || 0} artículos`
      );
    } catch (error) {
      toast.error("Error al scrapear");
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuentes</h1>
          <p className="page-subtitle">Gestiona los sitios web a monitorear</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Nueva Fuente
        </button>
      </div>

      {sources.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🌐</div>
            <h3>No hay fuentes configuradas</h3>
            <p>Agrega tu primera fuente de noticias</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: "16px" }}
              onClick={() => openModal()}
            >
              + Nueva Fuente
            </button>
          </div>
        </div>
      ) : (
        <div>
          {sources.map((source) => (
            <div key={source.id} className="source-item">
              <div className="source-info">
                <img
                  src={getFaviconUrl(source.url)}
                  alt=""
                  className="source-icon"
                  style={{ objectFit: "contain", padding: "8px" }}
                  onError={(e) => (e.target.style.display = "none")}
                />
                <div>
                  <div className="source-name">{source.name}</div>
                  <div className="source-url">{source.url}</div>
                </div>
                <span
                  className={`badge ${
                    source.enabled ? "badge-success" : "badge-error"
                  }`}
                >
                  {source.enabled ? "Activa" : "Inactiva"}
                </span>
              </div>

              <div className="source-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleScrape(source)}
                  title="Ejecutar scraping"
                >
                  ▶️
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleToggle(source)}
                  title={source.enabled ? "Desactivar" : "Activar"}
                >
                  {source.enabled ? "⏸️" : "▶️"}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openModal(source)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(source)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingSource
                  ? "✏️ Editar Fuente"
                  : "➕ Nueva Fuente de Noticias"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Selector de Plantillas */}
                {!editingSource && showTemplates && (
                  <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        ⚡ Plantillas Rápidas
                      </h3>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-secondary"
                        onClick={() => setShowTemplates(false)}
                      >
                        Configurar manualmente
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Selecciona una plantilla pre-configurada para comenzar rápidamente
                    </p>

                    {/* Trending Topics */}
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
                        📈 Trending Topics
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {SOURCE_TEMPLATES.trending.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            className="template-btn"
                            style={{
                              padding: '8px 12px',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px'
                            }}
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Releases */}
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
                        🚀 Lanzamientos y Versiones
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {SOURCE_TEMPLATES.releases.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            className="template-btn"
                            style={{
                              padding: '8px 12px',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px'
                            }}
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Newsletters */}
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
                        📬 Newsletters Semanales
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {SOURCE_TEMPLATES.newsletters.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            className="template-btn"
                            style={{
                              padding: '8px 12px',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px'
                            }}
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Popular */}
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
                        🔥 Por Relevancia
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {SOURCE_TEMPLATES.popular.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            className="template-btn"
                            style={{
                              padding: '8px 12px',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px'
                            }}
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spanish */}
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
                        🇪🇸 Fuentes en Español
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {SOURCE_TEMPLATES.spanish.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            className="template-btn"
                            style={{
                              padding: '8px 12px',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '12px'
                            }}
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón para mostrar plantillas si está oculto */}
                {!editingSource && !showTemplates && (
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <button 
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowTemplates(true)}
                    >
                      ⚡ Ver Plantillas Rápidas
                    </button>
                  </div>
                )}

                {/* Sección 1: Información Básica */}
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    📋 Información Básica
                  </h3>

                  <div className="form-group">
                    <label className="form-label">
                      Nombre de la fuente{" "}
                      <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ej: Dev.to, Xataka, Medium"
                      required
                    />
                    <small
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      Nombre descriptivo para identificar la fuente
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Sitio web <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      placeholder="https://dev.to"
                      required
                    />
                    <small
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      URL completa del sitio web a monitorear
                    </small>
                  </div>
                </div>

                {/* Sección 2: Programación */}
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    ⏰ Programación
                  </h3>

                  <div className="form-group">
                    <label className="form-label">
                      Frecuencia de monitoreo
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.schedule}
                      onChange={(e) =>
                        setFormData({ ...formData, schedule: e.target.value })
                      }
                      placeholder="0 */6 * * *"
                    />
                    <small
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      <strong>Ejemplos:</strong> <br />•{" "}
                      <code>0 */6 * * *</code> - Cada 6 horas <br />•{" "}
                      <code>0 9 * * *</code> - Diariamente a las 9:00 AM <br />•{" "}
                      <code>*/30 * * * *</code> - Cada 30 minutos
                    </small>
                  </div>
                </div>

                {/* Sección 3: Selectores CSS */}
                <div style={{ marginBottom: "16px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    🎯 Selectores CSS
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginBottom: "12px",
                    }}
                  >
                    Define los selectores CSS para localizar los artículos en el
                    sitio web. Abre las developer tools (F12) para inspeccionar
                    el HTML.
                  </p>

                  <div className="form-group">
                    <label className="form-label">
                      Contenedor de artículos{" "}
                      <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.selectors.articleList || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selectors: {
                            ...formData.selectors,
                            articleList: e.target.value,
                          },
                        })
                      }
                      placeholder="article, .post-card, .article-item"
                      required
                    />
                    <small
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      Selector que agrupa cada artículo. Ej:{" "}
                      <code>article</code>, <code>.post-card</code>
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Selector del título{" "}
                      <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.selectors.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selectors: {
                            ...formData.selectors,
                            title: e.target.value,
                          },
                        })
                      }
                      placeholder="h2 a, .title, a.article-title"
                      required
                    />
                    <small
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      Selector del elemento que contiene el título. Ej:{" "}
                      <code>h2 a</code>, <code>.title</code>
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Selector de imagen</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.selectors.image || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selectors: {
                            ...formData.selectors,
                            image: e.target.value,
                          },
                        })
                      }
                      placeholder="img, .thumbnail img"
                    />
                    <small
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      Selector de la imagen destacada (opcional)
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Selector del autor</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.selectors.author || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selectors: {
                            ...formData.selectors,
                            author: e.target.value,
                          },
                        })
                      }
                      placeholder=".author, .by-author"
                    />
                    <small
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      Selector del nombre del autor (opcional)
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Selector del contenido</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.selectors.content || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selectors: {
                            ...formData.selectors,
                            content: e.target.value,
                          },
                        })
                      }
                      placeholder=".article-body, .entry-content"
                    />
                    <small
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      Selector del contenido del artículo (opcional)
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSource ? "💾 Guardar Cambios" : "➕ Crear Fuente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sources;
