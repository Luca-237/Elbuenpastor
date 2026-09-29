const config = require('../config/whatsapp');
const whatsappService = require('../services/whatsappService');

/**
 * Controlador de Endpoints y Webhooks de WhatsApp Business Cloud API
 */
class WhatsAppController {
  /**
   * Verificación del Webhook por parte de Meta (GET)
   * Meta envía una petición con hub.mode, hub.verify_token y hub.challenge
   */
  verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode && token) {
        if (mode === 'subscribe' && token === config.verifyToken) {
          console.log('✅ [WhatsApp Webhook] Handshake verificado con éxito por Meta.');
          return res.status(200).send(challenge);
        } else {
          console.warn('❌ [WhatsApp Webhook] Token de verificación inválido:', token);
          return res.status(403).json({ error: 'Token de verificación incorrecto' });
        }
      }

      return res.status(400).json({ error: 'Parámetros de verificación ausentes' });
    } catch (error) {
      console.error('❌ [WhatsApp Webhook] Error en verifyWebhook:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Recepción de eventos y mensajes entrantes desde Meta (POST)
   */
  async handleWebhook(req, res) {
    // Es mandatorio responder 200 OK de inmediato a Meta para evitar retries o bloqueos
    res.status(200).send('EVENT_RECEIVED');

    try {
      const body = req.body;

      if (body.object !== 'whatsapp_business_account') {
        return;
      }

      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;

          // Registro de cambios de estado (sent, delivered, read)
          if (value.statuses) {
            for (const status of value.statuses) {
              console.log(`ℹ️ [WhatsApp Estado] Mensaje ${status.id} -> ${status.status} (${status.recipient_id})`);
            }
          }

          // Procesamiento de mensajes entrantes
          if (value.messages) {
            for (const message of value.messages) {
              const sender = message.from;
              const messageId = message.id;
              const type = message.type;

              console.log(`📩 [WhatsApp Mensaje] De: ${sender} | Tipo: ${type}`);

              let messageText = '';
              if (type === 'text') {
                messageText = message.text?.body || '';
              } else if (type === 'interactive') {
                messageText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
              }

              console.log(`📝 [WhatsApp Contenido]: "${messageText}"`);

              // Auto-respuesta si está habilitada
              if (config.enableAutoReply && messageText) {
                await whatsappService.handleIncomingMessage(sender, messageText);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [WhatsApp Webhook] Error procesando evento entrante:', error.message);
    }
  }

  /**
   * Endpoint para enviar mensaje manual desde la app/admin
   */
  async sendMessage(req, res) {
    try {
      const { to, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({ success: false, error: 'Se requiere número destinatario (to) y mensaje (message)' });
      }

      const result = await whatsappService.sendTextMessage(to, message);
      return res.status(200).json({ success: true, result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Endpoint para notificar actualización de pedido a un cliente
   */
  async notifyOrder(req, res) {
    try {
      const { telefono, clienteNombre, numeroPedido, estadoLabel, fechaEstimada } = req.body;
      if (!telefono || !numeroPedido) {
        return res.status(400).json({ success: false, error: 'telefono y numeroPedido son requeridos' });
      }

      const result = await whatsappService.notifyClientOrderUpdate(
        telefono,
        clienteNombre,
        numeroPedido,
        estadoLabel || 'En Elaboración',
        fechaEstimada
      );

      return res.status(200).json({ success: true, result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Estado y diagnóstico de la configuración de WhatsApp
   */
  getStatus(req, res) {
    return res.status(200).json({
      configured: config.isConfigured(),
      apiVersion: config.apiVersion,
      phoneNumberIdConfigured: Boolean(config.phoneNumberId),
      apiTokenConfigured: Boolean(config.apiToken),
      verifyTokenSet: Boolean(config.verifyToken),
      adminPhone: config.adminPhone,
      autoReplyEnabled: config.enableAutoReply,
      endpoints: {
        webhookGet: '/api/whatsapp/webhook (Meta verification)',
        webhookPost: '/api/whatsapp/webhook (Event receiver)',
        sendMessage: '/api/whatsapp/send-message (POST)',
        notifyOrder: '/api/whatsapp/notify-order (POST)',
      },
    });
  }
}

module.exports = new WhatsAppController();
