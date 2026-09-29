import React, { useState } from 'react';
import { createWhatsAppUrl, buildOrderWhatsAppMessage } from '../utils/whatsappHelper';
import './SidebarCart.css';

export default function SidebarCart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  activityLog = [],
  onFinalizarPedido,
}) {
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'actividad'

  // Calcular precio unitario según escala por volumen
  const getPrecioCalculado = (item) => {
    if (!item.preciosPorVolumen || item.preciosPorVolumen.length === 0) {
      return item.precioUnitario;
    }
    const tramo = item.preciosPorVolumen.find(
      (t) => item.cantidad >= t.min && (t.max === null || item.cantidad <= t.max)
    );
    return tramo ? tramo.precio : item.precioUnitario;
  };

  // Totales
  const subtotal = cartItems.reduce((acc, item) => {
    const precio = getPrecioCalculado(item);
    return acc + precio * item.cantidad;
  }, 0);

  const subtotalOriginal = cartItems.reduce(
    (acc, item) => acc + item.precioUnitario * item.cantidad,
    0
  );

  const ahorroMayorista = subtotalOriginal - subtotal;
  const totalArticulos = cartItems.reduce((acc, item) => acc + item.cantidad, 0);

  const handleWhatsAppCheckout = () => {
    const msg = buildOrderWhatsAppMessage(cartItems);
    const url = createWhatsAppUrl(msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Fondo oscuro semitransparente con blur */}
      <div 
        className={`cart-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Desplegable Derecha */}
      <aside 
        className={`sidebar-cart-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Panel de pedido y actividad"
      >
        {/* Encabezado del Panel */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="material-symbols-rounded drawer-icon">shopping_bag</span>
            <div>
              <h2 className="drawer-title">MI PEDIDO LITÚRGICO</h2>
              <span className="drawer-subtitle">
                {totalArticulos} {totalArticulos === 1 ? 'artículo seleccionado' : 'artículos seleccionados'}
              </span>
            </div>
          </div>
          <button 
            className="drawer-close-btn" 
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        {/* Pestañas: Ítems del Pedido vs Registro de Actividad */}
        <div className="drawer-tabs">
          <button
            className={`drawer-tab-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <span className="material-symbols-rounded">inventory_2</span>
            <span>Ítems del Carrito</span>
            {totalArticulos > 0 && (
              <span className="activity-badge-num">{totalArticulos}</span>
            )}
          </button>
          <button
            className={`drawer-tab-btn ${activeTab === 'actividad' ? 'active' : ''}`}
            onClick={() => setActiveTab('actividad')}
          >
            <span className="material-symbols-rounded">history</span>
            <span>Actividad Reciente</span>
            {activityLog.length > 0 && (
              <span className="activity-badge-num">{activityLog.length}</span>
            )}
          </button>
        </div>

        {/* Cuerpo del Drawer: Pestaña de Ítems */}
        {activeTab === 'items' && (
          <div className="drawer-body">
            {cartItems.length === 0 ? (
              <div className="cart-empty-state">
                <span className="material-symbols-rounded empty-cart-icon">spa</span>
                <h3>Tu pedido está vacío</h3>
                <p>
                  Explora nuestro catálogo de cirios pascuales y ceras artesanales para añadir productos a tu solicitud.
                </p>
                <md-outlined-button onClick={onClose}>
                  Continuar Viendo Catálogo
                </md-outlined-button>
              </div>
            ) : (
              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const precioAplicado = getPrecioCalculado(item);
                  const tieneDescuento = precioAplicado < item.precioUnitario;

                  return (
                    <article key={item.id} className="cart-item-row">
                      <div className="cart-item-img-wrap">
                        <img 
                          src={item.imagen} 
                          alt={item.modelo} 
                          className="cart-item-img"
                        />
                      </div>

                      <div className="cart-item-info">
                        <div className="cart-item-top">
                          <span className="cart-item-sku">{item.sku}</span>
                          <button
                            className="cart-item-delete"
                            onClick={() => onRemoveItem(item.id)}
                            title="Eliminar del pedido"
                          >
                            <span className="material-symbols-rounded">delete</span>
                          </button>
                        </div>

                        <h4 className="cart-item-name">{item.modelo}</h4>
                        <span className="cart-item-size">{item.tamano}</span>

                        {tieneDescuento && (
                          <div className="wholesale-tier-badge">
                            <span className="material-symbols-rounded">local_offer</span>
                            Escala mayorista aplicada
                          </div>
                        )}

                        <div className="cart-item-controls-price">
                          {/* Selector de cantidad */}
                          <div className="qty-control-box">
                            <button
                              className="qty-btn"
                              onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
                              aria-label="Disminuir cantidad"
                            >
                              <span className="qty-symbol">−</span>
                            </button>
                            <span className="qty-value">{item.cantidad}</span>
                            <button
                              className="qty-btn"
                              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                              aria-label="Aumentar cantidad"
                            >
                              <span className="qty-symbol">+</span>
                            </button>
                          </div>

                          {/* Precio */}
                          <div className="cart-price-block">
                            <span className="unit-price">
                              ${precioAplicado.toLocaleString('es-AR')} c/u
                            </span>
                            <strong className="item-subtotal">
                              ${(precioAplicado * item.cantidad).toLocaleString('es-AR')}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Cuerpo del Drawer: Pestaña de Registro de Actividad */}
        {activeTab === 'actividad' && (
          <div className="drawer-body">
            <div className="activity-timeline">
              <span className="activity-intro-text">
                Trazabilidad de acciones llevadas a cabo en la sesión:
              </span>

              {activityLog.length === 0 ? (
                <div className="empty-activity">
                  <span className="material-symbols-rounded">pending_actions</span>
                  <p>Aún no se han registrado acciones en esta sesión.</p>
                </div>
              ) : (
                <div className="activity-feed">
                  {activityLog.map((log) => (
                    <div key={log.id} className={`activity-log-item log-${log.type}`}>
                      <div className="log-icon-circle">
                        <span className="material-symbols-rounded">
                          {log.type === 'add' ? 'add_shopping_cart' :
                           log.type === 'remove' ? 'remove_shopping_cart' :
                           log.type === 'discount' ? 'auto_awesome' : 'info'}
                        </span>
                      </div>
                      <div className="log-content">
                        <div className="log-header">
                          <strong className="log-action">{log.titulo}</strong>
                          <span className="log-time">{log.time}</span>
                        </div>
                        <p className="log-desc">{log.detalle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer del Drawer con desglose y CTA */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-totals-breakdown">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>${subtotalOriginal.toLocaleString('es-AR')}</span>
              </div>

              {ahorroMayorista > 0 && (
                <div className="totals-row discount-row">
                  <span className="discount-label">
                    <span className="material-symbols-rounded">verified</span>
                    Ahorro por volumen:
                  </span>
                  <span>-${ahorroMayorista.toLocaleString('es-AR')}</span>
                </div>
              )}

              <div className="totals-row grand-total-row">
                <span>Total Estimado:</span>
                <span className="grand-total-amount">
                  ${subtotal.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <div className="drawer-actions-stack">
              <md-filled-button 
                class="checkout-btn-full"
                onClick={() => {
                  if (onFinalizarPedido) onFinalizarPedido();
                }}
              >
                <span slot="icon" className="material-symbols-rounded">assignment_turned_in</span>
                Formalizar Pedido / Solicitar Cotización
              </md-filled-button>

              <button
                type="button"
                className="btn-whatsapp-cart-checkout"
                onClick={handleWhatsAppCheckout}
                title="Enviar detalle del pedido a WhatsApp del Taller"
              >
                <svg className="wa-svg-inline" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 2C8.28 2 2 8.28 2 16c0 2.72.78 5.27 2.14 7.43L2.5 30l6.77-1.61A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm7.9 19.8c-.33.93-1.63 1.77-2.67 1.95-.71.12-1.64.22-4.76-1.07-3.99-1.65-6.57-5.71-6.77-5.98-.2-.27-1.62-2.16-1.62-4.12 0-1.96 1.03-2.92 1.4-3.32.37-.4.81-.5 1.08-.5.27 0 .54 0 .78.02.25.01.59-.1.92.7.33.81 1.13 2.76 1.23 2.96.1.2.17.44.03.71-.14.27-.21.44-.41.68-.2.24-.43.53-.61.71-.2.2-.42.42-.18.83.24.41 1.07 1.77 2.3 2.87 1.58 1.41 2.92 1.84 3.33 2.05.41.2.65.17.89-.1.24-.27 1.02-1.18 1.29-1.59.27-.4.54-.34.91-.2.37.14 2.37 1.12 2.78 1.32.41.2.68.3.78.47.1.17.1 1.04-.23 1.97z" />
                </svg>
                Enviar Pedido vía WhatsApp
              </button>

              <div className="footer-aux-actions">
                <button 
                  className="clear-cart-link" 
                  onClick={onClearCart}
                >
                  <span className="material-symbols-rounded">delete_sweep</span>
                  Vaciar pedido
                </button>
                <span className="secure-badge">
                  <span className="material-symbols-rounded">lock</span>
                  Atención Directa del Taller
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
