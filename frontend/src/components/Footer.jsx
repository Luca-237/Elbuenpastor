import React from 'react';
import './Footer.css';

export default function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-top-grid">
          {/* Columna Marca */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <span className="material-symbols-rounded footer-cross">spa</span>
              <div>
                <span className="footer-brand-name">EL BUEN PASTOR</span>
                <span className="footer-brand-tagline">Ceras & Artículos Religiosos</span>
              </div>
            </div>
            <p className="footer-bio">
              Taller dedicado al arte sagrado de la cerería. Elaboración con cera pura de soja y cera virgen de abejas para dignificar el culto litúrgico y el rincón de oración familiar.
            </p>
            <div className="footer-badges">
              <span className="footer-pill">
                <span className="material-symbols-rounded">eco</span>
                100% Biodegradable
              </span>
              <span className="footer-pill">
                <span className="material-symbols-rounded">favorite</span>
                Hecho con Silencio y Fe
              </span>
            </div>
          </div>

          {/* Columna Navegación */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Secciones</h4>
            <ul className="footer-nav-list">
              <li>
                <button onClick={() => onNavigate('productos')}>
                  <span className="material-symbols-rounded">chevron_right</span>
                  Catálogo de Productos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('quienes-somos')}>
                  <span className="material-symbols-rounded">chevron_right</span>
                  Quiénes Somos & Vocación
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contacto')}>
                  <span className="material-symbols-rounded">chevron_right</span>
                  Contacto & Presupuestos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('historial')}>
                  <span className="material-symbols-rounded">chevron_right</span>
                  Historial & Seguimiento
                </button>
              </li>
            </ul>
          </div>

          {/* Columna Atención Litúrgica */}
          <div className="footer-contact-col">
            <h4 className="footer-col-title">Atención al Taller</h4>
            <div className="footer-contact-item">
              <span className="material-symbols-rounded">call</span>
              <div>
                <strong>WhatsApp Litúrgico:</strong>
                <span>+54 9 11 4000-8800</span>
              </div>
            </div>
            <div className="footer-contact-item">
              <span className="material-symbols-rounded">mail</span>
              <div>
                <strong>Correo Oficial:</strong>
                <span>taller@elbuenpastor.com.ar</span>
              </div>
            </div>
            <div className="footer-contact-item">
              <span className="material-symbols-rounded">local_shipping</span>
              <div>
                <strong>Despachos:</strong>
                <span>A todas las diócesis y parroquias del país</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {new Date().getFullYear()} El Buen Pastor — Todos los derechos reservados. Diseñado con serenidad y Google Material Web.
          </p>
          <div className="footer-peace-blessing">
            <em>«Paz a todos los que están en Cristo»</em>
          </div>
        </div>
      </div>
    </footer>
  );
}
