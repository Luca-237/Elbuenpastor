const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * COLECCIÓN: modelos_vela
 *
 * DECISIÓN DE DISEÑO — Colección separada:
 * El ModeloVela representa el "diseño base" de una vela (ej: Cilíndrica,
 * Soja Aromática, Votiva). Es una entidad de catálogo que agrupa múltiples
 * SKUs (Productos). Se mantiene separada de los SKUs porque:
 *   - Las imágenes y descripción del modelo son compartidas por todos sus SKUs.
 *   - Permite listar los "modelos disponibles" sin traer datos de precios/stock.
 *   - Se puede desactivar un modelo completo sin eliminar el historial.
 *
 * Las VARIANTES (SKUs) son documentos en la colección `productos` que
 * referencian este modelo. NO se embedden aquí para evitar que el documento
 * crezca indefinidamente con cada tamaño agregado y para facilitar las
 * consultas por SKU individual.
 */
const modeloVelaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del modelo es obligatorio'],
      unique: true,
      trim: true,
      // Ejemplos: "Cilíndrica", "Soja Aromática", "Votiva", "Flotante", "Pilar"
    },
    descripcion: {
      type: String,
      trim: true,
    },
    // Tipo de material/cera principal
    tipoCera: {
      type: String,
      required: [true, 'El tipo de cera es obligatorio'],
      enum: {
        values: ['soja', 'parafina', 'abeja', 'gel', 'soja_parafina', 'otro'],
        message: 'Tipo de cera no válido: {VALUE}',
      },
    },
    // Aromas disponibles para este modelo (array de strings simples)
    // Se embedde porque son atributos del modelo, no entidades independientes
    aromas: [
      {
        type: String,
        trim: true,
      },
    ],
    // URLs de imágenes del modelo (sin tamaño específico)
    imagenes: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
        esPrincipal: { type: Boolean, default: false },
      },
    ],
    // Slug para URLs amigables
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    // Orden de presentación en el catálogo
    ordenCatalogo: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'modelos_vela',
  }
);

// Índice de texto para búsqueda en catálogo
modeloVelaSchema.index({ nombre: 'text', descripcion: 'text', aromas: 'text' });
modeloVelaSchema.index({ tipoCera: 1, activo: 1 });

// Auto-generar slug desde el nombre antes de guardar
modeloVelaSchema.pre('save', function (next) {
  if (this.isModified('nombre')) {
    this.slug = this.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('ModeloVela', modeloVelaSchema);
