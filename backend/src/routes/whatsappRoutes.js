const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Verificación del Webhook por Meta
router.get('/webhook', (req, res) => whatsappController.verifyWebhook(req, res));

// Recepción de mensajes y eventos desde Meta
router.post('/webhook', (req, res) => whatsappController.handleWebhook(req, res));

// Envío manual de mensaje de texto
router.post('/send-message', (req, res) => whatsappController.sendMessage(req, res));

// Notificación de estado de pedido al cliente
router.post('/notify-order', (req, res) => whatsappController.notifyOrder(req, res));

// Diagnóstico de configuración
router.get('/status', (req, res) => whatsappController.getStatus(req, res));

module.exports = router;
