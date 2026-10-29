const express = require('express');
const router = express.Router();
const {
  getPedidos,
  getPedidoById,
  createPedido,
  updatePedidoEstado,
  deletePedido,
} = require('../controllers/pedidoController');

// Rutas de pedidos
router.get('/', getPedidos);
router.get('/:id', getPedidoById);
router.post('/', createPedido);
router.patch('/:id/estado', updatePedidoEstado);
router.delete('/:id', deletePedido);

module.exports = router;
