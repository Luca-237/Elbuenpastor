import React, { useState, useMemo } from 'react';
import './AdminPedidosTab.css';

export default function AdminPedidosTab({
  pedidos = [],
  onUpdatePedidoEstado,
  onDeletePedido,
  onRefreshPedidos,
}) {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // ── ESTADOS Y TRADUCCIONES CANÓNICAS ──
  const ESTADOS_MAP = {
    pendiente: { label: 'Pendiente', icon: 'pending_actions', class: 'status-badge-pendiente' },
    en_preparacion: { label: 'En Taller', icon: 'precision_manufacturing', class: 'status-badge-en_preparacion' },
    despachado: { label: 'Despachado', icon: 'local_shipping', class: 'status-badge-despachado' },
    enviado: { label: 'Despachado', icon: 'local_shipping', class: 'status-badge-despachado' },
    entregado: { label: 'Entregado', icon: 'check_circle', class: 'status-badge-entregado' },
    cancelado: { label: 'Cancelado', icon: 'cancel', class: 'status-badge-cancelado' },
    borrador: { label: 'Borrador', icon: 'edit_note', class: 'status-badge-pendiente' },
  };

  // ── CÁLCULO DE KPIS Y MÉTRICAS ──
  const kpis = useMemo(() => {
    const total = pedidos.length;
    const pendientes = pedidos.filter((p) => p.estado === 'pendiente' || p.estado === 'borrador').length;
    const enTaller = pedidos.filter((p) => p.estado === 'en_preparacion' || p.estado === 'confirmado').length;
    const entregados = pedidos.filter((p) => p.estado === 'entregado').length;
    const totalFacturado = pedidos
      .filter((p) => p.estado !== 'cancelado')
      .reduce((sum, p) => sum + (Number(p.total) || 0), 0);

    return { total, pendientes, enTaller, entregados, totalFacturado };
  }, [pedidos]);

  // ── FILTRADO Y BÚSQUEDA ──
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      // Filtro por estado
      if (filtroEstado !== 'todos') {
        if (filtroEstado === 'en_preparacion') {
          if (p.estado !== 'en_preparacion' && p.estado !== 'confirmado') return false;
        } else if (filtroEstado === 'despachado') {
          if (p.estado !== 'despachado' && p.estado !== 'enviado') return false;
        } else if (p.estado !== filtroEstado) {
          return false;
        }
      }

      // Filtro por búsqueda
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const num = (p.numeroPedido || '').toLowerCase();
        const cliente = (p.clienteNombre || '').toLowerCase();
        const tel = (p.clienteTelefono || p.cliente?.telefono || '').toLowerCase();
        const ciudad = (p.direccionEntrega?.ciudad || '').toLowerCase();

        return num.includes(q) || cliente.includes(q) || tel.includes(q) || ciudad.includes(q);
      }

      return true;
    });
  }, [pedidos, filtroEstado, busqueda]);

  // Formato de moneda
  const formatPrecio = (num) => {
    return `$ ${Number(num || 0).toLocaleString('es-AR')}`;
  };

  // Formato de fecha
  const formatFecha = (isoString) => {
    if (!isoString) return 'Hoy';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Generador de enlace WhatsApp para el cliente
  const getWhatsAppLink = (pedido) => {
    const rawTel = pedido.clienteTelefono || pedido.cliente?.telefono || '5491140008800';
    const cleanTel = rawTel.replace(/\D/g, '');
    const estadoObj = ESTADOS_MAP[pedido.estado] || { label: pedido.estado };

    const itemsResumen = (pedido.items || [])
      .map((it) => `• ${it.cantidad}x ${it.modeloNombre} (${it.tamanoNombre})`)
      .join('\n');

    const mensaje = `🕊️ *Taller Litúrgico El Buen Pastor*
Paz y bien, estimado/a *${pedido.clienteNombre}*.
Nos comunicamos respecto a su pedido *#${pedido.numeroPedido || 'PEDIDO'}*.

*Estado actual:* ${estadoObj.label}
*Total:* ${formatPrecio(pedido.total)}

*Detalle de artículos:*
${itemsResumen}

Quedamos a su entera disposición ante cualquier consulta para la celebración sagrada.`;

    return `https://wa.me/${cleanTel}?text=${encodeURIComponent(mensaje)}`;
  };

  return (
    <div className="admin-pedidos-wrapper animate-fade-in">
      {/* ── KPI METRICS BAR ── */}
      <div className="pedidos-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-icon-total">
            <span className="material-symbols-rounded">receipt_long</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.total}</span>
            <span className="kpi-label">Total Pedidos</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-icon-pending">
            <span className="material-symbols-rounded">pending_actions</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.pendientes}</span>
            <span className="kpi-label">Pendientes</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-icon-workshop">
            <span className="material-symbols-rounded">precision_manufacturing</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.enTaller}</span>
            <span className="kpi-label">En Taller</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-icon-delivered">
            <span className="material-symbols-rounded">task_alt</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.entregados}</span>
            <span className="kpi-label">Entregados</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-icon-revenue">
            <span className="material-symbols-rounded">payments</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{formatPrecio(kpis.totalFacturado)}</span>
            <span className="kpi-label">Facturación Total</span>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: FILTROS POR ESTADO Y BÚSQUEDA ── */}
      <div className="pedidos-toolbar">
        <div className="pedidos-filter-chips">
          <button
            type="button"
            className={`filter-chip-btn ${filtroEstado === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todos')}
          >
            <span>Todos</span>
            <span className="chip-count">{pedidos.length}</span>
          </button>

          <button
            type="button"
            className={`filter-chip-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('pendiente')}
          >
            <span>Pendientes</span>
            <span className="chip-count">
              {pedidos.filter((p) => p.estado === 'pendiente' || p.estado === 'borrador').length}
            </span>
          </button>

          <button
            type="button"
            className={`filter-chip-btn ${filtroEstado === 'en_preparacion' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('en_preparacion')}
          >
            <span>En Taller</span>
            <span className="chip-count">
              {pedidos.filter((p) => p.estado === 'en_preparacion' || p.estado === 'confirmado').length}
            </span>
          </button>

          <button
            type="button"
            className={`filter-chip-btn ${filtroEstado === 'despachado' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('despachado')}
          >
            <span>Despachados</span>
            <span className="chip-count">
              {pedidos.filter((p) => p.estado === 'despachado' || p.estado === 'enviado').length}
            </span>
          </button>

          <button
            type="button"
            className={`filter-chip-btn ${filtroEstado === 'entregado' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('entregado')}
          >
            <span>Entregados</span>
            <span className="chip-count">
              {pedidos.filter((p) => p.estado === 'entregado').length}
            </span>
          </button>
        </div>

        {/* Buscador de pedidos */}
        <div className="pedidos-search-wrap">
          <span className="material-symbols-rounded pedidos-search-icon">search</span>
          <input
            type="text"
            className="pedidos-search-input"
            placeholder="Buscar por cliente, N° pedido, ciudad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* ── LISTADO DE TARJETAS DE PEDIDOS ── */}
      {pedidosFiltrados.length === 0 ? (
        <div className="no-pedidos-banner">
          <span className="material-symbols-rounded no-pedidos-icon">inbox</span>
          <h3 className="no-pedidos-title">No hay pedidos en este estado</h3>
          <p className="no-pedidos-desc">
            {busqueda
              ? `No se encontraron pedidos que coincidan con "${busqueda}".`
              : 'Los pedidos y cotizaciones que ingresen desde la tienda o WhatsApp aparecerán aquí.'}
          </p>
          {(filtroEstado !== 'todos' || busqueda) && (
            <button
              type="button"
              className="admin-cancel-btn"
              onClick={() => {
                setFiltroEstado('todos');
                setBusqueda('');
              }}
            >
              Restablecer Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="pedidos-cards-stack">
          {pedidosFiltrados.map((pedido) => {
            const pedidoId = pedido._id || pedido.id;
            const estadoConfig = ESTADOS_MAP[pedido.estado] || {
              label: pedido.estado,
              icon: 'help',
              class: 'status-badge-pendiente',
            };

            return (
              <div key={pedidoId} className="pedido-admin-card">
                {/* 1. Header de la Tarjeta */}
                <div className="pedido-card-header">
                  <div className="pedido-meta-left">
                    <span className="pedido-code">
                      <span className="material-symbols-rounded pedido-code-icon">receipt</span>
                      {pedido.numeroPedido || `PED-${pedidoId.slice(-6)}`}
                    </span>
                    <span className="pedido-date-badge">
                      <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>schedule</span>
                      {formatFecha(pedido.createdAt || pedido.fecha)}
                    </span>
                  </div>

                  <div className="pedido-status-selector-wrap">
                    <span className={`status-badge-pill ${estadoConfig.class}`}>
                      <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>
                        {estadoConfig.icon}
                      </span>
                      {estadoConfig.label}
                    </span>

                    <select
                      className="status-select-native"
                      value={pedido.estado}
                      onChange={(e) => onUpdatePedidoEstado(pedidoId, e.target.value)}
                      title="Cambiar estado del pedido"
                    >
                      <option value="pendiente">🟡 Pendiente</option>
                      <option value="en_preparacion">🔵 En Taller</option>
                      <option value="despachado">🟣 Despachado</option>
                      <option value="entregado">🟢 Entregado</option>
                      <option value="cancelado">🔴 Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* 2. Cuerpo: Datos del Cliente e Ítems Solicitados */}
                <div className="pedido-card-body">
                  <div className="pedido-customer-info">
                    <span className="customer-heading">
                      <span className="material-symbols-rounded">church</span>
                      Comunidad Parroquial / Cliente
                    </span>
                    <h4 className="customer-name">{pedido.clienteNombre}</h4>

                    {(pedido.clienteTelefono || pedido.cliente?.telefono) && (
                      <div className="customer-detail-line">
                        <span className="material-symbols-rounded">phone</span>
                        <span>{pedido.clienteTelefono || pedido.cliente?.telefono}</span>
                      </div>
                    )}

                    {(pedido.clienteEmail || pedido.cliente?.email) && (
                      <div className="customer-detail-line">
                        <span className="material-symbols-rounded">mail</span>
                        <span>{pedido.clienteEmail || pedido.cliente?.email}</span>
                      </div>
                    )}

                    {pedido.direccionEntrega?.ciudad && (
                      <div className="customer-detail-line">
                        <span className="material-symbols-rounded">location_on</span>
                        <span>
                          {pedido.direccionEntrega.calle ? `${pedido.direccionEntrega.calle} ${pedido.direccionEntrega.numero || ''}, ` : ''}
                          {pedido.direccionEntrega.ciudad}, {pedido.direccionEntrega.provincia}
                        </span>
                      </div>
                    )}

                    {pedido.notas && (
                      <div className="pedido-notes-box">
                        <strong>Nota / Intención:</strong> {pedido.notas}
                      </div>
                    )}
                  </div>

                  {/* Tabla de Artículos Litúrgicos */}
                  <div className="pedido-items-table-wrap">
                    <table className="pedido-items-table">
                      <thead>
                        <tr>
                          <th>Artículo Litúrgico</th>
                          <th>Medida Canónica</th>
                          <th style={{ textAlign: 'center' }}>Cant.</th>
                          <th style={{ textAlign: 'right' }}>P. Unitario</th>
                          <th style={{ textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(pedido.items || []).map((it, idx) => (
                          <tr key={idx}>
                            <td className="item-name-cell">
                              {it.modeloNombre || it.modelo}
                              <span className="item-sku-tag">{it.sku}</span>
                            </td>
                            <td>
                              <span className="item-size-pill">
                                {it.tamanoNombre || it.tamano || 'Estándar'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: '700' }}>
                              x {it.cantidad}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {formatPrecio(it.precioUnitario)}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '700', color: '#231F1C' }}>
                              {formatPrecio(it.subtotal || it.cantidad * it.precioUnitario)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Footer: Total y Botones de Acción */}
                <div className="pedido-card-footer">
                  <div className="pedido-total-block">
                    <span className="pedido-total-label">Total del Pedido:</span>
                    <span className="pedido-total-amount">{formatPrecio(pedido.total)}</span>
                  </div>

                  <div className="pedido-actions-right">
                    <a
                      href={getWhatsAppLink(pedido)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-order"
                      title="Contactar al cliente con el desglose del pedido"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>chat</span>
                      WhatsApp Cliente
                    </a>

                    <button
                      type="button"
                      className="btn-delete-order"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar el pedido #${pedido.numeroPedido || pedidoId}?`)) {
                          onDeletePedido(pedidoId);
                        }
                      }}
                      title="Eliminar registro de pedido"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
