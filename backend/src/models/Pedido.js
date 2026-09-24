const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * COLECCIÓN: pedidos
 *
 * DECISIÓN DE DISEÑO — Items del pedido: SNAPSHOT EMBEBIDO ─────────────────
 *
 * Los ítems del pedido son la decisión de diseño más crítica de todo el sistema.
 * Se embedden como SNAPSHOT (copia en el momento del pedido) y NO como
 * referencias a los documentos originales. Razones fundamentales:
 *
 *   1. INMUTABILIDAD HISTÓRICA: Si el precio de una vela cambia de $500 a $600,
 *      los pedidos anteriores deben seguir mostrando $500. Con referencias,
 *      el precio se actualizaría automáticamente y rompería la contabilidad.
 *
 *   2. AUDITORÍA: Se guarda el nombre, precio y descripción tal como era
 *      al momento de la compra. Si el producto se elimina del catálogo,
 *      el historial de pedidos permanece intacto.
 *
 *   3. PERFORMANCE: Leer un pedido con todos sus ítems es un solo query.
 *      No requiere populate ni joins adicionales para el historial.
 *
 * Se mantiene una referencia débil al Producto original (productoId) solo
 * para poder navegar al producto desde el backoffice si aún existe.
 *
 * ─── Dirección de entrega — SNAPSHOT EMBEBIDO ────────────────────────────
 * Por la misma razón: si el cliente cambia su dirección, los pedidos
 * anteriores no deben verse afectados.
 */

// Sub-esquema: Ítem del pedido (snapshot)
const itemPedidoSchema = new Schema(
  {
    // Referencia débil al producto original (puede ser null si fue eliminado)
    productoId: {
      type: Schema.Types.ObjectId,
      ref: 'Producto',
      default: null,
    },

    // SNAPSHOT de datos del producto al momento del pedido
    sku: { type: String, required: true, uppercase: true },
    modeloNombre: { type: String, required: true },
    tamanoNombre: { type: String, required: true },
    aroma: { type: String, default: null },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad mínima es 1'],
    },
    precioUnitario: {
      type: Number,
      required: [true, 'El precio unitario es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal no puede ser negativo'],
    },
  },
  { _id: false }
);

// Sub-esquema: Dirección de entrega (snapshot)
const direccionEntregaSchema = new Schema(
  {
    calle: String,
    numero: String,
    piso: String,
    ciudad: { type: String, required: true },
    provincia: { type: String, required: true },
    codigoPostal: String,
    pais: { type: String, default: 'Argentina' },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// ESQUEMA PRINCIPAL: Pedido
// ─────────────────────────────────────────────────────────────────────────────
const pedidoSchema = new Schema(
  {
    // ── NÚMERO DE PEDIDO ──────────────────────────────────────────────────
    numeroPedido: {
      type: String,
      unique: true,
      // Se auto-genera en el pre-save hook: "PED-20240923-0001"
    },

    // ── CLIENTE (REFERENCIA) ──────────────────────────────────────────────
    // El cliente SÍ se referencia (no snapshot) porque necesitamos poder
    // contactarlo, ver su historial y actualizar sus datos en el futuro.
    cliente: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El cliente es obligatorio'],
    },
    // Caché del nombre del cliente para listados rápidos
    clienteNombre: {
      type: String,
      required: true,
    },

    // ── ESTADO DEL PEDIDO ─────────────────────────────────────────────────
    estado: {
      type: String,
      required: true,
      enum: {
        values: [
          'borrador',
          'pendiente',
          'confirmado',
          'en_preparacion',
          'listo',
          'enviado',
          'entregado',
          'cancelado',
        ],
        message: 'Estado de pedido no válido: {VALUE}',
      },
      default: 'pendiente',
    },

    // ── ÍTEMS (SNAPSHOT EMBEBIDO) ─────────────────────────────────────────
    items: {
      type: [itemPedidoSchema],
      required: [true, 'El pedido debe tener al menos un ítem'],
      validate: {
        validator: (arr) => arr && arr.length > 0,
        message: 'El pedido debe contener al menos un producto',
      },
    },

    // ── DIRECCIÓN DE ENTREGA (SNAPSHOT EMBEBIDO) ──────────────────────────
    direccionEntrega: direccionEntregaSchema,

    // ── TOTALES ───────────────────────────────────────────────────────────
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal no puede ser negativo'],
    },
    descuentoPorcentaje: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    descuentoMonto: {
      type: Number,
      default: 0,
      min: 0,
    },
    costoEnvio: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'El total no puede ser negativo'],
    },

    // ── PAGO ─────────────────────────────────────────────────────────────
    metodoPago: {
      type: String,
      enum: ['efectivo', 'transferencia', 'mercadopago', 'tarjeta', 'cuenta_corriente'],
    },
    estadoPago: {
      type: String,
      enum: ['pendiente', 'parcial', 'pagado', 'reembolsado'],
      default: 'pendiente',
    },

    // ── LOGÍSTICA ─────────────────────────────────────────────────────────
    tipoEntrega: {
      type: String,
      enum: ['retiro_local', 'envio_domicilio'],
      default: 'retiro_local',
    },
    fechaEntregaEstimada: {
      type: Date,
    },
    fechaEntregaReal: {
      type: Date,
    },

    notas: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'pedidos',
  }
);

// ── ÍNDICES ────────────────────────────────────────────────────────────────
pedidoSchema.index({ cliente: 1, createdAt: -1 }); // Historial de pedidos por cliente
pedidoSchema.index({ estado: 1, createdAt: -1 });   // Panel de administración
pedidoSchema.index({ estadoPago: 1 });

// ── AUTO-GENERAR NÚMERO DE PEDIDO ─────────────────────────────────────────
pedidoSchema.pre('save', async function (next) {
  if (!this.numeroPedido) {
    const hoy = new Date();
    const fecha = hoy.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Pedido').countDocuments();
    this.numeroPedido = `PED-${fecha}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);
