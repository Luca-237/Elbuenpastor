const config = require('../config/whatsapp');

/**
 * Servicio encargado de la comunicación directa con la API Cloud de WhatsApp (Meta)
 */
class WhatsAppService {
  /**
   * Normaliza números de teléfono a formato internacional E.164 sin signo '+' ni guiones
   * Maneja casos comunes de Argentina (+54 9 11 ... -> 54911...)
   */
  formatPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.toString().replace(/\D/g, '');

    // Si comienza con 54 y no tiene el 9 de móviles en Argentina
    if (cleaned.startsWith('54') && !cleaned.startsWith('549') && cleaned.length >= 12) {
      cleaned = '549' + cleaned.substring(2);
    }
    // Si es un número local de 10 dígitos argentino (ej: 1140008800)
    else if (cleaned.length === 10) {
      cleaned = '549' + cleaned;
    }

    return cleaned;
  }

  /**
   * Envía un mensaje de texto simple a un destinatario
   * @param {string} to - Número de teléfono formateado
   * @param {string} text - Contenido del mensaje
   */
  async sendTextMessage(to, text) {
    const formattedPhone = this.formatPhoneNumber(to);
    if (!config.isConfigured()) {
      console.warn('⚠️ [WhatsApp] Credenciales de Meta no configuradas. Simulación de envío:');
      console.log(`[Para: ${formattedPhone}] Mensaje:\n${text}`);
      return { simulated: true, success: true, to: formattedPhone, message: text };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: true,
        body: text,
      },
    };

    try {
      const response = await fetch(config.getMessagesUrl(), {
        method: 'POST',
        headers: config.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Error HTTP ${response.status}`);
      }

      console.log(`✅ [WhatsApp] Mensaje enviado a ${formattedPhone}. ID:`, data.messages?.[0]?.id);
      return { success: true, data };
    } catch (error) {
      console.error(`❌ [WhatsApp] Error al enviar mensaje a ${formattedPhone}:`, error.message);
      throw error;
    }
  }

  /**
   * Envía una plantilla oficial aprobada por Meta (Message Template)
   * Esencial para iniciar conversaciones o enviar avisos fuera de la ventana de 24 hs
   */
  async sendTemplateMessage(to, templateName, languageCode = 'es_AR', components = []) {
    const formattedPhone = this.formatPhoneNumber(to);
    if (!config.isConfigured()) {
      console.warn(`⚠️ [WhatsApp] Credenciales no configuradas. Simulación de plantilla "${templateName}":`, { to: formattedPhone, components });
      return { simulated: true, success: true, template: templateName };
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    };

    try {
      const response = await fetch(config.getMessagesUrl(), {
        method: 'POST',
        headers: config.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Error HTTP ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`❌ [WhatsApp] Error al enviar plantilla "${templateName}":`, error.message);
      throw error;
    }
  }

  /**
   * Envía un mensaje con botones de respuesta rápida interactivos
   */
  async sendInteractiveButtons(to, bodyText, buttons = []) {
    const formattedPhone = this.formatPhoneNumber(to);
    if (!config.isConfigured()) {
      console.log(`⚠️ [WhatsApp Simulación] Botones interactivos para ${formattedPhone}:\n${bodyText}`);
      return { simulated: true, success: true };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.slice(0, 3).map((btn, index) => ({
            type: 'reply',
            reply: {
              id: btn.id || `btn_${index}`,
              title: btn.title.slice(0, 20),
            },
          })),
        },
      },
    };

    try {
      const response = await fetch(config.getMessagesUrl(), {
        method: 'POST',
        headers: config.getHeaders(),
        body: JSON.stringify(payload),
      });

      return await response.json();
    } catch (error) {
      console.error('❌ [WhatsApp] Error enviando botones interactivos:', error.message);
      throw error;
    }
  }

  /**
   * Notifica al cliente cuando se genera o actualiza su pedido litúrgico
   */
  async notifyClientOrderUpdate(clientPhone, clientName, orderNumber, newStatusLabel, estimatedDate) {
    const message = `¡Paz y bien, *${clientName || 'Hermano/a'}*! 🕊️

Te informamos que tu pedido *${orderNumber}* de *El Buen Pastor* se encuentra actualmente:
🏷️ *Estado:* ${newStatusLabel}
📅 *Fecha estimada:* ${estimatedDate || 'A confirmar'}

Puedes consultar el seguimiento litúrgico en tiempo real desde nuestro portal web o respondiendo a este mensaje.
_Que la luz sagrada bendiga tu comunidad y tu hogar._`;

    return this.sendTextMessage(clientPhone, message);
  }

  /**
   * Notifica al Maestro de Taller (Admin) sobre una nueva cotización o pedido entrante
   */
  async notifyAdminNewOrder(orderData) {
    if (!config.adminPhone) return null;

    const message = `🔔 *NUEVO PEDIDO LITÚRGICO RECIBIDO*
═══════════════════════
📜 *Orden:* ${orderData.numeroPedido || 'Borrador'}
👤 *Cliente:* ${orderData.clienteNombre || 'Sin nombre'}
📞 *Teléfono:* ${orderData.telefono || 'No provisto'}
💰 *Total:* $${(orderData.total || 0).toLocaleString('es-AR')}
🏛️ *Destino:* ${orderData.ciudad || 'Por coordinar'}

_Revisar en el panel de administración o coordinar elaboración de cirios._`;

    return this.sendTextMessage(config.adminPhone, message);
  }

  /**
   * Respuesta automática litúrgica para mensajes entrantes de clientes
   */
  async handleIncomingMessage(senderPhone, messageText = '') {
    const textLower = messageText.toLowerCase().trim();

    // Si el usuario consulta por catálogo
    if (textLower.includes('catalogo') || textLower.includes('catálogo') || textLower.includes('precio') || textLower.includes('vela')) {
      const reply = `¡Paz y bien! 🕯️ Nuestro catálogo litúrgico cuenta con:
• *Cirios Pascuales y de Altar:* 100% Cera pura de abejas.
• *Velas de Soja Ecológica:* Para oración y recogimiento.
• *Velas Votivas y Sagrario:* Paquetes especiales para capillas.
• *Línea Botánica en Terracota:* Aromas sagrados de incienso, mirra y olivo.

Puedes explorar el catálogo interactivo y cotizar por volumen en nuestro portal: https://elbuenpastor.com.ar`;
      return this.sendTextMessage(senderPhone, reply);
    }

    // Si el usuario consulta por el estado de un pedido
    if (textLower.includes('pedido') || textLower.includes('seguimiento') || textLower.includes('estado')) {
      const reply = `Para consultar el estado de tu pedido, por favor indícanos tu número de orden (ej: *PED-20240924-0012*) o el nombre de tu parroquia/institución. Con gusto verificaremos la etapa de elaboración litúrgica. ✨`;
      return this.sendTextMessage(senderPhone, reply);
    }

    // Saludo de bienvenida por defecto
    const welcome = `¡Paz y bendición! Te has comunicado con el taller artesanal de *El Buen Pastor* — Ceras & Artículos Sagrados. 🕊️

Un maestro artesano atenderá tu consulta litúrgica a la brevedad. 

Si deseas información inmediata, cuéntanos:
1️⃣ Si representas a una *Parroquia/Comunidad* o es para un *Particular*.
2️⃣ Las cantidades y medidas de cirios que precisas.
3️⃣ La fecha litúrgica requerida para la entrega.`;

    return this.sendTextMessage(senderPhone, welcome);
  }
}

module.exports = new WhatsAppService();
