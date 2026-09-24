const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * COLECCIÓN: productos (SKUs)
 *
 * DECISIÓN DE DISEÑO — La pieza central de la arquitectura:
 *
 * Un Producto es la VARIANTE final: la combinación única de ModeloVela + Tamaño.
 * Es el elemento que se agrega al carrito, tiene stock propio y precio propio.
 *
 * ─── ¿Por qué NO embeber las variantes dentro del ModeloVela? ───────────────
 * Embeber variantes en el modelo causaría documentos muy grandes y dificultaría:
 *   - Consultar un SKU puntual (requeriría $elemMatch complejo)
 *   - Actualizar stock de un SKU sin reemplazar todo el array
 *   - Escalar si en el futuro se agregan muchos tamaños/colores
 *
 * ─── Precios por Volumen — EMBEBIDOS dentro del Producto ────────────────────
 * Los tramos de precio (`preciosPorVolumen`) están EMBEBIDOS y NO referenciados.
 * Razones:
 *   1. ACCESO SIEMPRE CONJUNTO: Cuando se muestra un producto, SIEMPRE se
 *      necesitan todos sus tramos de precio. Nunca se consultan por separado.
 *   2. TAMAÑO FIJO Y PEQUEÑO: Un SKU tendrá como máximo 4-5 tramos de precio.
 *      No hay riesgo de crecimiento ilimitado del array.
 *   3. ATOMICIDAD: Al actualizar precios, se reemplaza el array completo.
 *      No hay riesgo de inconsistencia parcial.
 *   4. PERFORMANCE: Evita un segundo query o un $lookup para calcular
 *      el precio correcto según la cantidad en el carrito.
 *
 * ─── Tamaño — REFERENCIADO pero con caché parcial ─────────────────────────
 * Se guarda el ObjectId de Tamaño (para filtros y joins cuando sea necesario)
 * y también `tamanoNombre` como string (para listados rápidos sin populate).
 * Patrón: "Referencia con caché" (Extended Reference Pattern).
 */

// Sub-esquema: Un tramo de precio por volumen
const tramoPrecioSchema = new Schema(
  {
    cantidadMinima: {
      type: Number,
      required: [true, 'La cantidad mínima es obligatoria'],
      min: [1, 'La cantidad mínima debe ser al menos 1'],
    },
    // null = "en adelante" (sin límite superior)
    cantidadMaxima: {
      type: Number,
      default: null,
      min: [1, 'La cantidad máxima debe ser al menos 1'],
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
  },
  { _id: false } // Son sub-documentos sin identidad propia
);

// Sub-esquema: Imagen del producto
const imagenProductoSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    esPrincipal: { type: Boolean, default: false },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// ESQUEMA PRINCIPAL: Producto (SKU)
// ─────────────────────────────────────────────────────────────────────────────
const productoSchema = new Schema(
  {
    // ── REFERENCIAS ──────────────────────────────────────────────────────────
    modelo: {
      type: Schema.Types.ObjectId,
      ref: 'ModeloVela',
      required: [true, 'El modelo de vela es obligatorio'],
    },
    tamano: {
      type: Schema.Types.ObjectId,
      ref: 'Tamano',
      required: [true, 'El tamaño es obligatorio'],
    },

    // ── CACHÉ PARCIAL (Extended Reference Pattern) ────────────────────────
    // Se cachean datos críticos de lectura frecuente para evitar populate
    // en listados de catálogo. Deben actualizarse si el modelo/tamaño cambia.
    modeloNombre: {
      type: String,
      required: true,
      trim: true,
    },
    tamanoNombre: {
      type: String,
      required: true,
      trim: true,
    },

    // ── IDENTIFICADORES ───────────────────────────────────────────────────
    sku: {
      type: String,
      required: [true, 'El SKU es obligatorio'],
      unique: true,
      uppercase: true,
      trim: true,
      // Formato sugerido: "VEL-CIL-GRD-001"
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ── PRECIOS POR VOLUMEN (EMBEBIDOS) ───────────────────────────────────
    // Array ordenado de tramos. Debe validarse que no se superpongan rangos.
    // Ejemplo:
    // [
    //   { cantidadMinima: 1,  cantidadMaxima: 9,  precio: 500 },
    //   { cantidadMinima: 10, cantidadMaxima: 49, precio: 450 },
    //   { cantidadMinima: 50, cantidadMaxima: null, precio: 400 },
    // ]
    preciosPorVolumen: {
      type: [tramoPrecioSchema],
      required: [true, 'Debe definir al menos un tramo de precio'],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: 'El producto debe tener al menos un tramo de precio',
      },
    },

    // ── STOCK ─────────────────────────────────────────────────────────────
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    stockMinimo: {
      type: Number,
      default: 5,
      min: [0, 'El stock mínimo no puede ser negativo'],
    },

    // ── IMÁGENES DEL SKU ─────────────────────────────────────────────────
    // Imágenes específicas de esta variante (pueden diferir del modelo base)
    imagenes: [imagenProductoSchema],

    // ── ATRIBUTOS ADICIONALES ─────────────────────────────────────────────
    aroma: {
      type: String,
      trim: true,
      // El aroma específico seleccionado para este SKU (si aplica)
    },
    activo: {
      type: Boolean,
      default: true,
    },
    destacado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'productos',
  }
);

// ── ÍNDICES ────────────────────────────────────────────────────────────────
// Unicidad de combinación modelo + tamaño (no puede existir el mismo SKU dos veces)
productoSchema.index({ modelo: 1, tamano: 1 }, { unique: true });
productoSchema.index({ activo: 1, destacado: 1 });
productoSchema.index({ stock: 1 }); // Para alertas de stock bajo
productoSchema.index({ modeloNombre: 'text', tamanoNombre: 'text', aroma: 'text' });

// ── MÉTODO: Obtener precio según cantidad ─────────────────────────────────
productoSchema.methods.getPrecioPorCantidad = function (cantidad) {
  const tramo = this.preciosPorVolumen.find((t) => {
    const dentroDelMinimo = cantidad >= t.cantidadMinima;
    const dentroDelMaximo = t.cantidadMaxima === null || cantidad <= t.cantidadMaxima;
    return dentroDelMinimo && dentroDelMaximo;
  });
  return tramo ? tramo.precio : null;
};

module.exports = mongoose.model('Producto', productoSchema);
