import React from 'react';
import { createWhatsAppUrl, buildGeneralInquiryMessage } from '../utils/whatsappHelper';
import './FloatingWhatsApp.css';

export default function FloatingWhatsApp() {
  const handleClick = () => {
    const url = createWhatsAppUrl(buildGeneralInquiryMessage());
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="floating-whatsapp-container" title="Chatear con el Taller Litúrgico">
      <button
        className="floating-whatsapp-btn"
        onClick={handleClick}
        aria-label="Abrir chat de WhatsApp con el Taller El Buen Pastor"
      >
        {/* SVG Oficial de WhatsApp */}
        <svg
          className="whatsapp-svg-icon"
          viewBox="0 0 32 32"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.72.78 5.27 2.14 7.43L2.5 30l6.77-1.61A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm7.9 19.8c-.33.93-1.63 1.77-2.67 1.95-.71.12-1.64.22-4.76-1.07-3.99-1.65-6.57-5.71-6.77-5.98-.2-.27-1.62-2.16-1.62-4.12 0-1.96 1.03-2.92 1.4-3.32.37-.4.81-.5 1.08-.5.27 0 .54 0 .78.02.25.01.59-.1.92.7.33.81 1.13 2.76 1.23 2.96.1.2.17.44.03.71-.14.27-.21.44-.41.68-.2.24-.43.53-.61.71-.2.2-.42.42-.18.83.24.41 1.07 1.77 2.3 2.87 1.58 1.41 2.92 1.84 3.33 2.05.41.2.65.17.89-.1.24-.27 1.02-1.18 1.29-1.59.27-.4.54-.34.91-.2.37.14 2.37 1.12 2.78 1.32.41.2.68.3.78.47.1.17.1 1.04-.23 1.97z" />
        </svg>

        <span className="floating-whatsapp-tooltip">
          ¿Consultas? Escríbenos por WhatsApp
        </span>
      </button>
    </div>
  );
}
