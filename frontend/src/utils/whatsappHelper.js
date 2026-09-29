/**
 * Helper para integración con WhatsApp Web y WhatsApp Business
 * Permite generar enlaces directos preformateados para consultas litúrgicas,
 * cotizaciones por volumen y pedidos completos.
 */

export const WHATSAPP_CONFIG = {
  // Número oficial del taller en formato internacional E.164 (Argentina: +54 9 11 4000-8800)
  PHONE_NUMBER: '5491140008800',
  DISPLAY_PHONE: '+54 9 11 4000-8800',
  TALLER_NAME: 'El Buen Pastor — Ceras & Artículos Litúrgicos',
};

/**
 * Genera un enlace universal wa.me
 * @param {string} message - Texto codificado para WhatsApp
 * @param {string} phone - Número de teléfono (por defecto el oficial)
 * @returns {string} URL lista para abrir WhatsApp
 */
export function createWhatsAppUrl(message, phone = WHATSAPP_CONFIG.PHONE_NUMBER) {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${phone}?text=${encoded}`;
}

/**
 * Genera el mensaje de consulta general o institucional
 */
export function buildGeneralInquiryMessage() {
  return `¡Paz y bien! Me comunico desde la web de *El Buen Pastor* para realizar una consulta litúrgica sobre el catálogo de ceras y cirios consagrados.`;
}

/**
 * Genera el mensaje preformateado para enviar una cotización desde el formulario de contacto
 */
export function buildContactFormMessage({ nombre, email, telefono, tipoCliente, mensaje }) {
  const tipoLabel = {
    parroquia: 'Parroquia / Diócesis',
    mayorista: 'Santería / Mayorista',
    particular: 'Particular / Familia',
  }[tipoCliente] || tipoCliente;

  return `*CONSULTA LITÚRGICA — EL BUEN PASTOR*
═══════════════════════
👤 *Nombre / Institución:* ${nombre || 'No especificado'}
📧 *Correo:* ${email || 'No especificado'}
📞 *Teléfono:* ${telefono || 'No especificado'}
🏛️ *Tipo de Solicitud:* ${tipoLabel}

💬 *Mensaje / Requerimiento:*
${mensaje || 'Sin detalles adicionales'}

───────────────────────
_Enviado desde el portal elbuenpastor.com.ar_`;
}

/**
 * Genera el mensaje estructurado con el detalle completo del carrito para formalizar pedido
 */
export function buildOrderWhatsAppMessage(cartItems, customerNote = '') {
  if (!cartItems || cartItems.length === 0) {
    return buildGeneralInquiryMessage();
  }

  const itemsList = cartItems
    .map((item, index) => {
      // Calcular precio unitario según tramo
      let unitPrice = item.precioUnitario;
      if (item.preciosPorVolumen && item.preciosPorVolumen.length > 0) {
        const tramo = item.preciosPorVolumen.find(
          (t) => item.cantidad >= t.min && (t.max === null || item.cantidad <= t.max)
        );
        if (tramo) unitPrice = tramo.precio;
      }
      const totalItem = unitPrice * item.cantidad;
      return `${index + 1}. *${item.modelo}*
   • Cantidad: ${item.cantidad} un. (${item.tamano})
   • Precio un.: $${unitPrice.toLocaleString('es-AR')}
   • Subtotal: $${totalItem.toLocaleString('es-AR')}`;
    })
    .join('\n\n');

  const totalCalculado = cartItems.reduce((acc, item) => {
    let unitPrice = item.precioUnitario;
    if (item.preciosPorVolumen && item.preciosPorVolumen.length > 0) {
      const tramo = item.preciosPorVolumen.find(
        (t) => item.cantidad >= t.min && (t.max === null || item.cantidad <= t.max)
      );
      if (tramo) unitPrice = tramo.precio;
    }
    return acc + unitPrice * item.cantidad;
  }, 0);

  const totalUnidades = cartItems.reduce((acc, it) => acc + it.cantidad, 0);

  return `*SOLICITUD DE PEDIDO LITÚRGICO*
*El Buen Pastor — Ceras Sagradas*
═══════════════════════
🕯️ *ÍTEMS SOLICITADOS (${totalUnidades} unidades):*

${itemsList}

───────────────────────
💰 *TOTAL ESTIMADO:* $${totalCalculado.toLocaleString('es-AR')}
${customerNote ? `\n📝 *Nota del solicitante:*\n${customerNote}\n` : ''}
═══════════════════════
_Deseo coordinar la elaboración y detalles de despacho litúrgico._`;
}
