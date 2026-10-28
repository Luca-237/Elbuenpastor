import React, { useState } from 'react';
import { formatMedidaDimension } from '../data/catalogoData';
import './AdminDashboardPage.css';

// PIN de acceso por defecto para el superusuario
const SUPERUSER_PIN_DEFAULT = '2026';

export default function AdminDashboardPage({
  productos = [],
  categories = [],
  onAddProducto,
  onUpdateProducto,
  onDeleteProducto,
  onRecategorizeProducto,
  onUpdatePrice,
  onBulkUpdatePrices,
  onRenameCategory,
  onAddCategory,
  onAddMeasureToCategory,
  onEditMeasureInCategory,
  onDeleteMeasureFromCategory,
  onResetCatalog,
  activityLog = [],
}) {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('elbuenpastor_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Pestaña activa: 'stats' | 'categories' | 'productos' | 'precios'
  const [activeTab, setActiveTab] = useState('categories');

  // Estado para búsqueda en tabla de productos
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('todas');

  // Notificación de éxito en el dashboard
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // ── ESTADOS PARA GESTIÓN DE CATEGORÍAS Y MEDIDAS ──
  // Modal de renombrar categoría
  const [editingCategory, setEditingCategory] = useState(null);
  const [renameForm, setRenameForm] = useState({ nombre: '', descripcion: '' });

  // Modal / Formulario para agregar o editar medida
  const [measureModalState, setMeasureModalState] = useState(null);
  // { mode: 'create'|'edit', categoryId: string, measureId?: string, data: { diametroMm, largoCm, duracionHoras, precioBase } }

  // Modal para crear nueva categoría
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatData, setNewCatData] = useState({ nombre: '', descripcion: '', icono: 'flare' });

  // ── ESTADOS PARA GESTIÓN DE PRODUCTOS ──
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Edición rápida de precio inline en tabla
  const [inlinePriceMap, setInlinePriceMap] = useState({});

  // Subida de imagen a Cloudinary
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Modificación masiva de precios
  const [bulkPercent, setBulkPercent] = useState(10);
  const [bulkCategory, setBulkCategory] = useState('todas');

  // Formulario local para Crear / Editar Producto
  const [formData, setFormData] = useState({
    id: '',
    sku: '',
    modelo: '',
    categoriaId: 'velas-liturgicas',
    categoriaNombre: 'Velas Litúrgicas',
    tipoCeraId: 'soja',
    tipoCeraNombre: 'Cera de Soja & Abejas Litúrgica',
    tamano: 'Ø 35 mm × 30 cm',
    duracionHoras: 28,
    aromasString: 'Cera Virgen Natural, Incienso Sagrado',
    aromaDefault: 'Cera Virgen Natural',
    imagen: '/hero-candles.jpg',
    descripcion: '',
    precioUnitario: 3900,
    stock: 25,
    destacado: false,
    tamanosPorNumero: [],
  });

  // Manejo de Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === SUPERUSER_PIN_DEFAULT || pinInput === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('elbuenpastor_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Clave incorrecta. PIN de desarrollo: 2026');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('elbuenpastor_admin_auth');
  };

  // Subida de imagen a Cloudinary
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
        showToast('¡Imagen subida a Cloudinary exitosamente!');
      } else {
        setUploadError(json.message || 'Error al subir la imagen.');
      }
    } catch (err) {
      setUploadError('No se pudo conectar con el servidor backend (http://localhost:5000/api/upload).');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ── ACCIONES: RENOMBRAR CATEGORÍA ──
  const handleStartRenameCategory = (cat) => {
    setEditingCategory(cat);
    setRenameForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
  };

  const handleSaveRenameCategory = (e) => {
    e.preventDefault();
    if (!renameForm.nombre.trim()) return;

    onRenameCategory(editingCategory.id, renameForm.nombre, renameForm.descripcion);
    setEditingCategory(null);
    showToast(`Categoría renombrada a "${renameForm.nombre}".`);
  };

  // ── ACCIONES: CREAR NUEVA CATEGORÍA ──
  const handleSaveNewCategory = (e) => {
    e.preventDefault();
    if (!newCatData.nombre.trim()) return;

    onAddCategory(newCatData);
    setIsCreatingCategory(false);
    setNewCatData({ nombre: '', descripcion: '', icono: 'flare' });
    showToast(`Nueva categoría "${newCatData.nombre}" creada.`);
  };

  // ── ACCIONES: AGREGAR / EDITAR MEDIDA ──
  const handleOpenCreateMeasure = (categoryId) => {
    setMeasureModalState({
      mode: 'create',
      categoryId,
      data: { diametroMm: 60, largoCm: 85, duracionHoras: 100, precioBase: 16000 },
    });
  };

  const handleOpenEditMeasure = (categoryId, measure) => {
    setMeasureModalState({
      mode: 'edit',
      categoryId,
      measureId: measure.id,
      data: {
        diametroMm: measure.diametroMm,
        largoCm: measure.largoCm,
        duracionHoras: measure.duracionHoras,
        precioBase: measure.precioBase || 15000,
      },
    });
  };

  const handleSaveMeasure = (e) => {
    e.preventDefault();
    const { mode, categoryId, measureId, data } = measureModalState;
    if (!data.diametroMm || !data.largoCm) return;

    if (mode === 'create') {
      onAddMeasureToCategory(categoryId, data);
      showToast(`Medida ${data.diametroMm} mm × ${data.largoCm} cm agregada.`);
    } else {
      onEditMeasureInCategory(categoryId, measureId, data);
      showToast(`Medida ${data.diametroMm} mm × ${data.largoCm} cm actualizada.`);
    }

    setMeasureModalState(null);
  };

  const handleDeleteMeasure = (categoryId, measureId, label) => {
    if (window.confirm(`¿Eliminar la medida "${label}" de esta categoría?`)) {
      onDeleteMeasureFromCategory(categoryId, measureId);
      showToast('Medida eliminada de la categoría.');
    }
  };

  // ── ACCIONES: PRODUCTOS ──
  const handleStartCreateProduct = () => {
    const defaultCat = categories[0] || { id: 'cirios', nombre: 'Cirios', medidas: [] };
    const defaultSizes = (defaultCat.medidas || []).map((m, idx) => ({
      numero: idx + 1,
      id: m.id,
      diametroMm: m.diametroMm,
      largoCm: m.largoCm,
      label: `${m.diametroMm} mm × ${m.largoCm} cm`,
      dimensiones: formatMedidaDimension(m.diametroMm, m.largoCm),
      duracionHoras: m.duracionHoras,
      precioUnitario: m.precioBase || 15000,
      isDefault: idx === 0,
    }));

    setEditingProduct(null);
    setIsCreatingNew(true);
    setFormData({
      id: `prod-new-${Date.now()}`,
      sku: `PROD-${Date.now().toString().slice(-4)}`,
      modelo: '',
      categoriaId: defaultCat.id,
      categoriaNombre: defaultCat.nombre,
      tipoCeraId: 'abeja',
      tipoCeraNombre: '100% Cera Virgen de Abejas',
      tamano: defaultSizes[0]?.dimensiones || 'Ø 50 mm × 85 cm',
      duracionHoras: defaultSizes[0]?.duracionHoras || 90,
      aromasString: 'Cera Virgen Natural, Incienso Sagrado',
      aromaDefault: 'Cera Virgen Natural',
      imagen: '/cirio-pascual.jpg',
      descripcion: '',
      precioUnitario: defaultSizes[0]?.precioUnitario || 15000,
      stock: 20,
      destacado: false,
      tamanosPorNumero: defaultSizes,
    });
  };

  const handleStartEditProduct = (prod) => {
    setEditingProduct(prod);
    setIsCreatingNew(false);
    setFormData({
      ...prod,
      aromasString: prod.aromas ? prod.aromas.join(', ') : '',
      tamanosPorNumero: prod.tamanosPorNumero || [],
    });
  };

  // Cambio de categoría dentro del formulario del producto
  const handleProductFormCategoryChange = (newCatId) => {
    const selectedCat = categories.find((c) => c.id === newCatId);
    if (!selectedCat) return;

    // Si la categoría tiene medidas estándar, sugerirlas
    let newSizes = formData.tamanosPorNumero;
    if (selectedCat.medidas && selectedCat.medidas.length > 0) {
      newSizes = selectedCat.medidas.map((m, idx) => ({
        numero: idx + 1,
        id: m.id,
        diametroMm: m.diametroMm,
        largoCm: m.largoCm,
        label: `${m.diametroMm} mm × ${m.largoCm} cm`,
        dimensiones: formatMedidaDimension(m.diametroMm, m.largoCm),
        duracionHoras: m.duracionHoras,
        precioUnitario: m.precioBase || formData.precioUnitario,
        isDefault: idx === 0,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      categoriaId: selectedCat.id,
      categoriaNombre: selectedCat.nombre,
      tamano: newSizes[0]?.dimensiones || prev.tamano,
      precioUnitario: newSizes[0]?.precioUnitario || prev.precioUnitario,
      tamanosPorNumero: newSizes,
    }));
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.modelo.trim()) return;

    const aromasArr = formData.aromasString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const basePrice = Number(formData.precioUnitario);

    const productoFinal = {
      ...formData,
      precioUnitario: basePrice,
      stock: Number(formData.stock),
      duracionHoras: Number(formData.duracionHoras),
      aromas: aromasArr,
      preciosPorVolumen: [
        { min: 1, max: 4, precio: basePrice },
        { min: 5, max: 19, precio: Math.round(basePrice * 0.88) },
        { min: 20, max: null, precio: Math.round(basePrice * 0.78) },
      ],
    };

    if (isCreatingNew) {
      onAddProducto(productoFinal);
      showToast(`Producto "${productoFinal.modelo}" creado exitosamente.`);
    } else {
      onUpdateProducto(productoFinal);
      showToast(`Producto "${productoFinal.modelo}" actualizado.`);
    }

    setIsCreatingNew(false);
    setEditingProduct(null);
  };

  // Manejo de tamaños dentro del formulario de producto
  const handleSizePriceChange = (index, newPrice) => {
    const updated = [...formData.tamanosPorNumero];
    updated[index] = { ...updated[index], precioUnitario: Number(newPrice) };
    setFormData((prev) => ({
      ...prev,
      tamanosPorNumero: updated,
      precioUnitario: index === 0 ? Number(newPrice) : prev.precioUnitario,
    }));
  };

  const handleRemoveSizeFromProduct = (index) => {
    const updated = formData.tamanosPorNumero.filter((_, idx) => idx !== index);
    setFormData((prev) => ({ ...prev, tamanosPorNumero: updated }));
  };

  const handleAddSizeToProduct = () => {
    const newSize = {
      numero: formData.tamanosPorNumero.length + 1,
      id: `custom-tam-${Date.now()}`,
      diametroMm: 60,
      largoCm: 85,
      label: '60 mm × 85 cm',
      dimensiones: 'Ø 60 mm × 85 cm',
      duracionHoras: 100,
      precioUnitario: Number(formData.precioUnitario) || 15000,
      isDefault: false,
    };
    setFormData((prev) => ({
      ...prev,
      tamanosPorNumero: [...prev.tamanosPorNumero, newSize],
    }));
  };

  // Edición rápida de precio inline en tabla
  const handleSaveInlinePrice = (prodId) => {
    const newPrice = inlinePriceMap[prodId];
    if (newPrice && !isNaN(newPrice)) {
      onUpdatePrice(prodId, Number(newPrice));
      showToast('Precio actualizado.');
      setInlinePriceMap((prev) => {
        const copy = { ...prev };
        delete copy[prodId];
        return copy;
      });
    }
  };

  // Aplicar ajuste masivo de precios
  const handleApplyBulkPrices = (e) => {
    e.preventDefault();
    const pct = Number(bulkPercent);
    if (isNaN(pct) || pct === 0) return;

    onBulkUpdatePrices(pct, bulkCategory);
    showToast(`Se aplicó ${pct > 0 ? '+' : ''}${pct}% a los productos seleccionados.`);
  };

  // Filtrado de productos para la tabla
  const productosFiltradosAdmin = productos.filter((p) => {
    const matchCat = adminCategoryFilter === 'todas' || p.categoriaId === adminCategoryFilter;
    const matchSearch =
      p.modelo.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.categoriaNombre.toLowerCase().includes(adminSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Métricas
  const totalStock = productos.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValorInventario = productos.reduce(
    (acc, p) => acc + p.precioUnitario * (p.stock || 0),
    0
  );

  // ── RENDER: LOGIN SI NO ESTÁ AUTENTICADO ──
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
              Acceso restringido para el Taller Litúrgico El Buen Pastor. Gestión de categorías canónicas, medidas físicas y precios.
            </p>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group-pin">
                <label htmlFor="pin-input" className="pin-label">
                  Clave o PIN de Superusuario:
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

              <button className="login-submit-btn" type="submit">
                <span className="material-symbols-rounded">verified_user</span>
                Ingresar al Panel de Control
              </button>

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
      {/* ── BANNER SUPERIOR DE SUPERUSUARIO ── */}
      <div className="admin-top-banner">
        <div className="container admin-banner-flex">
          <div className="admin-title-block">
            <span className="material-symbols-rounded admin-badge-icon">security</span>
            <div>
              <h1 className="admin-heading">PANEL DE SUPERUSUARIO & GOBERNANZA</h1>
              <span className="admin-subheading">
                Taller El Buen Pastor · Velas Litúrgicas, Velones y Cirios
              </span>
            </div>
          </div>

          <div className="admin-banner-actions">
            <button className="reset-catalog-btn" onClick={onResetCatalog} title="Restablecer datos originales">
              <span className="material-symbols-rounded">restart_alt</span>
              Restablecer Fábrica
            </button>
            <span className="superuser-pill">
              <span className="material-symbols-rounded">verified</span>
              Superuser Conectado
            </span>
            <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <span className="material-symbols-rounded">logout</span>
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notificación */}
      {toastMessage && (
        <div className="admin-toast-banner animate-fade-in">
          <span className="material-symbols-rounded">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── NAVEGACIÓN POR PESTAÑAS DEL DASHBOARD ── */}
      <div className="container admin-main-container">
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <span className="material-symbols-rounded">account_tree</span>
            <span>Categorías & Medidas ({categories.length})</span>
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
            <span>Control de Precios</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <span className="material-symbols-rounded">monitoring</span>
            <span>Métricas & Bitácora</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            PESTAÑA 1: CATEGORÍAS & MEDIDAS (REQUERIMIENTO PRINCIPAL)
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'categories' && (
          <div className="admin-tab-content animate-fade-in">
            <div className="section-intro-bar">
              <div>
                <h2 className="admin-subhead-title">Categorización Canónica y Medidas Estandarizadas</h2>
                <p className="admin-subhead-desc">
                  Administra las 3 categorías generales (Velas Litúrgicas, Velones y Cirios), sus nombres oficiales y las medidas en <strong>diámetro (mm)</strong> y <strong>largo (cm)</strong>.
                </p>
              </div>
              <button
                type="button"
                className="admin-primary-btn"
                onClick={() => setIsCreatingCategory(true)}
              >
                <span className="material-symbols-rounded">add_circle</span>
                Nueva Categoría
              </button>
            </div>

            {/* Grid de Tarjetas de Categorías */}
            <div className="categories-admin-grid">
              {categories.map((cat) => {
                const prodsEnCat = productos.filter((p) => p.categoriaId === cat.id);

                return (
                  <div key={cat.id} className="category-admin-card">
                    {/* Header de la categoría */}
                    <div className="cat-card-header">
                      <div className="cat-card-title-group">
                        <span className="material-symbols-rounded cat-icon">
                          {cat.icono || 'flare'}
                        </span>
                        <div>
                          <h3 className="cat-card-title">{cat.nombre}</h3>
                          <span className="cat-card-slug">ID: {cat.id} · {prodsEnCat.length} productos</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="cat-rename-btn"
                        onClick={() => handleStartRenameCategory(cat)}
                        title="Renombrar categoría"
                      >
                        <span className="material-symbols-rounded">edit</span>
                        Renombrar
                      </button>
                    </div>

                    <p className="cat-card-desc">{cat.descripcion}</p>

                    {/* Tabla de Medidas Estandarizadas */}
                    <div className="cat-measures-block">
                      <div className="cat-measures-header">
                        <span className="measures-title">
                          <span className="material-symbols-rounded">straighten</span>
                          Medidas Estandarizadas ({cat.medidas?.length || 0})
                        </span>
                        <button
                          type="button"
                          className="add-measure-btn"
                          onClick={() => handleOpenCreateMeasure(cat.id)}
                        >
                          <span className="material-symbols-rounded">add</span>
                          Agregar Medida
                        </button>
                      </div>

                      {(!cat.medidas || cat.medidas.length === 0) ? (
                        <div className="no-measures-box">
                          <p>No hay medidas asignadas aún. Haz clic en "Agregar Medida" para configurar diámetros en mm y largos en cm.</p>
                        </div>
                      ) : (
                        <div className="measures-table-wrap">
                          <table className="measures-table">
                            <thead>
                              <tr>
                                <th>Diámetro</th>
                                <th>Largo / Altura</th>
                                <th>Formato</th>
                                <th>Duración</th>
                                <th>Precio Base</th>
                                <th className="text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cat.medidas.map((m) => (
                                <tr key={m.id}>
                                  <td>
                                    <span className="dim-tag-badge diam">Ø {m.diametroMm} mm</span>
                                  </td>
                                  <td>
                                    <span className="dim-tag-badge len">↕ {m.largoCm} cm</span>
                                  </td>
                                  <td className="measure-name-col">
                                    <strong>{m.diametroMm} mm × {m.largoCm} cm</strong>
                                  </td>
                                  <td>~{m.duracionHoras}h</td>
                                  <td className="price-col">
                                    ${(m.precioBase || 0).toLocaleString('es-AR')}
                                  </td>
                                  <td className="text-right">
                                    <div className="table-row-actions">
                                      <button
                                        type="button"
                                        className="action-icon-btn edit"
                                        onClick={() => handleOpenEditMeasure(cat.id, m)}
                                        title="Editar medida"
                                      >
                                        <span className="material-symbols-rounded">edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="action-icon-btn delete"
                                        onClick={() => handleDeleteMeasure(cat.id, m.id, `${m.diametroMm} mm × ${m.largoCm} cm`)}
                                        title="Eliminar medida"
                                      >
                                        <span className="material-symbols-rounded">delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PESTAÑA 2: GESTIÓN DE PRODUCTOS (CRUD + RECATEGORIZACIÓN)
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'productos' && (
          <div className="admin-tab-content animate-fade-in">
            {/* Barra de Controles y Búsqueda */}
            <div className="products-table-toolbar">
              <div className="toolbar-search-wrap">
                <span className="material-symbols-rounded">search</span>
                <input
                  type="text"
                  placeholder="Buscar por modelo, SKU o categoría..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              <div className="toolbar-filter-wrap">
                <label htmlFor="filter-cat-admin">Filtrar Categoría:</label>
                <select
                  id="filter-cat-admin"
                  value={adminCategoryFilter}
                  onChange={(e) => setAdminCategoryFilter(e.target.value)}
                  className="admin-cat-select"
                >
                  <option value="todas">Todas las categorías ({productos.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="admin-primary-btn"
                onClick={handleStartCreateProduct}
              >
                <span className="material-symbols-rounded">add</span>
                Agregar Producto
              </button>
            </div>

            {/* Tabla de Productos con Recategorización y Precio Rápido */}
            <div className="admin-table-container">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Producto / SKU</th>
                    <th>Categoría & Recategorizar</th>
                    <th>Medidas Disponibles</th>
                    <th>Precio Base (Edición Rápida)</th>
                    <th>Stock</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltradosAdmin.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="table-empty-cell">
                        No se encontraron productos coincidentes.
                      </td>
                    </tr>
                  ) : (
                    productosFiltradosAdmin.map((prod) => {
                      const tallas = prod.tamanosPorNumero || [];
                      const isEditingInline = inlinePriceMap[prod.id] !== undefined;

                      return (
                        <tr key={prod.id}>
                          {/* Producto e imagen */}
                          <td>
                            <div className="table-product-cell">
                              <img src={prod.imagen} alt={prod.modelo} className="table-prod-thumb" />
                              <div>
                                <strong className="table-prod-name">{prod.modelo}</strong>
                                <span className="table-prod-sku">{prod.sku}</span>
                              </div>
                            </div>
                          </td>

                          {/* Selector de Recategorización Inmediata */}
                          <td>
                            <div className="recategorize-cell">
                              <select
                                value={prod.categoriaId}
                                onChange={(e) => onRecategorizeProducto(prod.id, e.target.value)}
                                className="recategorize-select"
                                title="Cambiar categoría inmediatamente"
                              >
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.nombre}
                                  </option>
                                ))}
                              </select>
                              <span className="recategorize-hint">
                                <span className="material-symbols-rounded">swap_horiz</span>
                                Recategorizar
                              </span>
                            </div>
                          </td>

                          {/* Medidas disponibles */}
                          <td>
                            <div className="table-sizes-list">
                              {tallas.slice(0, 3).map((t, idx) => (
                                <span key={idx} className="table-size-tag">
                                  {t.diametroMm && t.largoCm
                                    ? `Ø ${t.diametroMm}×${t.largoCm}cm`
                                    : t.label || t.dimensiones}
                                </span>
                              ))}
                              {tallas.length > 3 && (
                                <span className="table-size-more">+{tallas.length - 3}</span>
                              )}
                            </div>
                          </td>

                          {/* Control de Precio Rápido Inline */}
                          <td>
                            <div className="inline-price-editor">
                              <span className="currency-symbol">$</span>
                              <input
                                type="number"
                                className="inline-price-input"
                                value={isEditingInline ? inlinePriceMap[prod.id] : prod.precioUnitario}
                                onChange={(e) =>
                                  setInlinePriceMap({
                                    ...inlinePriceMap,
                                    [prod.id]: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlinePrice(prod.id);
                                }}
                              />
                              {isEditingInline && (
                                <button
                                  type="button"
                                  className="save-inline-btn"
                                  onClick={() => handleSaveInlinePrice(prod.id)}
                                  title="Guardar nuevo precio"
                                >
                                  <span className="material-symbols-rounded">check</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Stock */}
                          <td>
                            <span className={`stock-badge ${prod.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                              {prod.stock} u.
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="text-right">
                            <div className="table-row-actions">
                              <button
                                type="button"
                                className="action-icon-btn edit"
                                onClick={() => handleStartEditProduct(prod)}
                                title="Editar producto completo y medidas"
                              >
                                <span className="material-symbols-rounded">tune</span>
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn delete"
                                onClick={() => {
                                  if (window.confirm(`¿Eliminar "${prod.modelo}" del catálogo?`)) {
                                    onDeleteProducto(prod.id);
                                    showToast('Producto eliminado.');
                                  }
                                }}
                                title="Eliminar producto"
                              >
                                <span className="material-symbols-rounded">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PESTAÑA 3: CONTROL DE PRECIOS & ESCALAS MASIVAS
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'precios' && (
          <div className="admin-tab-content animate-fade-in">
            <div className="pricing-control-layout">
              {/* Formulario de Modificación Masiva */}
              <div className="pricing-bulk-card">
                <div className="pricing-card-header">
                  <span className="material-symbols-rounded header-icon">percent</span>
                  <div>
                    <h3 className="pricing-card-title">Ajuste Masivo de Precios por Porcentaje</h3>
                    <p className="pricing-card-desc">
                      Aplica un incremento o descuento general a todos los productos o a una categoría litúrgica específica.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleApplyBulkPrices} className="bulk-price-form">
                  <div className="form-row-bulk">
                    <div className="form-field">
                      <label htmlFor="bulk-percent-input">Porcentaje de Ajuste (%):</label>
                      <input
                        id="bulk-percent-input"
                        type="number"
                        step="1"
                        placeholder="ej: 10 para +10%, -5 para descuento"
                        value={bulkPercent}
                        onChange={(e) => setBulkPercent(e.target.value)}
                        className="admin-input-field"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="bulk-category-select">Aplicar a Categoría:</label>
                      <select
                        id="bulk-category-select"
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value)}
                        className="admin-input-field"
                      >
                        <option value="todas">Todas las categorías del catálogo</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bulk-quick-pills">
                    <span>Ajustes rápidos:</span>
                    <button type="button" onClick={() => setBulkPercent(5)}>+5%</button>
                    <button type="button" onClick={() => setBulkPercent(10)}>+10%</button>
                    <button type="button" onClick={() => setBulkPercent(15)}>+15%</button>
                    <button type="button" onClick={() => setBulkPercent(20)}>+20%</button>
                    <button type="button" onClick={() => setBulkPercent(-5)}>-5%</button>
                  </div>

                  <button type="submit" className="admin-primary-btn apply-bulk-btn">
                    <span className="material-symbols-rounded">price_change</span>
                    Aplicar Variación de {bulkPercent > 0 ? `+${bulkPercent}` : bulkPercent}% Ahora
                  </button>
                </form>
              </div>

              {/* Lista de Precios Actuales con Escalas */}
              <div className="pricing-preview-table-card">
                <h3 className="preview-table-title">
                  <span className="material-symbols-rounded">table_rows</span>
                  Estructura de Precios Actual por Producto
                </h3>

                <div className="admin-table-container">
                  <table className="admin-products-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio Base (1 u.)</th>
                        <th>Mayorista (5+ u.)</th>
                        <th>Distribuidor (20+ u.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((p) => {
                        const tramos = p.preciosPorVolumen || [];
                        const tMayorista = tramos[1]?.precio || Math.round(p.precioUnitario * 0.88);
                        const tDistribuidor = tramos[2]?.precio || Math.round(p.precioUnitario * 0.78);

                        return (
                          <tr key={p.id}>
                            <td><strong>{p.modelo}</strong></td>
                            <td><span className="cat-pill-table">{p.categoriaNombre}</span></td>
                            <td><strong>${p.precioUnitario.toLocaleString('es-AR')}</strong></td>
                            <td className="text-green">${tMayorista.toLocaleString('es-AR')}</td>
                            <td className="text-gold">${tDistribuidor.toLocaleString('es-AR')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PESTAÑA 4: ESTADÍSTICAS & BITÁCORA
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'stats' && (
          <div className="admin-tab-content animate-fade-in">
            {/* Tarjetas de Métricas */}
            <div className="metrics-cards-grid">
              <div className="metric-card">
                <div className="metric-icon-wrap gold">
                  <span className="material-symbols-rounded">category</span>
                </div>
                <div className="metric-data">
                  <span className="metric-label">Líneas Litúrgicas Activas</span>
                  <strong className="metric-value">{categories.length} Categorías</strong>
                  <span className="metric-trend">Velas Litúrgicas, Velones y Cirios</span>
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
                <div className="metric-icon-wrap green">
                  <span className="material-symbols-rounded">straighten</span>
                </div>
                <div className="metric-data">
                  <span className="metric-label">Medidas Estandarizadas</span>
                  <strong className="metric-value">
                    {categories.reduce((acc, c) => acc + (c.medidas?.length || 0), 0)} tamaños
                  </strong>
                  <span className="metric-trend">Calibradas en mm y cm</span>
                </div>
              </div>
            </div>

            {/* Bitácora de Auditoría */}
            <div className="stats-box" style={{ marginTop: '28px' }}>
              <h3 className="stats-box-title">
                <span className="material-symbols-rounded">history</span>
                Registro de Actividad y Auditoría Litúrgica
              </h3>
              <div className="recent-log-table">
                {activityLog.length === 0 ? (
                  <p className="empty-text">No hay registros de actividad aún.</p>
                ) : (
                  activityLog.map((log) => (
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
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: RENOMBRAR CATEGORÍA
         ══════════════════════════════════════════════════════════════════════ */}
      {editingCategory && (
        <div className="admin-modal-backdrop" onClick={() => setEditingCategory(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="material-symbols-rounded modal-header-icon">edit</span>
                <div>
                  <h3 className="admin-modal-title">Renombrar Categoría</h3>
                  <span className="admin-modal-sub">Identificador: {editingCategory.id}</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setEditingCategory(null)}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveRenameCategory} className="admin-modal-form">
              <div className="form-field">
                <label htmlFor="rename-cat-nombre">Nombre de la Categoría:</label>
                <input
                  id="rename-cat-nombre"
                  type="text"
                  value={renameForm.nombre}
                  onChange={(e) => setRenameForm({ ...renameForm, nombre: e.target.value })}
                  className="admin-input-field"
                  required
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="rename-cat-desc">Descripción Litúrgica:</label>
                <textarea
                  id="rename-cat-desc"
                  rows="3"
                  value={renameForm.descripcion}
                  onChange={(e) => setRenameForm({ ...renameForm, descripcion: e.target.value })}
                  className="admin-textarea-field"
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-primary-btn">
                  Guardar Nombre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: CREAR NUEVA CATEGORÍA
         ══════════════════════════════════════════════════════════════════════ */}
      {isCreatingCategory && (
        <div className="admin-modal-backdrop" onClick={() => setIsCreatingCategory(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="material-symbols-rounded modal-header-icon">add_circle</span>
                <div>
                  <h3 className="admin-modal-title">Crear Nueva Categoría</h3>
                  <span className="admin-modal-sub">Agrega una nueva línea litúrgica</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setIsCreatingCategory(false)}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveNewCategory} className="admin-modal-form">
              <div className="form-field">
                <label htmlFor="new-cat-nombre">Nombre de la Categoría:</label>
                <input
                  id="new-cat-nombre"
                  type="text"
                  placeholder="ej: Cirios Pascuales"
                  value={newCatData.nombre}
                  onChange={(e) => setNewCatData({ ...newCatData, nombre: e.target.value })}
                  className="admin-input-field"
                  required
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="new-cat-desc">Descripción:</label>
                <textarea
                  id="new-cat-desc"
                  rows="3"
                  placeholder="Finalidad litúrgica de esta categoría..."
                  value={newCatData.descripcion}
                  onChange={(e) => setNewCatData({ ...newCatData, descripcion: e.target.value })}
                  className="admin-textarea-field"
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => setIsCreatingCategory(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-primary-btn">
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: AGREGAR O EDITAR MEDIDA (DIÁMETRO MM × LARGO CM)
         ══════════════════════════════════════════════════════════════════════ */}
      {measureModalState && (
        <div className="admin-modal-backdrop" onClick={() => setMeasureModalState(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="material-symbols-rounded modal-header-icon">straighten</span>
                <div>
                  <h3 className="admin-modal-title">
                    {measureModalState.mode === 'create' ? 'Agregar Medida Canónica' : 'Editar Medida'}
                  </h3>
                  <span className="admin-modal-sub">
                    Categoría: {categories.find((c) => c.id === measureModalState.categoryId)?.nombre}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setMeasureModalState(null)}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMeasure} className="admin-modal-form">
              <div className="modal-grid-2cols">
                <div className="form-field">
                  <label htmlFor="measure-diam-input">Diámetro (en milímetros - mm):</label>
                  <div className="unit-input-wrap">
                    <input
                      id="measure-diam-input"
                      type="number"
                      min="1"
                      placeholder="ej: 50, 60, 70"
                      value={measureModalState.data.diametroMm}
                      onChange={(e) =>
                        setMeasureModalState({
                          ...measureModalState,
                          data: { ...measureModalState.data, diametroMm: e.target.value },
                        })
                      }
                      className="admin-input-field"
                      required
                      autoFocus
                    />
                    <span className="unit-badge">mm</span>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="measure-len-input">Largo / Altura (en centímetros - cm):</label>
                  <div className="unit-input-wrap">
                    <input
                      id="measure-len-input"
                      type="number"
                      min="1"
                      placeholder="ej: 30, 85, 100"
                      value={measureModalState.data.largoCm}
                      onChange={(e) =>
                        setMeasureModalState({
                          ...measureModalState,
                          data: { ...measureModalState.data, largoCm: e.target.value },
                        })
                      }
                      className="admin-input-field"
                      required
                    />
                    <span className="unit-badge">cm</span>
                  </div>
                </div>
              </div>

              <div className="modal-grid-2cols">
                <div className="form-field">
                  <label htmlFor="measure-hours-input">Duración estimada de combustión (h):</label>
                  <input
                    id="measure-hours-input"
                    type="number"
                    min="1"
                    placeholder="ej: 90"
                    value={measureModalState.data.duracionHoras}
                    onChange={(e) =>
                      setMeasureModalState({
                        ...measureModalState,
                        data: { ...measureModalState.data, duracionHoras: e.target.value },
                      })
                    }
                    className="admin-input-field"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="measure-price-input">Precio Base Sugerido ($):</label>
                  <input
                    id="measure-price-input"
                    type="number"
                    min="1"
                    placeholder="ej: 14500"
                    value={measureModalState.data.precioBase}
                    onChange={(e) =>
                      setMeasureModalState({
                        ...measureModalState,
                        data: { ...measureModalState.data, precioBase: e.target.value },
                      })
                    }
                    className="admin-input-field"
                    required
                  />
                </div>
              </div>

              <div className="measure-preview-box">
                <span className="material-symbols-rounded">visibility</span>
                <span>
                  Vista previa: <strong>Ø {measureModalState.data.diametroMm || 0} mm × {measureModalState.data.largoCm || 0} cm</strong>
                </span>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => setMeasureModalState(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-primary-btn">
                  Guardar Medida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: CREAR O EDITAR PRODUCTO COMPLETO (CON MEDIDAS Y PRECIOS)
         ══════════════════════════════════════════════════════════════════════ */}
      {(isCreatingNew || editingProduct) && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setIsCreatingNew(false);
            setEditingProduct(null);
          }}
        >
          <div
            className="admin-modal-card modal-card-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="material-symbols-rounded modal-header-icon">tune</span>
                <div>
                  <h3 className="admin-modal-title">
                    {isCreatingNew ? 'Alta de Producto Litúrgico' : `Editar: ${formData.modelo}`}
                  </h3>
                  <span className="admin-modal-sub">
                    SKU: {formData.sku} · Categoría: {formData.categoriaNombre}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingProduct(null);
                }}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="modal-grid-2cols">
                {/* Nombre / Modelo */}
                <div className="form-field">
                  <label htmlFor="prod-modelo-input">Nombre del Modelo:</label>
                  <input
                    id="prod-modelo-input"
                    type="text"
                    placeholder="ej: Cirio Pascual Sagrado Corazón"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="admin-input-field"
                    required
                  />
                </div>

                {/* SKU */}
                <div className="form-field">
                  <label htmlFor="prod-sku-input">Código SKU:</label>
                  <input
                    id="prod-sku-input"
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="admin-input-field"
                    required
                  />
                </div>
              </div>

              <div className="modal-grid-2cols">
                {/* Categoría Selector (Recategorización dentro del modal) */}
                <div className="form-field">
                  <label htmlFor="prod-cat-select">Categoría Canónica:</label>
                  <select
                    id="prod-cat-select"
                    value={formData.categoriaId}
                    onChange={(e) => handleProductFormCategoryChange(e.target.value)}
                    className="admin-input-field"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Cera */}
                <div className="form-field">
                  <label htmlFor="prod-cera-select">Composición de Cera:</label>
                  <select
                    id="prod-cera-select"
                    value={formData.tipoCeraId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoCeraId: e.target.value,
                        tipoCeraNombre:
                          e.target.value === 'abeja'
                            ? '100% Cera Pura de Abejas'
                            : e.target.value === 'soja'
                            ? 'Cera de Soja Ecológica'
                            : 'Parafina Purificada sin Humo',
                      })
                    }
                    className="admin-input-field"
                  >
                    <option value="abeja">100% Cera Pura de Abejas</option>
                    <option value="soja">Cera de Soja Ecológica</option>
                    <option value="parafina">Parafina Purificada sin Humo</option>
                  </select>
                </div>
              </div>

              {/* Subida de Imagen a Cloudinary */}
              <div className="form-field">
                <label>Imagen del Producto:</label>
                <div className="image-upload-flex">
                  <img src={formData.imagen} alt="Preview" className="img-preview-thumb" />
                  <div className="image-inputs-stack">
                    <input
                      type="text"
                      placeholder="URL de imagen (/cirio-pascual.jpg o https://...)"
                      value={formData.imagen}
                      onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                      className="admin-input-field"
                    />
                    <label className="upload-file-btn">
                      <span className="material-symbols-rounded">cloud_upload</span>
                      <span>{isUploadingImage ? 'Subiendo a Cloudinary...' : 'Subir imagen desde mi PC'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        style={{ display: 'none' }}
                        disabled={isUploadingImage}
                      />
                    </label>
                  </div>
                </div>
                {uploadError && <span className="upload-error-tag">{uploadError}</span>}
              </div>

              {/* Descripción */}
              <div className="form-field">
                <label htmlFor="prod-desc-field">Descripción Litúrgica:</label>
                <textarea
                  id="prod-desc-field"
                  rows="2"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="admin-textarea-field"
                />
              </div>

              {/* Aromas y Stock */}
              <div className="modal-grid-2cols">
                <div className="form-field">
                  <label htmlFor="prod-aromas-field">Aromas (separados por coma):</label>
                  <input
                    id="prod-aromas-field"
                    type="text"
                    value={formData.aromasString}
                    onChange={(e) => setFormData({ ...formData, aromasString: e.target.value })}
                    className="admin-input-field"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="prod-stock-field">Stock disponible:</label>
                  <input
                    id="prod-stock-field"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="admin-input-field"
                  />
                </div>
              </div>

              {/* ── SECCIÓN DE MEDIDAS Y PRECIOS DEL PRODUCTO ── */}
              <div className="product-sizes-manager-box">
                <div className="sizes-manager-header">
                  <span className="title">
                    <span className="material-symbols-rounded">straighten</span>
                    Medidas y Precios Individuales de este Producto
                  </span>
                  <button
                    type="button"
                    className="add-size-row-btn"
                    onClick={handleAddSizeToProduct}
                  >
                    <span className="material-symbols-rounded">add</span>
                    Añadir Medida a Producto
                  </button>
                </div>

                <div className="sizes-table-scroll">
                  <table className="sizes-edit-table">
                    <thead>
                      <tr>
                        <th>Medida (Ø mm × cm)</th>
                        <th>Duración Estimada</th>
                        <th>Precio Unitario ($)</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.tamanosPorNumero.map((tam, idx) => (
                        <tr key={tam.id || idx}>
                          <td>
                            <strong>Ø {tam.diametroMm} mm × {tam.largoCm} cm</strong>
                          </td>
                          <td>~{tam.duracionHoras}h</td>
                          <td>
                            <div className="size-price-input-wrap">
                              <span>$</span>
                              <input
                                type="number"
                                value={tam.precioUnitario}
                                onChange={(e) => handleSizePriceChange(idx, e.target.value)}
                                className="size-price-input"
                              />
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="remove-size-btn"
                              onClick={() => handleRemoveSizeFromProduct(idx)}
                              title="Quitar medida de este producto"
                            >
                              <span className="material-symbols-rounded">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-primary-btn">
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
