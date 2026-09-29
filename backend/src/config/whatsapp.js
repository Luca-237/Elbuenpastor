require('dotenv').config();

/**
 * Configuración centralizada de WhatsApp Business Cloud API (Meta)
 */
const whatsappConfig = {
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v19.0',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  apiToken: process.env.WHATSAPP_API_TOKEN || '',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'ElBuenPastor_WA_VerifyToken_2026',
  adminPhone: process.env.WHATSAPP_ADMIN_PHONE || '5491140008800',
  enableAutoReply: process.env.WHATSAPP_ENABLE_AUTO_REPLY === 'true',

  // URL base para el envío de mensajes a través de la API oficial de Meta
  getMessagesUrl() {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
  },

  // Headers de autorización para las peticiones a Meta
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  },

  // Verificar si la configuración requerida está completa
  isConfigured() {
    return Boolean(this.phoneNumberId && this.apiToken);
  }
};

module.exports = whatsappConfig;
