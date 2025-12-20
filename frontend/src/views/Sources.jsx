import { useState, useEffect } from "react";
import * as api from "../services/api";
import { getFaviconUrl } from "../utils/helpers";
import CronVisualizer from "../components/CronVisualizer";

function Sources({ toast }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
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

  async function loadTemplates() {
    try {
      setLoadingTemplates(true);
      const result = await api.getTemplates();
      setTemplates(result.data || {});
    } catch (error) {
      toast.error("Error al cargar plantillas");
    } finally {
      setLoadingTemplates(false);
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
    }
    setShowModal(true);
  }

  function openTemplatesModal() {
    setShowTemplatesModal(true);
    loadTemplates();
  }

  async function handleAddTemplate(template) {
    try {
      const sourceData = {
        name: template.name,
        url: template.url,
        schedule: template.schedule || "0 */6 * * *",
        enabled: true,
        selectors: template.selectors,
      };
      await api.createSource(sourceData);
      toast.success(`Fuente "${template.name}" agregada`);
      setShowTemplatesModal(false);
      loadSources();
    } catch (error) {
      toast.error(error.message || "Error al agregar plantilla");
    }
  }

  async function handleAddMultipleTemplates(templatesArray) {
    if (
      !confirm(`¿Agregar las ${templatesArray.length} fuentes de esta sección?`)
    )
      return;

    try {
      toast.info(`Agregando ${templatesArray.length} fuentes...`);
      let count = 0;
      for (const template of templatesArray) {
        try {
          const sourceData = {
            name: template.name,
            url: template.url,
            schedule: template.schedule || "0 */6 * * *",
            enabled: true,
            selectors: template.selectors,
          };
          await api.createSource(sourceData);
          count++;
        } catch (err) {
          console.warn(`Saltando ${template.name}: ${err.message}`);
        }
      }
      toast.success(`${count} fuentes agregadas correctamente`);
      setShowTemplatesModal(false);
      loadSources();
    } catch (error) {
      toast.error("Error al procesar la agregación masiva");
      loadSources();
    }
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
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => openTemplatesModal()}
          >
            ⚡ Usar Plantilla
          </button>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Nueva Fuente
          </button>
        </div>
      </div>

      {sources.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🌐</div>
            <h3>No hay fuentes configuradas</h3>
            <p>Agrega tu primera fuente de noticias</p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => openTemplatesModal()}
              >
                ⚡ Usar Plantilla
              </button>
              <button className="btn btn-primary" onClick={() => openModal()}>
                + Nueva Fuente
              </button>
            </div>
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

      {/* Modal de Edición/Creación */}
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
                    ⏰ Programación (Scheduler)
                  </h3>

                  <div className="form-group">
                    <CronVisualizer 
                      value={formData.schedule} 
                      onChange={(val) => setFormData({ ...formData, schedule: val })} 
                    />
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

      {/* Modal de Plantillas */}
      {showTemplatesModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowTemplatesModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "900px" }}
          >
            <div className="modal-header">
              <h2 className="modal-title">⚡ Plantillas de Fuentes</h2>
              <button
                className="modal-close"
                onClick={() => setShowTemplatesModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {loadingTemplates ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="templates-container">
                  <p className="modal-description">
                    Selecciona una plantilla pre-configurada para agregar
                    rápidamente una fuente de noticias.
                  </p>

                  <div className="template-sections">
                    {Object.entries(templates).map(([key, items]) => {
                      if (!items || items.length === 0) return null;

                      const sectionMap = {
                        trending: { title: "📈 Trending Topics", icon: "📈" },
                        releases: {
                          title: "🚀 Lanzamientos y Versiones",
                          icon: "🚀",
                        },
                        newsletters: {
                          title: "📬 Newsletters Semanales",
                          icon: "📬",
                        },
                        popular: { title: "🔥 Por Relevancia", icon: "🔥" },
                        spanish: { title: "🇪🇸 Tecnología en Español", icon: "🇪🇸" },
                      };

                      const config = sectionMap[key] || {
                        title: key,
                        icon: "🌐",
                      };

                      return (
                        <div key={key} className="nav-section">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              paddingBottom: "12px",
                              borderBottom: "1px solid var(--border-color)",
                              marginBottom: "16px",
                            }}
                          >
                            <h3
                              className="nav-section-title"
                              style={{
                                paddingLeft: 0,
                                paddingBottom: 0,
                                fontSize: "15px",
                                margin: 0,
                              }}
                            >
                              {config.title}
                            </h3>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                              onClick={() => handleAddMultipleTemplates(items)}
                            >
                              + Agregar Todo ({items.length})
                            </button>
                          </div>
                          <div className="templates-grid">
                            {items.map((template, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleAddTemplate(template)}
                                className="template-card-btn"
                              >
                                <div className="template-name">
                                  {template.name}
                                </div>
                                <div className="template-category">
                                  {template.category}
                                </div>
                                <div className="template-action">⚡ Agregar</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <style>{`
              .modal-description {
                font-size: 14px;
                color: var(--text-secondary);
                margin-bottom: 24px;
              }
              .templates-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 16px;
                margin-bottom: 32px;
              }
              .template-card-btn {
                padding: 16px;
                background: var(--bg-tertiary);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                cursor: pointer;
                text-align: left;
                transition: var(--transition-fast);
                display: flex;
                flex-direction: column;
                gap: 4px;
                position: relative;
                overflow: hidden;
              }
              .template-card-btn:hover {
                border-color: var(--accent-primary);
                transform: translateY(-2px);
                background: var(--bg-hover);
              }
              .template-name {
                font-weight: 600;
                color: var(--text-primary);
                font-size: 14px;
              }
              .template-category {
                font-size: 12px;
                color: var(--text-muted);
              }
              .template-action {
                margin-top: 8px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                color: var(--accent-primary);
                opacity: 0;
                transform: translateY(10px);
                transition: var(--transition-fast);
              }
              .template-card-btn:hover .template-action {
                opacity: 1;
                transform: translateY(0);
              }
            `}</style>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowTemplatesModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sources;
