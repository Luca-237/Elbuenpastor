const express = require('express');
const router = express.Router();
const {
  getProductos,
  updateProducto,
  bulkUpdatePrices,
} = require('../controllers/productoController');

router.get('/', getProductos);
router.put('/:id', updateProducto);
router.patch('/precios-masivos', bulkUpdatePrices);

module.exports = router;
