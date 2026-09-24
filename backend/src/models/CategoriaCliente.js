const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * COLECCIÓN: categorias_cliente
 *
 * DECISIÓN DE DISEÑO — Colección separada (Referenciada desde Cliente):
 * Las categorías son entidades de configuración de negocio que se comparten
 * entre muchos clientes. Si un dueño del negocio cambia el descuento de
 * "Mayorista" de 15% a 20%, ese cambio debe reflejarse en TODOS los clientes
 * de esa categoría sin tocar cada documento de cliente. Embeber la categoría
 * en cada cliente crearía duplicación masiva e inconsistencias.
 */
const categoriaClienteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
      enum: {
        values: ['Consumidor Final', 'Mayorista', 'Distribuidor', 'Empleado'],
        message: 'Categoría no válida: {VALUE}',
      },
    },
    descripcion: {
      type: String,
      trim: true,
    },
    // Porcentaje de descuento por defecto para esta categoría (0 = sin descuento)
    descuentoPorcentaje: {
      type: Number,
      default: 0,
      min: [0, 'El descuento no puede ser negativo'],
      max: [100, 'El descuento no puede superar el 100%'],
    },
    // Cantidad mínima de unidades por pedido para acceder a los precios de esta categoría
    cantidadMinimaAcceso: {
      type: Number,
      default: 1,
      min: [1, 'La cantidad mínima debe ser al menos 1'],
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'categorias_cliente',
  }
);

module.exports = mongoose.model('CategoriaCliente', categoriaClienteSchema);
