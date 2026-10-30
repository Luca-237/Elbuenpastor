import React, { useState, useMemo } from 'react';
import ProductoDetalleModal from './ProductoDetalleModal';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTOS } from '../data/catalogoData';
import './ProductosSection.css';

export default function ProductosSection({
  productos = INITIAL_PRODUCTOS,
  categories = INITIAL_CATEGORIES,
  onAddToCart,
}) {
  const listaProductos = productos || INITIAL_PRODUCTOS;
  const listaCategorias = categories || INITIAL_CATEGORIES;

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [medidaSeleccionada, setMedidaSeleccionada] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('destacados');
  const [mensajeNotificacion, setMensajeNotificacion] = useState('');

  // Estado para el modal de detalle del producto seleccionado
  const [productoParaDetalle, setProductoParaDetalle] = useState(null);

  // Obtener la categoría activa
  const categoriaActivaObj = useMemo(() => {
    return listaCategorias.find((c) => c.id === categoriaSeleccionada) || null;
  }, [listaCategorias, categoriaSeleccionada]);

  // Medidas disponibles para filtrar según categoría seleccionada
  const medidasDisponibles = useMemo(() => {
    if (categoriaActivaObj && categoriaActivaObj.medidas && categoriaActivaObj.medidas.length > 0) {
      return categoriaActivaObj.medidas.map((m) => ({
        diametroMm: m.diametroMm,
        largoCm: m.largoCm,
        label: `${m.diametroMm} mm × ${m.largoCm} cm`,
        dimensiones: `Ø ${m.diametroMm} mm × ${m.largoCm} cm`,
      }));
    }

    // Si está en "todas", extraer todas las medidas únicas presentes en los productos
    const setMedidas = new Map();
    listaProductos.forEach((p) => {
      (p.tamanosPorNumero || []).forEach((t) => {
        if (t.diametroMm && t.largoCm) {
          const key = `${t.diametroMm}x${t.largoCm}`;
          if (!setMedidas.has(key)) {
            setMedidas.set(key, {
              diametroMm: t.diametroMm,
              largoCm: t.largoCm,
              label: `${t.diametroMm} mm × ${t.largoCm} cm`,
              dimensiones: `Ø ${t.diametroMm} mm × ${t.largoCm} cm`,
            });
          }
        }
      });
    });

    return Array.from(setMedidas.values());
  }, [categoriaActivaObj, listaProductos]);

  // Resetear filtro de medida si la categoría cambia
  const handleSelectCategoria = (catId) => {
    setCategoriaSeleccionada(catId);
    setMedidaSeleccionada('todas');
  };

  // Filtrado de productos
  const productosFiltrados = useMemo(() => {
    let prods = listaProductos.filter((p) => {
      // 1. Filtro por categoría canónica
      const coincideCat = categoriaSeleccionada === 'todas' || p.categoriaId === categoriaSeleccionada;

      // 2. Filtro por medida (diámetro y largo)
      let coincideMedida = true;
      if (medidaSeleccionada !== 'todas') {
        const [dMm, lCm] = medidaSeleccionada.split('x').map(Number);
        coincideMedida = (p.tamanosPorNumero || []).some(
          (t) => t.diametroMm === dMm && t.largoCm === lCm
        );
      }

      // 3. Búsqueda por texto
      const coincideBusqueda =
        p.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.categoriaNombre || '').toLowerCase().includes(busqueda.toLowerCase());

      return coincideCat && coincideMedida && coincideBusqueda;
    });

    // Ordenamiento
    if (orden === 'precio-menor') {
      prods.sort((a, b) => {
        const pA = a.tamanosPorNumero?.[0]?.precioUnitario || a.precioUnitario;
        const pB = b.tamanosPorNumero?.[0]?.precioUnitario || b.precioUnitario;
        return pA - pB;
      });
    } else if (orden === 'precio-mayor') {
      prods.sort((a, b) => {
        const pA = a.tamanosPorNumero?.[a.tamanosPorNumero.length - 1]?.precioUnitario || a.precioUnitario;
        const pB = b.tamanosPorNumero?.[b.tamanosPorNumero.length - 1]?.precioUnitario || b.precioUnitario;
        return pB - pA;
      });
    } else if (orden === 'nombre') {
      prods.sort((a, b) => a.modelo.localeCompare(b.modelo));
    }

    return prods;
  }, [listaProductos, categoriaSeleccionada, medidaSeleccionada, busqueda, orden]);

  // Conteo de productos por categoría
  const conteoPorCategoria = (catId) => {
    if (catId === 'todas') return listaProductos.length;
    return listaProductos.filter((p) => p.categoriaId === catId).length;
  };

  return (
    <div className="catalogo-page-wrapper">
      {/* ── 1. ENCABEZADO LITÚRGICO DE PÁGINA (AZUL Y ORO) ── */}
      <div className="page-heading-sober">
        <div className="container">
          <div className="heading-inner">
            <div className="catalog-header-badge-row">
              <div className="catalog-shepherd-emblem">
                <img
                  src="/logo-medallion-navy.png"
                  alt="Sello El Buen Pastor"
                  className="catalog-emblem-img"
                />
              </div>
              <div className="sacred-heading-badge">
                <span className="material-symbols-rounded">flare</span>
                <span>ILUMINA TU FE CON LA LUZ DEL BUEN PASTOR</span>
              </div>
            </div>

            <h1 className="heading-title">CATÁLOGO DE VELAS & CIRIOS</h1>
            <p className="heading-tagline">
              Velas Litúrgicas, Velones y Cirios de Alta Devoción
            </p>

            <nav className="breadcrumbs-nav" aria-label="Migas de pan">
              <span className="breadcrumb-item">Inicio</span>
              <span className="breadcrumb-sep">&gt;</span>
              <span className="breadcrumb-item">Catálogo</span>
              <span className="breadcrumb-sep">&gt;</span>
              <span className="breadcrumb-active">
                {categoriaActivaObj ? categoriaActivaObj.nombre : 'Todos los Productos'}
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Notificación de interacción */}
      {mensajeNotificacion && (
        <div className="container">
          <div className="peace-banner-notif animate-fade-in">
            <span className="material-symbols-rounded">check_circle</span>
            <span>{mensajeNotificacion}</span>
          </div>
        </div>
      )}

      {/* ── ESTRUCTURA CENTRAL (SIDEBAR + GRID DE PRODUCTOS) ── */}
      <div className="container catalogo-main-container">
        <div className="catalogo-layout-grid">
          {/* ── SIDEBAR IZQUIERDA: FILTROS INTEGRADOS ── */}
          <aside className="catalogo-sidebar" aria-label="Filtros del catálogo">
            {/* Buscador */}
            <div className="sidebar-widget widget-search">
              <div className="sidebar-search-box">
                <input
                  type="search"
                  placeholder="Buscar modelo o SKU..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="sidebar-search-input"
                />
                <span className="material-symbols-rounded search-icon-btn">search</span>
              </div>
            </div>

            {/* Categorías Principales */}
            <div className="sidebar-widget">
              <div className="widget-header">
                <h3 className="widget-title">
                  <span className="material-symbols-rounded widget-title-icon">church</span>
                  CATEGORÍAS
                </h3>
              </div>
              <ul className="categories-list">
                <li className={`category-list-item ${categoriaSeleccionada === 'todas' ? 'active' : ''}`}>
                  <button
                    className="category-btn-link"
                    onClick={() => handleSelectCategoria('todas')}
                  >
                    <span className="cat-name">Todos los Productos</span>
                    <span className="cat-count">({listaProductos.length})</span>
                  </button>
                </li>
                {listaCategorias.map((cat) => {
                  const isSelected = categoriaSeleccionada === cat.id;
                  return (
                    <li key={cat.id} className={`category-list-item ${isSelected ? 'active' : ''}`}>
                      <button
                        className="category-btn-link"
                        onClick={() => handleSelectCategoria(cat.id)}
                      >
                        <span className="cat-name">{cat.nombre}</span>
                        <span className="cat-count">({conteoPorCategoria(cat.id)})</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Filtro por Medida Calibrada (Integrado en el Sidebar) */}
            {medidasDisponibles.length > 0 && (
              <div className="sidebar-widget widget-measures-sidebar">
                <div className="widget-header">
                  <h3 className="widget-title">
                    <span className="material-symbols-rounded widget-title-icon">straighten</span>
                    MEDIDAS (Ø × LARGO)
                  </h3>
                  {medidaSeleccionada !== 'todas' && (
                    <button
                      type="button"
                      className="sidebar-clear-measure-btn"
                      onClick={() => setMedidaSeleccionada('todas')}
                      title="Ver todas las medidas"
                    >
                      Restablecer
                    </button>
                  )}
                </div>
                <div className="sidebar-measures-pills">
                  <button
                    type="button"
                    className={`sidebar-measure-pill ${medidaSeleccionada === 'todas' ? 'active' : ''}`}
                    onClick={() => setMedidaSeleccionada('todas')}
                  >
                    Todas las medidas
                  </button>
                  {medidasDisponibles.map((m) => {
                    const key = `${m.diametroMm}x${m.largoCm}`;
                    const isSelected = medidaSeleccionada === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`sidebar-measure-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => setMedidaSeleccionada(isSelected ? 'todas' : key)}
                      >
                        <span className="measure-diam">Ø {m.diametroMm} mm</span>
                        <span className="measure-sep">×</span>
                        <span className="measure-len">{m.largoCm} cm</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Módulo Litúrgico */}
            <div className="sidebar-widget widget-liturgical-callout">
              <div className="callout-icon-top">
                <span className="material-symbols-rounded">flare</span>
              </div>
              <h4 className="callout-title">Atención a Parroquias</h4>
              <p className="callout-text">
                Cirios pascuales y velas litúrgicas consagradas con medidas canónicas calibradas para altares de todo el país.
              </p>
              <div className="callout-phone">
                <span className="material-symbols-rounded">chat</span>
                <span>WhatsApp: +54 9 11 4000-8800</span>
              </div>
            </div>
          </aside>

          {/* ── CONTENIDO PRINCIPAL: CUADRÍCULA DE PRODUCTOS ── */}
          <main className="catalogo-content-area">
            {/* Toolbar superior */}
            <div className="catalogo-toolbar">
              <div className="toolbar-info-left">
                <span className="results-count">
                  Mostrando <strong>{productosFiltrados.length}</strong> {productosFiltrados.length === 1 ? 'producto litúrgico' : 'productos litúrgicos'}
                </span>
                {medidaSeleccionada !== 'todas' && (
                  <span className="active-measure-tag">
                    Filtrado por medida: <strong>{medidaSeleccionada.replace('x', ' mm × ')} cm</strong>
                    <button
                      className="clear-measure-btn"
                      onClick={() => setMedidaSeleccionada('todas')}
                      title="Quitar filtro de medida"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>

              <div className="toolbar-controls">
                <label htmlFor="select-orden" className="control-label">Ordenar:</label>
                <select
                  id="select-orden"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="sober-select"
                >
                  <option value="destacados">Recomendado</option>
                  <option value="precio-menor">Precio: de menor a mayor</option>
                  <option value="precio-mayor">Precio: de mayor a menor</option>
                  <option value="nombre">Alfabético: A - Z</option>
                </select>
              </div>
            </div>

            {/* Cuadrícula de productos */}
            {productosFiltrados.length === 0 ? (
              <div className="no-products-box">
                <span className="material-symbols-rounded empty-icon">sentiment_dissatisfied</span>
                <h3>No hay productos con los filtros seleccionados</h3>
                <p>Prueba seleccionando "Todas las medidas" o restableciendo los filtros de búsqueda.</p>
                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={() => {
                    setCategoriaSeleccionada('todas');
                    setMedidaSeleccionada('todas');
                    setBusqueda('');
                  }}
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="sober-products-grid">
                {productosFiltrados.map((prod) => {
                  const tallas = prod.tamanosPorNumero || [];
                  const precioMin = tallas.length > 0 ? tallas[0].precioUnitario : prod.precioUnitario;

                  // Si está en modo 'por_medida', determinar la imagen adecuada según filtro o defecto
                  let imagenCard = prod.imagen;
                  let esFotoDeMedida = false;
                  if (prod.modoImagen === 'por_medida') {
                    if (medidaSeleccionada !== 'todas') {
                      const [dMm, lCm] = medidaSeleccionada.split('x').map(Number);
                      const tallaCoincidente = tallas.find((t) => t.diametroMm === dMm && t.largoCm === lCm);
                      if (tallaCoincidente?.imagen) {
                        imagenCard = tallaCoincidente.imagen;
                        esFotoDeMedida = true;
                      }
                    } else {
                      const tallaConFoto = tallas.find((t) => t.isDefault && t.imagen) || tallas.find((t) => t.imagen);
                      if (tallaConFoto?.imagen) {
                        imagenCard = tallaConFoto.imagen;
                        esFotoDeMedida = true;
                      }
                    }
                  }

                  return (
                    <article key={prod.id} className="sober-product-card">
                      {/* Imagen con badge */}
                      <div
                        className="product-image-frame"
                        onClick={() => setProductoParaDetalle(prod)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={imagenCard}
                          alt={prod.modelo}
                          className="sober-product-img"
                          loading="lazy"
                        />
                        {prod.destacado && (
                          <span className="sober-badge">
                            <span className="material-symbols-rounded badge-flame">local_fire_department</span>
                            Destacado
                          </span>
                        )}
                        {esFotoDeMedida && (
                          <span className="sober-badge measure-photo-badge" title="Fotografía según medida seleccionada">
                            <span className="material-symbols-rounded">photo_camera</span>
                            Foto por Medida
                          </span>
                        )}
                        <span className="product-category-overlay">
                          {prod.categoriaNombre}
                        </span>
                      </div>

                      {/* Información del Producto */}
                      <div className="product-info-centered">
                        <span className="product-cat-tag">
                          {prod.categoriaNombre || 'Línea Litúrgica'}
                        </span>

                        <h3
                          className="product-title-centered"
                          onClick={() => setProductoParaDetalle(prod)}
                          style={{ cursor: 'pointer' }}
                        >
                          {prod.modelo}
                        </h3>

                        {/* Fila de medidas disponibles en el producto */}
                        <div className="product-sizes-chips-row">
                          {tallas.slice(0, 4).map((t, idx) => (
                            <span key={idx} className="size-chip-preview" title={`${t.diametroMm} mm × ${t.largoCm} cm`}>
                              Ø {t.diametroMm}×{t.largoCm}cm
                            </span>
                          ))}
                          {tallas.length > 4 && (
                            <span className="size-chip-more">+{tallas.length - 4} más</span>
                          )}
                        </div>

                        {/* Precios */}
                        <div className="product-pricing-centered">
                          <span className="price-primary-centered">
                            Desde ${precioMin.toLocaleString('es-AR')}
                          </span>
                          <span className="price-wholesale-sub">
                            {tallas.length} medidas calibradas · Escala mayorista
                          </span>
                        </div>

                        {/* Botón de acción */}
                        <div className="product-card-action">
                          <button
                            type="button"
                            className="artisan-detail-btn"
                            onClick={() => setProductoParaDetalle(prod)}
                          >
                            <span className="material-symbols-rounded">straighten</span>
                            <span>Ver Medidas y Cotizar</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── MODAL DE DETALLE DEL PRODUCTO ── */}
      {productoParaDetalle && (
        <ProductoDetalleModal
          producto={productoParaDetalle}
          onClose={() => setProductoParaDetalle(null)}
          onAddToCart={(itemConfigurado) => {
            if (onAddToCart) onAddToCart(itemConfigurado);
            setMensajeNotificacion(
              `Añadido "${itemConfigurado.modelo} (${itemConfigurado.tamano})" al pedido litúrgico.`
            );
            setTimeout(() => setMensajeNotificacion(''), 4500);
          }}
        />
      )}
    </div>
  );
}
