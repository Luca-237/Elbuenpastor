import React, { useState } from 'react';
import './ProductoDetalleModal.css';

export default function ProductoDetalleModal({ producto, onClose, onAddToCart }) {
  // Lista de medidas y tamaños disponibles
  const tamanosDisponibles = producto?.tamanosPorNumero || [];

  // Tamaño por defecto (el marcado como isDefault o el primero)
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState(() => {
    return (
      tamanosDisponibles.find((t) => t.isDefault) ||
      tamanosDisponibles[0] || {
        diametroMm: 70,
        largoCm: 85,
        dimensiones: 'Ø 70 mm × 85 cm',
        label: '70 mm × 85 cm',
        duracionHoras: 160,
        precioUnitario: producto?.precioUnitario || 15000,
      }
    );
  });



  // Cantidad seleccionada
  const [cantidad, setCantidad] = useState(1);

  // Notificación al añadir
  const [mensajeExito, setMensajeExito] = useState(false);

  if (!producto) return null;

  // Precio unitario base para la medida seleccionada
  const precioUnitarioBase = tamanoSeleccionado.precioUnitario || producto.precioUnitario;

  // Escalar tramos mayoristas según la medida elegida
  const factorEscala = precioUnitarioBase / (producto.precioUnitario || 1);
  const preciosPorVolumenDinamicos = (producto.preciosPorVolumen || [
    { min: 1, max: 9, precio: producto.precioUnitario },
    { min: 10, max: 49, precio: Math.round(producto.precioUnitario * 0.85) },
    { min: 50, max: null, precio: Math.round(producto.precioUnitario * 0.75) },
  ]).map((tramo) => ({
    ...tramo,
    precio: Math.round(tramo.precio * factorEscala),
  }));

  // Obtener precio unitario efectivo según cantidad elegida
  const tramoActual = preciosPorVolumenDinamicos.find(
    (t) => cantidad >= t.min && (t.max === null || cantidad <= t.max)
  );
  const precioAplicadoUnitario = tramoActual ? tramoActual.precio : precioUnitarioBase;
  const precioTotal = precioAplicadoUnitario * cantidad;

  // Determinar modo de imagen (general vs por medida) y foto activa
  const esModoPorMedida = producto.modoImagen === 'por_medida';
  const imagenMedidaActual = tamanoSeleccionado?.imagen;
  const imagenAMostrar = (esModoPorMedida && imagenMedidaActual) ? imagenMedidaActual : (producto.imagen || imagenMedidaActual);

  // Manejador para añadir al pedido
  const handleAddToCartClick = () => {
    const medidaLabel = tamanoSeleccionado.dimensiones || `${tamanoSeleccionado.diametroMm} mm × ${tamanoSeleccionado.largoCm} cm`;
    const itemConfigurado = {
      ...producto,
      imagen: imagenAMostrar,
      cartItemId: `${producto.id}-${tamanoSeleccionado.diametroMm}x${tamanoSeleccionado.largoCm}`,
      sku: `${producto.sku}-${tamanoSeleccionado.diametroMm}x${tamanoSeleccionado.largoCm}`,
      tamano: medidaLabel,
      diametroMm: tamanoSeleccionado.diametroMm,
      largoCm: tamanoSeleccionado.largoCm,
      precioUnitario: precioUnitarioBase,
      preciosPorVolumen: preciosPorVolumenDinamicos,
      cantidad: cantidad,
    };

    if (onAddToCart) {
      onAddToCart(itemConfigurado);
    }

    setMensajeExito(true);
    setTimeout(() => {
      setMensajeExito(false);
    }, 2800);
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
              <img
                src={imagenAMostrar}
                alt={`${producto.modelo} - Ø ${tamanoSeleccionado.diametroMm} mm × ${tamanoSeleccionado.largoCm} cm`}
                className="modal-product-image"
              />
              {producto.destacado && <span className="modal-badge-destacado">Destacado Litúrgico</span>}
              {esModoPorMedida && imagenMedidaActual && (
                <span className="modal-badge-medida-foto" title="Fotografía calibrada para esta medida específica">
                  <span className="material-symbols-rounded">photo_camera</span>
                  Foto: Ø {tamanoSeleccionado.diametroMm}×{tamanoSeleccionado.largoCm}cm
                </span>
              )}
            </div>

            <div className="modal-spec-chips">
              <div className="spec-chip">
                <span className="material-symbols-rounded">wb_incandescent</span>
                <span>{producto.categoriaNombre}</span>
              </div>
              <div className="spec-chip">
                <span className="material-symbols-rounded">flare</span>
                <span>Calibre Canónico de Altar</span>
              </div>
              <div className="spec-chip">
                <span className="material-symbols-rounded">straighten</span>
                <span>Calibre: Ø {tamanoSeleccionado.diametroMm} mm × {tamanoSeleccionado.largoCm} cm</span>
              </div>
            </div>

            {/* Esquema visual de la vela */}
            <div className="candle-schematic-box">
              <div className="candle-flame-icon">
                <span className="material-symbols-rounded">local_fire_department</span>
              </div>
              <div className="candle-silhouette-preview">
                <div 
                  className="candle-cylinder"
                  style={{
                    width: `${Math.min(90, Math.max(28, (tamanoSeleccionado.diametroMm || 50) * 0.85))}px`,
                    height: `${Math.min(140, Math.max(50, (tamanoSeleccionado.largoCm || 50) * 1.1))}px`,
                  }}
                >
                  <span className="cylinder-diam-label">{tamanoSeleccionado.diametroMm} mm</span>
                </div>
                <span className="cylinder-height-label">{tamanoSeleccionado.largoCm} cm de altura</span>
              </div>
              <p className="candle-silhouette-note">
                Proporción física real: diámetro de {tamanoSeleccionado.diametroMm} mm y largo de {tamanoSeleccionado.largoCm} cm.
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: Títulos, Selector de Medida y Pedido */}
          <div className="modal-content-col">
            <div className="category-pill-header">
              <span className="material-symbols-rounded">church</span>
              <span>{producto.categoriaNombre}</span>
            </div>
            
            <h2 className="modal-product-title">{producto.modelo}</h2>

            <p className="modal-product-description">{producto.descripcion}</p>

            {/* ── 1. SELECTOR DE MEDIDA (DIÁMETRO EN MM × LARGO EN CM) ── */}
            <div className="modal-section-group">
              <div className="section-label-row">
                <span className="section-title">
                  <span className="material-symbols-rounded">straighten</span>
                  Seleccionar Medida (Diámetro × Largo):
                </span>
                <span className="selected-size-highlight">
                  {tamanoSeleccionado.dimensiones || `${tamanoSeleccionado.diametroMm} mm × ${tamanoSeleccionado.largoCm} cm`}
                </span>
              </div>

              <div className="size-number-grid">
                {tamanosDisponibles.map((tam, idx) => {
                  const isSelected =
                    tamanoSeleccionado.diametroMm === tam.diametroMm &&
                    tamanoSeleccionado.largoCm === tam.largoCm;
                  return (
                    <button
                      key={tam.id || idx}
                      type="button"
                      className={`size-number-btn ${isSelected ? 'active' : ''} ${esModoPorMedida && tam.imagen ? 'has-custom-img' : ''}`}
                      onClick={() => setTamanoSeleccionado(tam)}
                    >
                      {esModoPorMedida && tam.imagen && (
                        <div className="size-mini-thumb-wrap">
                          <img src={tam.imagen} alt={tam.dimensiones || 'Medida'} className="size-mini-thumb" />
                        </div>
                      )}
                      <span className="size-dim-badge">
                        <span className="diam-tag">Ø {tam.diametroMm} mm</span>
                        <span className="cross-sep">×</span>
                        <span className="len-tag">{tam.largoCm} cm</span>
                      </span>
                      <span className="size-num-price">${tam.precioUnitario.toLocaleString('es-AR')}</span>
                    </button>
                  );
                })}
              </div>

              <div className="size-info-banner">
                <span className="material-symbols-rounded">check_circle</span>
                <span>
                  <strong>Medida seleccionada: Ø {tamanoSeleccionado.diametroMm} mm × {tamanoSeleccionado.largoCm} cm</strong> · Proporción física calibrada para altares y candeleros.
                </span>
              </div>
            </div>

            {/* ── 2. PRECIOS Y ESCALA POR VOLUMEN ── */}
            <div className="modal-section-group wholesale-box-group">
              <span className="section-title">
                <span className="material-symbols-rounded">sell</span>
                Precios e Incentivos por Volumen (Parroquias y Distribuidores):
              </span>
              <div className="wholesale-tiers-flex">
                {preciosPorVolumenDinamicos.map((tramo, idx) => {
                  const isCurrentTier =
                    cantidad >= tramo.min && (tramo.max === null || cantidad <= tramo.max);
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

            {/* ── 4. RESUMEN Y BOTÓN AÑADIR AL PEDIDO ── */}
            <div className="modal-action-box">
              <div className="qty-and-pricing-row">
                {/* Control de Cantidad */}
                <div className="modal-qty-control">
                  <span className="qty-label">Cantidad:</span>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="qty-step-btn"
                      onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                      aria-label="Disminuir"
                    >
                      -
                    </button>
                    <span className="qty-value">{cantidad}</span>
                    <button
                      type="button"
                      className="qty-step-btn"
                      onClick={() => setCantidad((prev) => prev + 1)}
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Precio Total y Desglose */}
                <div className="modal-price-summary">
                  <span className="price-unit-note">
                    ${precioAplicadoUnitario.toLocaleString('es-AR')} c/u
                  </span>
                  <strong className="price-grand-total">
                    ${precioTotal.toLocaleString('es-AR')}
                  </strong>
                </div>
              </div>

              {/* Botón Principal para Añadir */}
              <button
                type="button"
                className="modal-add-to-cart-btn"
                onClick={handleAddToCartClick}
              >
                <span className="material-symbols-rounded">add_shopping_cart</span>
                <span>Añadir al Pedido Litúrgico</span>
              </button>

              {mensajeExito && (
                <div className="modal-toast-success animate-fade-in">
                  <span className="material-symbols-rounded">check</span>
                  ¡Añadido! {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'} ({tamanoSeleccionado.diametroMm} mm × {tamanoSeleccionado.largoCm} cm) agregadas al pedido.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
