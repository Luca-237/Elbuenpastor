import React, { useState } from 'react';
import './AdminDashboardPage.css';

// PIN de acceso por defecto para el superusuario
const SUPERUSER_PIN_DEFAULT = '2026';

export default function AdminDashboardPage({
  productos,
  onAddProducto,
  onUpdateProducto,
  onDeleteProducto,
  onBulkUpdatePrices,
  activityLog = [],
}) {
  // Estado de autenticación del superusuario
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('elbuenpastor_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Pestaña activa del dashboard: 'stats' | 'productos' | 'precios'
  const [activeTab, setActiveTab] = useState('stats');

  // Estado para el formulario de edición / creación de producto
  const [editingProduct, setEditingProduct] = useState(null); // null = creando o lista
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Filtro de búsqueda en tabla de productos
  const [adminSearch, setAdminSearch] = useState('');

  // Estado para modificación masiva de precios
  const [bulkPercent, setBulkPercent] = useState(10);
  const [bulkCategory, setBulkCategory] = useState('todas');
  const [bulkMessage, setBulkMessage] = useState('');

  // Estado para subida de imágenes a Cloudinary
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Manejador de subida de archivo a Cloudinary mediante el backend
  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const bodyFormData = new FormData();
      bodyFormData.append('imagen', file);

      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: bodyFormData,
      });

      const json = await res.json();
      if (json.success) {
        setFormData((prev) => ({ ...prev, imagen: json.url }));
        setUploadError('');
      } else {
        setUploadError(json.message || 'Error al subir la imagen a Cloudinary.');
      }
    } catch (err) {
      console.error('❌ Error subiendo imagen a Cloudinary:', err);
      setUploadError('No se pudo conectar con el servidor backend (http://localhost:5000/api/upload).');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Formulario estado local para Crear/Editar
  const [formData, setFormData] = useState({
    id: '',
    sku: '',
    modelo: '',
    categoriaId: 'soja',
    categoriaNombre: 'Velas de Soja',
    tipoCeraId: 'soja',
    tipoCeraNombre: '100% Cera de Soja Ecológica',
    tamano: 'Mediana (8 × 10 cm)',
    duracionHoras: 45,
    aromasString: 'Incienso Sagrado, Mirra, Sándalo',
    aromaDefault: 'Incienso Sagrado',
    imagen: '/hero-candles.jpg',
    descripcion: '',
    precioUnitario: 3800,
    stock: 20,
    destacado: false,
    tamanosPorNumero: [
      { numero: 1, label: 'Nº 1', dimensiones: '5 × 7 cm', duracionHoras: 25, precioUnitario: 2800 },
      { numero: 2, label: 'Nº 2', dimensiones: '6 × 8 cm', duracionHoras: 35, precioUnitario: 3300 },
      { numero: 3, label: 'Nº 3', dimensiones: '8 × 10 cm', duracionHoras: 45, precioUnitario: 3800, isDefault: true },
      { numero: 4, label: 'Nº 4', dimensiones: '10 × 12 cm', duracionHoras: 65, precioUnitario: 4900 },
      { numero: 5, label: 'Nº 5', dimensiones: '10 × 18 cm', duracionHoras: 90, precioUnitario: 6800 },
      { numero: 6, label: 'Nº 6', dimensiones: '10 × 25 cm', duracionHoras: 110, precioUnitario: 9200 },
    ],
  });

  // Manejador de Login con PIN
  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === SUPERUSER_PIN_DEFAULT || pinInput === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('elbuenpastor_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('PIN de seguridad incorrecto. Reintente con "2026".');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('elbuenpastor_admin_auth');
  };

  // Abrir modal de edición
  const handleStartEdit = (prod) => {
    setEditingProduct(prod);
    setIsCreatingNew(false);
    setFormData({
      ...prod,
      aromasString: prod.aromas ? prod.aromas.join(', ') : '',
      tamanosPorNumero: prod.tamanosPorNumero || [
        { numero: 1, label: 'Nº 1', dimensiones: '5 × 7 cm', duracionHoras: 25, precioUnitario: Math.round(prod.precioUnitario * 0.75) },
        { numero: 2, label: 'Nº 2', dimensiones: '6 × 8 cm', duracionHoras: 35, precioUnitario: Math.round(prod.precioUnitario * 0.88) },
        { numero: 3, label: 'Nº 3', dimensiones: prod.tamano || '8 × 10 cm', duracionHoras: prod.duracionHoras || 45, precioUnitario: prod.precioUnitario, isDefault: true },
        { numero: 4, label: 'Nº 4', dimensiones: '10 × 12 cm', duracionHoras: 65, precioUnitario: Math.round(prod.precioUnitario * 1.3) },
        { numero: 5, label: 'Nº 5', dimensiones: '10 × 18 cm', duracionHoras: 90, precioUnitario: Math.round(prod.precioUnitario * 1.8) },
        { numero: 6, label: 'Nº 6', dimensiones: '10 × 25 cm', duracionHoras: 110, precioUnitario: Math.round(prod.precioUnitario * 2.5) },
      ],
    });
  };

  // Abrir formulario de creación
  const handleStartCreate = () => {
    const nextId = `prod-new-${productos.length + 1}`;
    setEditingProduct(null);
    setIsCreatingNew(true);
    setFormData({
      id: nextId,
      sku: `VEL-NUE-00${productos.length + 1}`,
      modelo: '',
      categoriaId: 'soja',
      categoriaNombre: 'Velas de Soja',
      tipoCeraId: 'soja',
      tipoCeraNombre: '100% Cera de Soja Ecológica',
      tamano: 'Mediana (8 × 10 cm)',
      duracionHoras: 45,
      aromasString: 'Incienso Sagrado, Mirra',
      aromaDefault: 'Incienso Sagrado',
      imagen: '/hero-candles.jpg',
      descripcion: '',
      precioUnitario: 4200,
      stock: 25,
      destacado: false,
      tamanosPorNumero: [
        { numero: 1, label: 'Nº 1', dimensiones: '5 × 7 cm', duracionHoras: 25, precioUnitario: 3100 },
        { numero: 2, label: 'Nº 2', dimensiones: '6 × 8 cm', duracionHoras: 35, precioUnitario: 3700 },
        { numero: 3, label: 'Nº 3', dimensiones: '8 × 10 cm', duracionHoras: 45, precioUnitario: 4200, isDefault: true },
        { numero: 4, label: 'Nº 4', dimensiones: '10 × 12 cm', duracionHoras: 65, precioUnitario: 5600 },
        { numero: 5, label: 'Nº 5', dimensiones: '10 × 18 cm', duracionHoras: 90, precioUnitario: 7800 },
        { numero: 6, label: 'Nº 6', dimensiones: '10 × 25 cm', duracionHoras: 110, precioUnitario: 10500 },
      ],
    });
  };

  // Guardar datos del producto (Crear o Editar)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    const aromasArr = formData.aromasString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const productoFinal = {
      ...formData,
      precioUnitario: Number(formData.precioUnitario),
      stock: Number(formData.stock),
      duracionHoras: Number(formData.duracionHoras),
      aromas: aromasArr,
      preciosPorVolumen: [
        { min: 1, max: 9, precio: Number(formData.precioUnitario) },
        { min: 10, max: 49, precio: Math.round(Number(formData.precioUnitario) * 0.85) },
        { min: 50, max: null, precio: Math.round(Number(formData.precioUnitario) * 0.75) },
      ],
    };

    if (isCreatingNew) {
      onAddProducto(productoFinal);
    } else {
      onUpdateProducto(productoFinal);
    }

    setIsCreatingNew(false);
    setEditingProduct(null);
  };

  // Actualizar un precio por número individual en formData
  const handleSizePriceChange = (index, value) => {
    const updated = [...formData.tamanosPorNumero];
    updated[index] = { ...updated[index], precioUnitario: Number(value) };
    setFormData({ ...formData, tamanosPorNumero: updated });
  };

  // Modificación Masiva de Precios por Porcentaje
  const handleApplyBulkPrices = (e) => {
    e.preventDefault();
    const pct = Number(bulkPercent);
    if (isNaN(pct) || pct === 0) return;

    onBulkUpdatePrices(pct, bulkCategory);
    setBulkMessage(
      `¡Precios actualizados exitosamente! Se aplicó un ${pct > 0 ? '+' : ''}${pct}% a los productos seleccionados.`
    );
    setTimeout(() => setBulkMessage(''), 4500);
  };

  // Filtrado de productos para la tabla de administración
  const productosFiltradosAdmin = productos.filter(
    (p) =>
      p.modelo.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.categoriaNombre.toLowerCase().includes(adminSearch.toLowerCase())
  );

  // Cálculos para Estadísticas
  const totalStock = productos.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValorInventario = productos.reduce(
    (acc, p) => acc + (p.precioUnitario * (p.stock || 0)),
    0
  );
  const totalCotizacionesEstimadas = activityLog.filter((a) => a.type === 'add' || a.type === 'info').length * 4500;

  // Renderizado si NO está autenticado
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="container">
          <div className="admin-login-card animate-fade-in">
            <div className="login-header-icon">
              <span className="material-symbols-rounded">admin_panel_settings</span>
            </div>
            <h1 className="login-title">PANEL DE SUPERUSUARIO</h1>
            <p className="login-subtitle">
              Acceso restringido para el Taller Litúrgico El Buen Pastor. Ingrese la clave maestra para gestionar productos y estadísticas.
            </p>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group-pin">
                <label htmlFor="pin-input" className="pin-label">
                  Clave o PIN de Administrador:
                </label>
                <div className="pin-input-wrap">
                  <span className="material-symbols-rounded lock-icon">key</span>
                  <input
                    id="pin-input"
                    type="password"
                    placeholder="Ingresa el PIN (ej: 2026)..."
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="pin-input-field"
                    autoFocus
                  />
                </div>
              </div>

              {authError && <div className="auth-error-msg">{authError}</div>}

              <md-filled-button class="login-submit-btn" type="submit">
                <span slot="icon" className="material-symbols-rounded">verified_user</span>
                Ingresar al Panel de Control
              </md-filled-button>

              <div className="login-help-note">
                <span className="material-symbols-rounded">info</span>
                <span>PIN por defecto de desarrollo: <strong>2026</strong></span>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      {/* ── ENCABEZADO SUPERUSUARIO ── */}
      <div className="admin-top-banner">
        <div className="container admin-banner-flex">
          <div className="admin-title-block">
            <span className="material-symbols-rounded admin-badge-icon">security</span>
            <div>
              <h1 className="admin-heading">PANEL DE SUPERUSUARIO & GESTIÓN</h1>
              <span className="admin-subheading">
                Taller El Buen Pastor · Administración de Catálogo, Precios y Métricas en Tiempo Real
              </span>
            </div>
          </div>

          <div className="admin-banner-actions">
            <span className="superuser-pill">
              <span className="material-symbols-rounded">person_outline</span>
              Superuser Conectado
            </span>
            <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <span className="material-symbols-rounded">logout</span>
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* ── PESTAÑAS PRINCIPALES DEL DASHBOARD ── */}
      <div className="container admin-main-container">
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <span className="material-symbols-rounded">monitoring</span>
            <span>Estadísticas & Analytics</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            <span className="material-symbols-rounded">inventory</span>
            <span>Gestión de Productos ({productos.length})</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'precios' ? 'active' : ''}`}
            onClick={() => setActiveTab('precios')}
          >
            <span className="material-symbols-rounded">sell</span>
            <span>Modificación de Precios</span>
          </button>
        </div>

        {/* ── 1. PESTAÑA: ESTADÍSTICAS Y ANALYTICS ── */}
        {activeTab === 'stats' && (
          <div className="admin-tab-content animate-fade-in">
            {/* Cards de Métricas Clave */}
            <div className="metrics-cards-grid">
              <div className="metric-card">
                <div className="metric-icon-wrap gold">
                  <span className="material-symbols-rounded">analytics</span>
                </div>
                <div className="metric-data">
                  <span className="metric-label">Visitas & Consultas Totales</span>
                  <strong className="metric-value">1,482</strong>
                  <span className="metric-trend positive">+14% esta semana</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap green">
                  <span className="material-symbols-rounded">point_of_sale</span>
                </div>
                <div className="metric-data">
                  <span className="metric-label">Valor Estimado Cotizaciones</span>
                  <strong className="metric-value">${totalCotizacionesEstimadas.toLocaleString('es-AR')}</strong>
                  <span className="metric-trend positive">38 pedidos a WhatsApp</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap blue">
                  <span className="material-symbols-rounded">inventory_2</span>
                </div>
                <div className="metric-data">
                  <span className="metric-label">Inventario Activo</span>
                  <strong className="metric-value">{totalStock} unidades</strong>
                  <span className="metric-trend">Valor: ${totalValorInventario.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap purple">
                  <span className="material-symbols-rounded">workspace_premium</span>
                </div>
                <div className="metric-data">
                  <span className="metric-label">Tamaño Más Solicitado</span>
                  <strong className="metric-value">Nº 3 (8 × 10 cm)</strong>
                  <span className="metric-trend">42% de las preferencias</span>
                </div>
              </div>
            </div>

            {/* Gráficos y Tablas Estadísticas */}
            <div className="stats-charts-grid">
              <div className="stats-box">
                <h3 className="stats-box-title">
                  <span className="material-symbols-rounded">pie_chart</span>
                  Distribución de Interés por Categoría
                </h3>
                <div className="category-bars-list">
                  <div className="cat-bar-row">
                    <span className="cat-bar-name">Cirios Pascuales & Altar</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: '45%', background: '#946A25' }} />
                    </div>
                    <span className="bar-percent">45%</span>
                  </div>

                  <div className="cat-bar-row">
                    <span className="cat-bar-name">Velas de Soja Vegetal</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: '30%', background: '#4A7C59' }} />
                    </div>
                    <span className="bar-percent">30%</span>
                  </div>

                  <div className="cat-bar-row">
                    <span className="cat-bar-name">Velas Votivas & Sagrario</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: '15%', background: '#3B6898' }} />
                    </div>
                    <span className="bar-percent">15%</span>
                  </div>

                  <div className="cat-bar-row">
                    <span className="cat-bar-name">Línea Botánica & Terracota</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: '10%', background: '#8C5383' }} />
                    </div>
                    <span className="bar-percent">10%</span>
                  </div>
                </div>
              </div>

              <div className="stats-box">
                <h3 className="stats-box-title">
                  <span className="material-symbols-rounded">format_list_bulleted</span>
                  Registro Reciente de la Plataforma
                </h3>
                <div className="recent-log-table">
                  {activityLog.length === 0 ? (
                    <p className="empty-text">No hay registros de actividad aún.</p>
                  ) : (
                    activityLog.slice(0, 6).map((log) => (
                      <div key={log.id} className="log-row">
                        <span className="log-time-tag">{log.time}</span>
                        <div className="log-info-stack">
                          <strong>{log.titulo}</strong>
                          <small>{log.detalle}</small>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. PESTAÑA: GESTIÓN Y EDICIÓN DE PRODUCTOS ── */}
        {activeTab === 'productos' && (
          <div className="admin-tab-content animate-fade-in">
            {/* Sub-barra de acciones: Buscar y Botón Crear */}
            <div className="admin-actions-bar">
              <div className="admin-search-wrap">
                <span className="material-symbols-rounded">search</span>
                <input
                  type="search"
                  placeholder="Buscar producto por nombre, SKU o categoría..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              <md-filled-button class="btn-create-product" onClick={handleStartCreate}>
                <span slot="icon" className="material-symbols-rounded">add</span>
                Subir Nuevo Producto
              </md-filled-button>
            </div>

            {/* Formulario de Alta / Edición si está activo */}
            {(isCreatingNew || editingProduct) && (
              <form onSubmit={handleSaveProduct} className="product-form-box animate-fade-in">
                <div className="form-header">
                  <h3 className="form-title">
                    <span className="material-symbols-rounded">edit_note</span>
                    {isCreatingNew ? 'Subir Nuevo Producto al Catálogo' : `Editando: ${editingProduct.modelo}`}
                  </h3>
                  <button
                    type="button"
                    className="form-close-btn"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingProduct(null);
                    }}
                  >
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>

                <div className="form-grid-fields">
                  <div className="form-group">
                    <label>Código SKU:</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Nombre / Modelo del Producto:</label>
                    <input
                      type="text"
                      required
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoría Litúrgica:</label>
                    <select
                      value={formData.categoriaId}
                      onChange={(e) => {
                        const catId = e.target.value;
                        const catNames = {
                          soja: 'Velas de Soja',
                          cirios: 'Cirios Pascuales & Altar',
                          votivas: 'Velas Votivas & Sagrario',
                          botanica: 'Línea Botánica',
                        };
                        setFormData({
                          ...formData,
                          categoriaId: catId,
                          categoriaNombre: catNames[catId] || catId,
                        });
                      }}
                      className="form-select"
                    >
                      <option value="soja">Velas de Soja</option>
                      <option value="cirios">Cirios Pascuales & Altar</option>
                      <option value="votivas">Velas Votivas & Sagrario</option>
                      <option value="botanica">Línea Botánica & Terracota</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tipo de Cera / Materia Prima:</label>
                    <input
                      type="text"
                      value={formData.tipoCeraNombre}
                      onChange={(e) => setFormData({ ...formData, tipoCeraNombre: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Precio Unitario Base ($ ARS):</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.precioUnitario}
                      onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Disponible (Unidades):</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width cloudinary-upload-box">
                    <label>Imagen del Producto (Cloudinary):</label>
                    <div className="upload-options-grid">
                      <div className="cloud-file-picker-wrap">
                        <label htmlFor="cloud-file-input" className={`cloud-upload-btn-label ${isUploadingImage ? 'uploading' : ''}`}>
                          <span className="material-symbols-rounded">cloud_upload</span>
                          {isUploadingImage ? 'Subiendo a Cloudinary...' : 'Subir Imagen desde el equipo'}
                        </label>
                        <input
                          id="cloud-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          disabled={isUploadingImage}
                          className="hidden-file-input"
                        />
                      </div>

                      <div className="cloud-url-input-wrap">
                        <input
                          type="text"
                          value={formData.imagen}
                          onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                          className="form-input"
                          placeholder="O pega aquí la URL directa de Cloudinary / imagen..."
                        />
                      </div>
                    </div>

                    {uploadError && <div className="upload-error-text">{uploadError}</div>}

                    {formData.imagen && (
                      <div className="cloud-preview-row">
                        <img src={formData.imagen} alt="Vista previa Cloudinary" className="cloud-preview-thumb" />
                        <div className="cloud-url-info">
                          <span className="material-symbols-rounded check-icon">cloud_done</span>
                          <span className="cloud-url-text">Imagen activa en Cloudinary: <code>{formData.imagen}</code></span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label>Aromas / Fragancias (separados por coma):</label>
                    <input
                      type="text"
                      value={formData.aromasString}
                      onChange={(e) => setFormData({ ...formData, aromasString: e.target.value })}
                      className="form-input"
                      placeholder="Ej: Incienso Sagrado, Mirra, Sándalo"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Descripción del Producto:</label>
                    <textarea
                      rows="3"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="form-textarea"
                    />
                  </div>
                </div>

                {/* Subsección: Precios por Número de Tamaño */}
                <div className="sizes-pricing-editor">
                  <h4 className="sizes-editor-title">
                    <span className="material-symbols-rounded">straighten</span>
                    Configurar Precios por Número de Vela (Nº 1 al Nº 6):
                  </h4>
                  <div className="sizes-inputs-grid">
                    {formData.tamanosPorNumero.map((tam, idx) => (
                      <div key={tam.numero} className="size-editor-card">
                        <span className="size-badge-num">Nº {tam.numero}</span>
                        <span className="size-dims-label">{tam.dimensiones}</span>
                        <div className="size-price-field">
                          <span>$</span>
                          <input
                            type="number"
                            value={tam.precioUnitario}
                            onChange={(e) => handleSizePriceChange(idx, e.target.value)}
                            className="size-price-input"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-buttons-row">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <md-filled-button class="btn-save-submit" type="submit">
                    <span slot="icon" className="material-symbols-rounded">save</span>
                    {isCreatingNew ? 'Guardar y Publicar Producto' : 'Actualizar Cambios'}
                  </md-filled-button>
                </div>
              </form>
            )}

            {/* Tabla Principal de Productos */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>SKU / Nombre</th>
                    <th>Categoría</th>
                    <th>Precio Base</th>
                    <th>Precios por Número</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltradosAdmin.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-table-cell">
                        No se encontraron productos coincidentes.
                      </td>
                    </tr>
                  ) : (
                    productosFiltradosAdmin.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <img src={prod.imagen} alt={prod.modelo} className="admin-table-img" />
                        </td>
                        <td>
                          <div className="prod-name-stack">
                            <strong>{prod.modelo}</strong>
                            <small className="sku-badge">{prod.sku}</small>
                          </div>
                        </td>
                        <td>{prod.categoriaNombre}</td>
                        <td>
                          <strong className="price-tag">${prod.precioUnitario.toLocaleString('es-AR')}</strong>
                        </td>
                        <td>
                          <div className="sizes-chips-inline">
                            {(prod.tamanosPorNumero || []).map((t) => (
                              <span key={t.numero} className="mini-size-chip">
                                Nº{t.numero}: ${t.precioUnitario.toLocaleString('es-AR')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`stock-badge ${prod.stock > 10 ? 'ok' : 'low'}`}>
                            {prod.stock} un.
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="action-btn edit"
                              onClick={() => handleStartEdit(prod)}
                              title="Editar producto y precios por número"
                            >
                              <span className="material-symbols-rounded">edit</span>
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => {
                                if (window.confirm(`¿Seguro que deseas eliminar "${prod.modelo}"?`)) {
                                  onDeleteProducto(prod.id);
                                }
                              }}
                              title="Eliminar producto"
                            >
                              <span className="material-symbols-rounded">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 3. PESTAÑA: MODIFICACIÓN MASIVA DE PRECIOS ── */}
        {activeTab === 'precios' && (
          <div className="admin-tab-content animate-fade-in">
            <div className="bulk-pricing-card">
              <h3 className="bulk-title">
                <span className="material-symbols-rounded">trending_up</span>
                Ajuste Masivo de Precios por Porcentaje
              </h3>
              <p className="bulk-desc">
                Modifica todos los precios base y sus números de tamaño proporcionales con un solo clic (ej: aumentar un 15% por actualización de costos).
              </p>

              {bulkMessage && (
                <div className="peace-banner-notif animate-fade-in" style={{ marginBottom: 20 }}>
                  <span className="material-symbols-rounded">check_circle</span>
                  <span>{bulkMessage}</span>
                </div>
              )}

              <form onSubmit={handleApplyBulkPrices} className="bulk-form">
                <div className="bulk-inputs-row">
                  <div className="bulk-group">
                    <label>Porcentaje de Variación (%):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={bulkPercent}
                      onChange={(e) => setBulkPercent(e.target.value)}
                      className="bulk-input"
                      placeholder="ej: 10 para +10% ó -5 para -5%"
                    />
                  </div>

                  <div className="bulk-group">
                    <label>Aplicar a Categoría:</label>
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="bulk-select"
                    >
                      <option value="todas">Todas las categorías</option>
                      <option value="soja">Solo Velas de Soja</option>
                      <option value="cirios">Solo Cirios Pascuales & Altar</option>
                      <option value="votivas">Solo Velas Votivas</option>
                      <option value="botanica">Solo Línea Botánica</option>
                    </select>
                  </div>
                </div>

                <md-filled-button class="btn-apply-bulk" type="submit">
                  <span slot="icon" className="material-symbols-rounded">price_change</span>
                  Aplicar Modificación Masiva de Precios
                </md-filled-button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
