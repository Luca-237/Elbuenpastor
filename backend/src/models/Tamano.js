const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * COLECCIÓN: tamanos
 *
 * DECISIÓN DE DISEÑO — Colección separada (Referenciada desde Producto):
 * Los tamaños son una tabla de lookup estandarizada que se reutiliza en
 * múltiples modelos de vela. Tener la colección separada permite:
 *   1. Agregar o modificar tamaños sin tocar ningún producto.
 *   2. Mantener consistencia en las dimensiones físicas.
 *   3. Filtrar el catálogo por tamaño de forma eficiente.
 *
 * Sin embargo, en el documento Producto se almacena un SNAPSHOT del nombre
 * del tamaño como string (campo `tamanoNombre`) para evitar populate en
 * las listas del catálogo. Este es el patrón "Referencia + Caché parcial".
 */
const tamanoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del tamaño es obligatorio'],
      unique: true,
      trim: true,
      // Ejemplos: "Chica", "Mediana", "Grande", "250g", "500g", "1kg"
    },
    descripcion: {
      type: String,
      trim: true,
    },
    // Peso en gramos (útil para calcular costos de envío)
    pesoGramos: {
      type: Number,
      min: [1, 'El peso debe ser mayor a 0'],
    },
    // Dimensiones físicas estandarizadas (Diámetro en mm y Largo/Altura en cm)
    diametroMm: {
      type: Number,
      min: [1, 'El diámetro debe ser mayor a 0 mm'],
    },
    largoCm: {
      type: Number,
      min: [1, 'El largo debe ser mayor a 0 cm'],
    },
    // Compatibilidad retroactiva
    alturaCm: {
      type: Number,
      min: [0, 'La altura no puede ser negativa'],
    },
    diametroCm: {
      type: Number,
      min: [0, 'El diámetro no puede ser negativo'],
    },
    // Categoría a la que pertenece esta medida estándar (velas-liturgicas, velones, cirios)
    categoriaId: {
      type: String,
      trim: true,
    },
    // Tiempo de combustión en horas (específico para velas)
    duracionHoras: {
      type: Number,
      min: [0, 'La duración no puede ser negativa'],
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'tamanos',
  }
);

module.exports = mongoose.model('Tamano', tamanoSchema);
