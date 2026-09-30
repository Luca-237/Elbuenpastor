import React, { useState } from 'react';
import './ProductoDetalleModal.css';

export default function ProductoDetalleModal({ producto, onClose, onAddToCart }) {
  // Lista de tamaños por número disponibles (o valores por defecto)
  const tamanosDisponibles = producto?.tamanosPorNumero || [
    { numero: 1, label: 'Nº 1', dimensiones: '5 × 7 cm', duracionHoras: 25, precioUnitario: Math.round((producto?.precioUnitario || 3800) * 0.75) },
    { numero: 2, label: 'Nº 2', dimensiones: '6 × 8 cm', duracionHoras: 35, precioUnitario: Math.round((producto?.precioUnitario || 3800) * 0.88) },
    { numero: 3, label: 'Nº 3', dimensiones: producto?.tamano || '8 × 10 cm', duracionHoras: producto?.duracionHoras || 45, precioUnitario: producto?.precioUnitario || 3800, isDefault: true },
    { numero: 4, label: 'Nº 4', dimensiones: '10 × 12 cm', duracionHoras: 65, precioUnitario: Math.round((producto?.precioUnitario || 3800) * 1.3) },
    { numero: 5, label: 'Nº 5', dimensiones: '10 × 18 cm', duracionHoras: 90, precioUnitario: Math.round((producto?.precioUnitario || 3800) * 1.8) },
    { numero: 6, label: 'Nº 6', dimensiones: '10 × 25 cm', duracionHoras: 110, precioUnitario: Math.round((producto?.precioUnitario || 3800) * 2.5) },
  ];

  // Tamaño por defecto (Nº 3 o el primero)
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState(
    () => tamanosDisponibles.find((t) => t.isDefault) || tamanosDisponibles[2] || tamanosDisponibles[0]
  );

  // Aroma por defecto
  const [aromaSeleccionado, setAromaSeleccionado] = useState(
    () => producto?.aromaDefault || (producto?.aromas && producto.aromas[0]) || 'Estándar'
  );

  // Cantidad seleccionada
  const [cantidad, setCantidad] = useState(1);

  // Notificación al añadir
  const [mensajeExito, setMensajeExito] = useState(false);

  if (!producto) return null;

  // Calcular precio unitario base según tamaño
  const precioUnitarioBase = tamanoSeleccionado ? tamanoSeleccionado.precioUnitario : producto.precioUnitario;

  // Calcular precios por volumen dinámicos según el tamaño seleccionado
  const factorEscala = precioUnitarioBase / (producto.precioUnitario || 1);
  const preciosPorVolumenDinamicos = (producto.preciosPorVolumen || [
    { min: 1, max: 9, precio: producto.precioUnitario },
    { min: 10, max: 49, precio: Math.round(producto.precioUnitario * 0.85) },
    { min: 50, max: null, precio: Math.round(producto.precioUnitario * 0.75) },
  ]).map((tramo) => ({
    ...tramo,
    precio: Math.round(tramo.precio * factorEscala),
  }));

  // Obtener precio unitario aplicado según cantidad y escala
  const tramoActual = preciosPorVolumenDinamicos.find(
    (t) => cantidad >= t.min && (t.max === null || cantidad <= t.max)
  );
  const precioAplicadoUnitario = tramoActual ? tramoActual.precio : precioUnitarioBase;
  const precioTotal = precioAplicadoUnitario * cantidad;

  // Manejador para añadir al carrito
  const handleAddToCartClick = () => {
    const itemConfigurado = {
      ...producto,
      cartItemId: `${producto.id}-N${tamanoSeleccionado.numero}-${aromaSeleccionado.replace(/\s+/g, '')}`,
      sku: `${producto.sku}-N${tamanoSeleccionado.numero}`,
      tamano: `Nº ${tamanoSeleccionado.numero} (${tamanoSeleccionado.dimensiones})`,
      tamanoNumero: tamanoSeleccionado.numero,
      duracionHoras: tamanoSeleccionado.duracionHoras,
      precioUnitario: precioUnitarioBase,
      preciosPorVolumen: preciosPorVolumenDinamicos,
      aromaSeleccionado: aromaSeleccionado,
      cantidad: cantidad,
    };

    if (onAddToCart) {
      onAddToCart(itemConfigurado);
    }

    setMensajeExito(true);
    setTimeout(() => {
      setMensajeExito(false);
    }, 3000);
  };

  return (
    <div className="modal-detalle-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-detalle-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Botón para cerrar */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar detalle">
          <span className="material-symbols-rounded">close</span>
        </button>

        {/* Miga de pan interna y botón volver */}
        <div className="modal-top-bar">
          <button className="modal-back-link" onClick={onClose}>
            <span className="material-symbols-rounded">arrow_back</span>
            Volver al catálogo
          </button>
          <span className="modal-breadcrumbs">
            {producto.categoriaNombre} &gt; {producto.modelo}
          </span>
        </div>

        <div className="modal-detalle-grid">
          {/* COLUMNA IZQUIERDA: Imagen y Especificaciones rápidas */}
          <div className="modal-media-col">
            <div className="modal-image-wrapper">
              <img src={producto.imagen} alt={producto.modelo} className="modal-product-image" />
              {producto.destacado && <span className="modal-badge-destacado">Destacado</span>}
            </div>

            <div className="modal-spec-chips">
              <div className="spec-chip">
                <span className="material-symbols-rounded">energy_savings_leaf</span>
                <span>{producto.tipoCeraNombre}</span>
              </div>
              <div className="spec-chip">
                <span className="material-symbols-rounded">schedule</span>
                <span>Duración estimada: ~{tamanoSeleccionado.duracionHoras}h</span>
              </div>
              <div className="spec-chip">
                <span className="material-symbols-rounded">inventory</span>
                <span>Código SKU: {producto.sku}-N{tamanoSeleccionado.numero}</span>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Títulos, Selector de Tamaño por Número, Aroma y Botón de Carrito */}
          <div className="modal-content-col">
            <span className="modal-category-tag">{producto.categoriaNombre}</span>
            <h2 className="modal-product-title">{producto.modelo}</h2>

            <p className="modal-product-description">{producto.descripcion}</p>

            {/* ── 1. SELECTOR DE TAMAÑO POR NÚMERO ── */}
            <div className="modal-section-group">
              <div className="section-label-row">
                <span className="section-title">Elegir Tamaño de Vela (por Número):</span>
                <span className="selected-size-highlight">
                  Nº {tamanoSeleccionado.numero} — {tamanoSeleccionado.dimensiones}
                </span>
              </div>

              <div className="size-number-grid">
                {tamanosDisponibles.map((tam) => {
                  const isSelected = tamanoSeleccionado.numero === tam.numero;
                  return (
                    <button
                      key={tam.numero}
                      type="button"
                      className={`size-number-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setTamanoSeleccionado(tam)}
                    >
                      <span className="size-num-title">Nº {tam.numero}</span>
                      <span className="size-num-dims">{tam.dimensiones}</span>
                      <span className="size-num-price">${tam.precioUnitario.toLocaleString('es-AR')}</span>
                    </button>
                  );
                })}
              </div>

              <div className="size-info-banner">
                <span className="material-symbols-rounded">straighten</span>
                <span>
                  <strong>Tamaño seleccionado: Nº {tamanoSeleccionado.numero}</strong> — Medidas ({tamanoSeleccionado.dimensiones}). Rendimiento estimado de combustión: ~{tamanoSeleccionado.duracionHoras} horas.
                </span>
              </div>
            </div>

            {/* ── 2. SELECCIÓN DE AROMA / FRAGANCIA (Si aplica) ── */}
            {producto.aromas && producto.aromas.length > 0 && (
              <div className="modal-section-group">
                <span className="section-title">Aroma / Fragancia Sacra:</span>
                <div className="aroma-options-wrap">
                  {producto.aromas.map((aroma) => (
                    <button
                      key={aroma}
                      type="button"
                      className={`aroma-pill-btn ${aromaSeleccionado === aroma ? 'active' : ''}`}
                      onClick={() => setAromaSeleccionado(aroma)}
                    >
                      <span className="material-symbols-rounded">local_florist</span>
                      {aroma}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 3. PRECIOS Y ESCALA POR VOLUMEN (DINÁMICOS) ── */}
            <div className="modal-section-group wholesale-box-group">
              <span className="section-title">Precios e Incentivos por Cantidad:</span>
              <div className="wholesale-tiers-flex">
                {preciosPorVolumenDinamicos.map((tramo, idx) => {
                  const isCurrentTier = cantidad >= tramo.min && (tramo.max === null || cantidad <= tramo.max);
                  return (
                    <div
                      key={idx}
                      className={`wholesale-tier-card ${isCurrentTier ? 'active-tier' : ''}`}
                    >
                      <span className="tier-qty">
                        {tramo.max ? `${tramo.min} a ${tramo.max} u.` : `${tramo.min}+ u. (Mayorista)`}
                      </span>
                      <span className="tier-price">${tramo.precio.toLocaleString('es-AR')}</span>
                      <span className="tier-unit">por unidad</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 4. CANTIDAD Y BOTÓN AÑADIR AL CARRITO ── */}
            <div className="modal-action-bar">
              <div className="modal-qty-selector">
                <label htmlFor="modal-qty-input" className="qty-label">Cantidad:</label>
                <div className="qty-stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                    aria-label="Disminuir"
                  >
                    −
                  </button>
                  <span className="stepper-value" id="modal-qty-input">{cantidad}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setCantidad((prev) => prev + 1)}
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="modal-price-total-block">
                <span className="total-label">Total estimado:</span>
                <strong className="total-amount">${precioTotal.toLocaleString('es-AR')}</strong>
                {precioAplicadoUnitario < precioUnitarioBase && (
                  <span className="discount-applied-tag">Descuento mayorista incluido</span>
                )}
              </div>
            </div>

            {/* Botón Principal Añadir al Carrito */}
            <div className="modal-submit-row">
              <md-filled-button class="modal-add-cart-btn" onClick={handleAddToCartClick}>
                <span slot="icon" className="material-symbols-rounded">add_shopping_cart</span>
                Añadir {cantidad} {cantidad === 1 ? 'Unidad' : 'Unidades'} al Pedido
              </md-filled-button>

              {mensajeExito && (
                <div className="modal-success-banner animate-fade-in">
                  <span className="material-symbols-rounded">check_circle</span>
                  <span>¡Producto (Nº {tamanoSeleccionado.numero}) añadido a tu pedido con éxito!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
