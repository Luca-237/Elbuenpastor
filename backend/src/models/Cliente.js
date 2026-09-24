const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * SUB-ESQUEMA embebido: Dirección
 *
 * DECISIÓN DE DISEÑO — Embebido dentro de Cliente:
 * La dirección es un dato que SOLO tiene sentido en el contexto de un cliente
 * específico. Nunca se consulta una dirección de forma independiente, siempre
 * se accede junto con los datos del cliente. Embebida elimina un JOIN innecesario.
 * En los Pedidos, la dirección de entrega se guarda como SNAPSHOT (copia al momento
 * del pedido) para preservar el historial aunque el cliente la cambie después.
 */
const direccionSchema = new Schema(
  {
    calle: { type: String, trim: true },
    numero: { type: String, trim: true },
    piso: { type: String, trim: true },
    ciudad: { type: String, trim: true, required: [true, 'La ciudad es obligatoria'] },
    provincia: { type: String, trim: true, required: [true, 'La provincia es obligatoria'] },
    codigoPostal: { type: String, trim: true },
    pais: { type: String, default: 'Argentina', trim: true },
  },
  { _id: false } // No necesita _id propio, es parte del Cliente
);

/**
 * COLECCIÓN: clientes
 *
 * DECISIÓN DE DISEÑO:
 * - Dirección: EMBEBIDA (ver arriba)
 * - CategoriaCliente: REFERENCIADA por ObjectId
 *   Razón: La categoría es una entidad de negocio compartida y configurable.
 *   Referenciarla permite actualizar reglas de descuento desde un único lugar.
 */
const clienteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del cliente es obligatorio'],
      trim: true,
    },
    apellido: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido'],
    },
    telefono: {
      type: String,
      trim: true,
    },
    cuit: {
      type: String,
      trim: true,
      sparse: true, // Índice que permite múltiples null (no todos los clientes tienen CUIT)
    },

    // EMBEBIDO: La dirección pertenece exclusivamente al cliente
    direccion: direccionSchema,

    // REFERENCIA: La categoría es una entidad compartida y configurable
    categoria: {
      type: Schema.Types.ObjectId,
      ref: 'CategoriaCliente',
      required: [true, 'La categoría del cliente es obligatoria'],
    },

    activo: {
      type: Boolean,
      default: true,
    },

    notas: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'clientes',
  }
);

// Índices para búsquedas frecuentes
clienteSchema.index({ nombre: 'text', apellido: 'text', email: 'text' });
clienteSchema.index({ categoria: 1 });
clienteSchema.index({ activo: 1 });

module.exports = mongoose.model('Cliente', clienteSchema);
