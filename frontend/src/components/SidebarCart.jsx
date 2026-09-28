import React, { useState } from 'react';
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
                {totalArticulos} {totalArticulos === 1 ? 'artículo' : 'artículos'} seleccionados
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
            Ítems del Carrito ({totalArticulos})
          </button>
          <button
            className={`drawer-tab-btn ${activeTab === 'actividad' ? 'active' : ''}`}
            onClick={() => setActiveTab('actividad')}
          >
            <span className="material-symbols-rounded">history</span>
            Actividad Reciente
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
                              -
                            </button>
                            <span className="qty-value">{item.cantidad}</span>
                            <button
                              className="qty-btn"
                              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                              aria-label="Aumentar cantidad"
                            >
                              +
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
