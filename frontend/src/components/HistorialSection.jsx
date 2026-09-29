import React, { useState } from 'react';
import './HistorialSection.css';

// Ejemplos representativos basados directamente en la colección 'pedidos' del backend
const PEDIDOS_DEMO = [
  {
    id: 'ord-01',
    numeroPedido: 'PED-20240924-0012',
    fecha: '24 Sep 2024',
    clienteNombre: 'Parroquia Nuestra Señora de la Merced',
    estado: 'en_preparacion',
    estadoLabel: 'En Preparación Litúrgica',
    estadoPago: 'pagado',
    metodoPago: 'Transferencia Bancaria',
    tipoEntrega: 'envio_domicilio',
    ciudad: 'Córdoba Capital, Córdoba',
    fechaEstimada: '30 de Septiembre 2024',
    items: [
      {
        sku: 'CIR-ABJ-GRD-002',
        modeloNombre: 'Cirio Pascual & Altar de Abejas',
        tamanoNombre: 'Grande (10x35 cm)',
        cantidad: 4,
        precioUnitario: 14500,
        subtotal: 58000,
      },
      {
        sku: 'VOT-LGT-X12-003',
        modeloNombre: 'Caja x12 Velas Votivas de Oración',
        tamanoNombre: 'Pack 12 unidades (4x5 cm)',
        cantidad: 15,
        precioUnitario: 4600, // Precio por volumen aplicado
        subtotal: 69000,
      },
    ],
    subtotal: 127000,
    descuentoMonto: 12700,
    costoEnvio: 0,
    total: 114300,
  },
  {
    id: 'ord-02',
    numeroPedido: 'PED-20240918-0008',
    fecha: '18 Sep 2024',
    clienteNombre: 'Capilla San Francisco de Asís',
    estado: 'entregado',
    estadoLabel: 'Entregado con Bendición',
    estadoPago: 'pagado',
    metodoPago: 'MercadoPago',
    tipoEntrega: 'envio_domicilio',
    ciudad: 'Rosario, Santa Fe',
    fechaEstimada: '22 de Septiembre 2024',
    items: [
      {
        sku: 'VEL-SOJ-MED-001',
        modeloNombre: 'Vela Cilíndrica Pura Soja',
        tamanoNombre: 'Mediana (8x10 cm)',
        cantidad: 20,
        precioUnitario: 3300,
        subtotal: 66000,
      },
      {
        sku: 'VEL-BOT-SMC-004',
        modeloNombre: 'Vela San Francisco en Terracota',
        tamanoNombre: 'Recipiente Cerámico (9x9 cm)',
        cantidad: 10,
        precioUnitario: 4200,
        subtotal: 42000,
      },
    ],
    subtotal: 108000,
    descuentoMonto: 5400,
    costoEnvio: 3500,
    total: 106100,
  },
  {
    id: 'ord-03',
    numeroPedido: 'PED-20240927-0019',
    fecha: '27 Sep 2024',
    clienteNombre: 'María Teresa Benítez (Particular)',
    estado: 'confirmado',
    estadoLabel: 'Confirmado / En cola de colada',
    estadoPago: 'pendiente',
    metodoPago: 'Efectivo contra entrega',
    tipoEntrega: 'retiro_local',
    ciudad: 'Retiro en Taller (Buenos Aires)',
    fechaEstimada: '2 de Octubre 2024',
    items: [
      {
        sku: 'VEL-SAG-FAM-006',
        modeloNombre: 'Vela Aromática Sagrada Familia',
        tamanoNombre: 'Frasco Ámbar con Tapa (250g)',
        cantidad: 2,
        precioUnitario: 4600,
        subtotal: 9200,
      },
    ],
    subtotal: 9200,
    descuentoMonto: 0,
    costoEnvio: 0,
    total: 9200,
  },
];

const PASOS_ESTADO = [
  { id: 'confirmado', label: 'Confirmado' },
  { id: 'en_preparacion', label: 'Elaboración' },
  { id: 'listo', label: 'Embalado' },
  { id: 'enviado', label: 'En Camino' },
  { id: 'entregado', label: 'Entregado' },
];

export default function HistorialSection() {
  const [busqueda, setBusqueda] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(PEDIDOS_DEMO[0]);

  const pedidosFiltrados = PEDIDOS_DEMO.filter((p) =>
    p.numeroPedido.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getStepIndex = (estado) => {
    switch (estado) {
      case 'confirmado': return 0;
      case 'en_preparacion': return 1;
      case 'listo': return 2;
      case 'enviado': return 3;
      case 'entregado': return 4;
      default: return 0;
    }
  };

  return (
    <section className="historial-section animate-fade-in">
      <div className="section-hero">
        <div className="container">
          <span className="section-eyebrow">
            <span className="material-symbols-rounded">description</span>
            Transparencia & Trazabilidad
          </span>
          <h2 className="section-title">Historial & Seguimiento de Pedidos</h2>
          <p className="section-subtitle">
            Consulta el estado de preparación litúrgica y despacho de tus cirios y ceras. Puedes buscar por número de pedido (ej. PED-20240924-0012) o por nombre.
          </p>

          {/* Barra de Búsqueda Serena */}
          <div className="search-bar-serene">
            <span className="material-symbols-rounded search-icon">search</span>
            <input
              type="text"
              placeholder="Buscar por N° pedido o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
            {busqueda && (
              <button className="clear-btn" onClick={() => setBusqueda('')}>
                <span className="material-symbols-rounded">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container historial-container">
        <div className="historial-grid">
          {/* Lista de Pedidos a la Izquierda */}
          <div className="pedidos-list">
            <div className="list-header">
              <span className="list-title">Órdenes Registradas ({pedidosFiltrados.length})</span>
            </div>

            {pedidosFiltrados.length === 0 ? (
              <div className="empty-pedidos">
                <span className="material-symbols-rounded">search_off</span>
                <p>No se encontraron pedidos que coincidan con la búsqueda.</p>
              </div>
            ) : (
              pedidosFiltrados.map((item) => {
                const isSelected = pedidoSeleccionado?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`pedido-summary-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setPedidoSeleccionado(item)}
                  >
                    <div className="summary-top">
                      <span className="summary-number">{item.numeroPedido}</span>
                      <span className={`summary-status-pill status-${item.estado}`}>
                        {item.estadoLabel}
                      </span>
                    </div>

                    <h4 className="summary-client">{item.clienteNombre}</h4>

                    <div className="summary-bottom">
                      <span className="summary-date">
                        <span className="material-symbols-rounded">calendar_today</span>
                        {item.fecha}
                      </span>
                      <span className="summary-total">${item.total.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detalle del Pedido Seleccionado */}
          {pedidoSeleccionado && (
            <div className="pedido-detail-card">
              <div className="detail-header">
                <div>
                  <span className="detail-eyebrow">Detalle de la Orden</span>
                  <h3 className="detail-number">{pedidoSeleccionado.numeroPedido}</h3>
                  <p className="detail-client">{pedidoSeleccionado.clienteNombre}</p>
                </div>

                <div className="detail-badges">
                  <span className={`payment-pill ${pedidoSeleccionado.estadoPago}`}>
                    <span className="material-symbols-rounded">
                      {pedidoSeleccionado.estadoPago === 'pagado' ? 'check_circle' : 'schedule'}
                    </span>
                    {pedidoSeleccionado.estadoPago === 'pagado' ? 'Pago Confirmado' : 'Pago Pendiente'}
                  </span>
                </div>
              </div>

              {/* Barra de progreso de estado litúrgico */}
              <div className="progress-timeline-box">
                <span className="timeline-title">Progreso del Pedido:</span>
                <div className="timeline-steps">
                  {PASOS_ESTADO.map((step, idx) => {
                    const currentIdx = getStepIndex(pedidoSeleccionado.estado);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step.id} className={`step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                        <div className="step-circle">
                          {isDone ? (
                            <span className="material-symbols-rounded">check</span>
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span className="step-label">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Información de Logística */}
              <div className="delivery-info-grid">
                <div className="info-box">
                  <span className="material-symbols-rounded">local_shipping</span>
                  <div>
                    <span className="box-title">Modalidad de Entrega</span>
                    <p className="box-desc">
                      {pedidoSeleccionado.tipoEntrega === 'envio_domicilio' ? 'Envío a Domicilio' : 'Retiro en Taller'}
                    </p>
                    <p className="box-sub">{pedidoSeleccionado.ciudad}</p>
                  </div>
                </div>

                <div className="info-box">
                  <span className="material-symbols-rounded">event</span>
                  <div>
                    <span className="box-title">Fecha Estimada de Llegada</span>
                    <p className="box-desc">{pedidoSeleccionado.fechaEstimada}</p>
                    <p className="box-sub">Método: {pedidoSeleccionado.metodoPago}</p>
                  </div>
                </div>
              </div>

              {/* Items del Pedido (Snapshot histórico como en la DB) */}
              <div className="items-table-section">
                <h4 className="table-heading">
                  <span className="material-symbols-rounded">inventory</span>
                  Ítems Consagrados del Pedido
                </h4>
                <div className="items-table">
                  <div className="table-row table-head">
                    <span>Producto / Modelo</span>
                    <span>Tamaño</span>
                    <span className="text-center">Cant.</span>
                    <span className="text-right">Precio Unit.</span>
                    <span className="text-right">Subtotal</span>
                  </div>

                  {pedidoSeleccionado.items.map((it, idx) => (
                    <div key={idx} className="table-row">
                      <div className="item-name-col">
                        <span className="item-sku">{it.sku}</span>
                        <strong className="item-name">{it.modeloNombre}</strong>
                      </div>
                      <span className="item-size">{it.tamanoNombre}</span>
                      <span className="item-qty text-center">{it.cantidad} un.</span>
                      <span className="item-price-unit text-right">${it.precioUnitario.toLocaleString('es-AR')}</span>
                      <span className="item-subtotal-col text-right font-bold">${it.subtotal.toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>

                {/* Resumen de totales */}
                <div className="totals-summary-box">
                  <div className="total-line">
                    <span>Subtotal de productos:</span>
                    <span>${pedidoSeleccionado.subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  {pedidoSeleccionado.descuentoMonto > 0 && (
                    <div className="total-line discount-line">
                      <span>Descuento por escala mayorista:</span>
                      <span>-${pedidoSeleccionado.descuentoMonto.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <div className="total-line">
                    <span>Costo de envío / despacho:</span>
                    <span>
                      {pedidoSeleccionado.costoEnvio === 0
                        ? 'Bonificado (Gratis)'
                        : `$${pedidoSeleccionado.costoEnvio.toLocaleString('es-AR')}`}
                    </span>
                  </div>
                  <div className="total-line grand-total">
                    <span>Total de la Orden:</span>
                    <span>${pedidoSeleccionado.total.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
