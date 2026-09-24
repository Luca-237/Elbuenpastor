/**
 * Barrel export de todos los modelos Mongoose.
 * Importar desde aquí garantiza que todos los modelos estén registrados
 * en Mongoose antes de usarlos (evita errores de "Schema hasn't been registered").
 */
const CategoriaCliente = require('./CategoriaCliente');
const Cliente = require('./Cliente');
const Tamano = require('./Tamano');
const ModeloVela = require('./ModeloVela');
const Producto = require('./Producto');
const Pedido = require('./Pedido');

module.exports = {
  CategoriaCliente,
  Cliente,
  Tamano,
  ModeloVela,
  Producto,
  Pedido,
};
