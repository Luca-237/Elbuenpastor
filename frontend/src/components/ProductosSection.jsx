import React, { useState, useMemo } from 'react';
import './ProductosSection.css';

// Catálogo maestro estructurado según la base de datos de El Buen Pastor
const CATALOGO_PRODUCTOS = [
  {
    id: 'prod-01',
    sku: 'VEL-SOJ-MED-001',
    modelo: 'Vela Cilíndrica Pura Soja',
    categoriaId: 'soja',
    categoriaNombre: 'Velas de Soja',
    tipoCeraId: 'soja',
    tipoCeraNombre: '100% Cera de Soja Ecológica',
    tamano: 'Mediana (8 × 10 cm)',
    duracionHoras: 45,
    aromas: ['Incienso Sagrado', 'Mirra', 'Sándalo'],
    aromaDefault: 'Incienso Sagrado',
    imagen: '/hero-candles.jpg',
    descripcion: 'Vela de combustión lenta y serena. Elaborada artesanalmente con cera de soja vegetal que favorece el recogimiento y la oración.',
    precioUnitario: 3800,
    preciosPorVolumen: [
      { min: 1, max: 9, precio: 3800 },
      { min: 10, max: 49, precio: 3300 },
      { min: 50, max: null, precio: 2900 },
    ],
    stock: 24,
    destacado: true,
  },
  {
    id: 'prod-02',
    sku: 'CIR-ABJ-GRD-002',
    modelo: 'Cirio Pascual & Altar de Abejas',
    categoriaId: 'cirios',
    categoriaNombre: 'Cirios Pascuales & Altar',
    tipoCeraId: 'abeja',
    tipoCeraNombre: '100% Cera Pura de Abejas Silvestres',
    tamano: 'Grande (10 × 35 cm)',
    duracionHoras: 120,
    aromas: ['Miel natural'],
    aromaDefault: 'Miel y Polen',
    imagen: '/cirio-pascual.jpg',
    descripcion: 'Cirio consagrado para celebraciones litúrgicas y altares. Llama constante sin humo negro y aroma puro a cera virgen.',
    precioUnitario: 14500,
    preciosPorVolumen: [
      { min: 1, max: 4, precio: 14500 },
      { min: 5, max: 19, precio: 12800 },
      { min: 20, max: null, precio: 11200 },
    ],
    stock: 12,
    destacado: true,
  },
  {
    id: 'prod-03',
    sku: 'VOT-LGT-X12-003',
    modelo: 'Caja ×12 Velas Votivas de Oración',
    categoriaId: 'votivas',
    categoriaNombre: 'Velas Votivas & Sagrario',
    tipoCeraId: 'parafina',
    tipoCeraNombre: 'Soja & Parafina Purificada',
    tamano: 'Pack 12 unidades (4 × 5 cm)',
    duracionHoras: 12,
    aromas: ['Neutro (Sin fragancia)'],
    aromaDefault: 'Neutro para Sagrario',
    imagen: '/velas-votivas.jpg',
    descripcion: 'Juego de doce veladoras para capillas, sagrarios y oratorios familiares. Recipiente seguro de aluminio y combustión sin goteo.',
    precioUnitario: 5200,
    preciosPorVolumen: [
      { min: 1, max: 9, precio: 5200 },
      { min: 10, max: 29, precio: 4600 },
      { min: 30, max: null, precio: 3950 },
    ],
    stock: 45,
    destacado: false,
  },
  {
    id: 'prod-04',
    sku: 'VEL-BOT-SMC-004',
    modelo: 'Vela San Francisco en Terracota',
    categoriaId: 'botanica',
    categoriaNombre: 'Línea Botánica',
    tipoCeraId: 'soja',
    tipoCeraNombre: 'Cera de Soja & Aceite de Oliva',
    tamano: 'Cazuela Cerámica (9 × 9 cm)',
    duracionHoras: 50,
    aromas: ['Ramas de Olivo', 'Romero Silvestre'],
    aromaDefault: 'Ramas de Olivo',
    imagen: '/vela-terracota.jpg',
    descripcion: 'Inspirada en el Cántico de las Criaturas. Hecha a mano en vasija de terracota natural reutilizable con mecha de algodón puro.',
    precioUnitario: 4900,
    preciosPorVolumen: [
      { min: 1, max: 9, precio: 4900 },
      { min: 10, max: 39, precio: 4200 },
      { min: 40, max: null, precio: 3700 },
    ],
    stock: 18,
    destacado: true,
  },
  {
    id: 'prod-05',
    sku: 'CIR-MIN-PAR-005',
    modelo: 'Cirio Procesional con Cruz en Relieve',
    categoriaId: 'cirios',
    categoriaNombre: 'Cirios Pascuales & Altar',
    tipoCeraId: 'abeja',
    tipoCeraNombre: 'Cera Virgen de Abejas',
    tamano: 'Fino Procesional (2.5 × 25 cm)',
    duracionHoras: 18,
    aromas: ['Miel natural'],
    aromaDefault: 'Miel natural',
    imagen: '/hero-candles.jpg',
    descripcion: 'Cirio estilizado con la Cruz del Buen Pastor en relieve. Excelente estabilidad para procesiones, Bautismos y Primeras Comuniones.',
    precioUnitario: 1900,
    preciosPorVolumen: [
      { min: 1, max: 19, precio: 1900 },
      { min: 20, max: 99, precio: 1600 },
      { min: 100, max: null, precio: 1350 },
    ],
    stock: 80,
    destacado: false,
  },
  {
    id: 'prod-06',
    sku: 'VEL-SAG-FAM-006',
    modelo: 'Vela Aromática Sagrada Familia',
    categoriaId: 'soja',
    categoriaNombre: 'Velas de Soja',
    tipoCeraId: 'soja',
    tipoCeraNombre: '100% Soja Vegetal Pura',
    tamano: 'Frasco Ámbar con Tapa (250g)',
    duracionHoras: 55,
    aromas: ['Nardo Puro', 'Lirios del Valle'],
    aromaDefault: 'Nardo Puro',
    imagen: '/vela-aromatica.jpg',
    descripcion: 'Frasco ámbar que preserva los aceites aromáticos esenciales. Con tapa de madera natural grabada para bendición del hogar cristiano.',
    precioUnitario: 4600,
    preciosPorVolumen: [
      { min: 1, max: 9, precio: 4600 },
      { min: 10, max: 39, precio: 3950 },
      { min: 40, max: null, precio: 3450 },
    ],
    stock: 30,
    destacado: true,
  },
];

// Categorías del catálogo con conteo dinámico
const CATEGORIAS_SIDEBAR = [
  { id: 'todas', nombre: 'Todas las Ceras y Cirios' },
  { id: 'soja', nombre: 'Velas de Soja' },
  { id: 'cirios', nombre: 'Cirios Pascuales & Altar' },
  { id: 'votivas', nombre: 'Velas Votivas & Sagrario' },
  { id: 'botanica', nombre: 'Línea Botánica & Terracota' },
];

// Filtros por materia prima
const FILTROS_CERA = [
  { id: 'todos', label: 'Cualquier composición' },
  { id: 'soja', label: '100% Cera de Soja' },
  { id: 'abeja', label: 'Cera Pura de Abejas' },
  { id: 'parafina', label: 'Soja & Mezcla Refinada' },
];

export default function ProductosSection({ onAddToCart }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [ceraSeleccionada, setCeraSeleccionada] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('destacados');
  const [mensajeNotificacion, setMensajeNotificacion] = useState('');

  // Filtrado y ordenamiento de productos
  const productosFiltrados = useMemo(() => {
    let prods = CATALOGO_PRODUCTOS.filter((p) => {
      const coincideCat = categoriaSeleccionada === 'todas' || p.categoriaId === categoriaSeleccionada;
      const coincideCera = ceraSeleccionada === 'todos' || p.tipoCeraId === ceraSeleccionada;
      const coincideBusqueda =
        p.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase());
      return coincideCat && coincideCera && coincideBusqueda;
    });

    if (orden === 'precio-menor') {
      prods.sort((a, b) => a.precioUnitario - b.precioUnitario);
    } else if (orden === 'precio-mayor') {
      prods.sort((a, b) => b.precioUnitario - a.precioUnitario);
    } else if (orden === 'nombre') {
      prods.sort((a, b) => a.modelo.localeCompare(b.modelo));
    }
    return prods;
  }, [categoriaSeleccionada, ceraSeleccionada, busqueda, orden]);

  // Contar productos por categoría
  const conteoPorCategoria = (catId) => {
    if (catId === 'todas') return CATALOGO_PRODUCTOS.length;
    return CATALOGO_PRODUCTOS.filter((p) => p.categoriaId === catId).length;
  };

  // Contar productos por tipo de cera
  const conteoPorCera = (ceraId) => {
    if (ceraId === 'todos') return CATALOGO_PRODUCTOS.length;
    return CATALOGO_PRODUCTOS.filter((p) => p.tipoCeraId === ceraId).length;
  };

  return (
    <div className="catalogo-page-wrapper">
      {/* ── 1. ENCABEZADO SOBRIO DE PÁGINA (Estilo De Petris) ── */}
      <div className="page-heading-sober">
        <div className="container">
          <div className="heading-inner">
            <h1 className="heading-title">PRODUCTOS</h1>
            <nav className="breadcrumbs-nav" aria-label="Migas de pan">
              <span className="breadcrumb-item">Inicio</span>
              <span className="breadcrumb-sep">&gt;</span>
              <span className="breadcrumb-item">Catálogo</span>
              <span className="breadcrumb-sep">&gt;</span>
              <span className="breadcrumb-active">
                {CATEGORIAS_SIDEBAR.find((c) => c.id === categoriaSeleccionada)?.nombre}
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Notificación serena al interactuar */}
      {mensajeNotificacion && (
        <div className="container">
          <div className="peace-banner-notif animate-fade-in">
            <span className="material-symbols-rounded">check_circle</span>
            <span>{mensajeNotificacion}</span>
          </div>
        </div>
      )}

      {/* ── 2. ESTRUCTURA CENTRAL (SIDEBAR + GRID DE PRODUCTOS) ── */}
      <div className="container catalogo-main-container">
        <div className="catalogo-layout-grid">
          {/* ── SIDEBAR IZQUIERDA (Filtros y Categorías) ── */}
          <aside className="catalogo-sidebar" aria-label="Filtros del catálogo">
            {/* Buscador sobrio */}
            <div className="sidebar-widget widget-search">
              <div className="sidebar-search-box">
                <input
                  type="search"
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="sidebar-search-input"
                />
                <span className="material-symbols-rounded search-icon-btn">search</span>
              </div>
            </div>

            {/* Categorías Principales con conteo (X) */}
            <div className="sidebar-widget">
              <div className="widget-header">
                <h3 className="widget-title">CATEGORÍAS</h3>
              </div>
              <ul className="categories-list">
                {CATEGORIAS_SIDEBAR.map((cat) => {
                  const isSelected = categoriaSeleccionada === cat.id;
                  return (
                    <li key={cat.id} className={`category-list-item ${isSelected ? 'active' : ''}`}>
                      <button
                        className="category-btn-link"
                        onClick={() => setCategoriaSeleccionada(cat.id)}
                      >
                        <span className="cat-name">{cat.nombre}</span>
                        <span className="cat-count">({conteoPorCategoria(cat.id)})</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Filtro por Materia Prima / Cera */}
            <div className="sidebar-widget">
              <div className="widget-header">
                <h3 className="widget-title">MATERIA PRIMA</h3>
              </div>
              <ul className="facet-list">
                {FILTROS_CERA.map((cera) => {
                  const isSelected = ceraSeleccionada === cera.id;
                  return (
                    <li key={cera.id} className={`facet-item ${isSelected ? 'active' : ''}`}>
                      <button
                        className="facet-btn-link"
                        onClick={() => setCeraSeleccionada(cera.id)}
                      >
                        <span className="facet-label">{cera.label}</span>
                        <span className="facet-count">({conteoPorCera(cera.id)})</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Módulo Institucional Litúrgico en Sidebar */}
            <div className="sidebar-widget widget-liturgical-callout">
              <div className="callout-icon-top">
                <span className="material-symbols-rounded">church</span>
              </div>
              <h4 className="callout-title">Atención a Parroquias</h4>
              <p className="callout-text">
                Elaboramos cirios a medida con listas de precios institucionales y envíos a capillas de todo el país.
              </p>
              <div className="callout-phone">
                <span className="material-symbols-rounded">call</span>
                <span>+54 9 11 4000-8800</span>
              </div>
            </div>
          </aside>

          {/* ── SECCIÓN CENTRAL: PRODUCTOS CON AIRE Y CENTRADO ── */}
          <main className="catalogo-content-area">
            {/* Barra superior de ordenamiento y cantidad */}
            <div className="catalogo-toolbar">
              <span className="results-count">
                Mostrando <strong>{productosFiltrados.length}</strong> productos
              </span>

              <div className="toolbar-controls">
                <label htmlFor="select-orden" className="control-label">Ordenar por:</label>
                <select
                  id="select-orden"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="sober-select"
                >
                  <option value="destacados">Orden sugerido</option>
                  <option value="precio-menor">Precio: de menor a mayor</option>
                  <option value="precio-mayor">Precio: de mayor a menor</option>
                  <option value="nombre">Alfabético: A - Z</option>
                </select>
              </div>
            </div>

            {/* Cuadrícula de Productos Sobria (3 columnas con centrado absoluto) */}
            {productosFiltrados.length === 0 ? (
              <div className="no-products-box">
                <span className="material-symbols-rounded empty-icon">inventory_2</span>
                <h3>No hay productos que coincidan</h3>
                <p>Intenta restablecer los filtros para volver a ver el catálogo completo.</p>
                <md-outlined-button
                  onClick={() => {
                    setCategoriaSeleccionada('todas');
                    setCeraSeleccionada('todos');
                    setBusqueda('');
                  }}
                >
                  Restablecer Filtros
                </md-outlined-button>
              </div>
            ) : (
              <div className="sober-products-grid">
                {productosFiltrados.map((prod) => (
                  <article key={prod.id} className="sober-product-card">
                    {/* Imagen Cuadrada Limpia con fondo neutral */}
                    <div className="product-image-frame">
                      <img
                        src={prod.imagen}
                        alt={prod.modelo}
                        className="sober-product-img"
                        loading="lazy"
                      />
                      {prod.destacado && (
                        <span className="sober-badge">Destacado</span>
                      )}
                    </div>

                    {/* Contenido COMPLETAMENTE CENTRADO (Estilo De Petris) */}
                    <div className="product-info-centered">
                      <span className="product-cat-tag">{prod.categoriaNombre}</span>
                      
                      <h3 className="product-title-centered">{prod.modelo}</h3>
                      
                      <p className="product-specs-sub">{prod.tamano} · ~{prod.duracionHoras}h</p>

                      {/* Escala de precios sobria centrada */}
                      <div className="product-pricing-centered">
                        <span className="price-primary-centered">
                          ${prod.precioUnitario.toLocaleString('es-AR')}
                        </span>
                        <span className="price-wholesale-sub">
                          Por mayor desde ${prod.preciosPorVolumen[prod.preciosPorVolumen.length - 1].precio.toLocaleString('es-AR')}
                        </span>
                      </div>

                      {/* Botón sobrio Material Web centrado */}
                      <div className="product-card-action">
                        <md-filled-button
                          class="sober-add-btn"
                          onClick={() => {
                            if (onAddToCart) onAddToCart(prod);
                            setMensajeNotificacion(`Has añadido "${prod.modelo}" al pedido litúrgico.`);
                            setTimeout(() => setMensajeNotificacion(''), 4000);
                          }}
                        >
                          <span slot="icon" className="material-symbols-rounded">add_shopping_cart</span>
                          Añadir al Pedido
                        </md-filled-button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
