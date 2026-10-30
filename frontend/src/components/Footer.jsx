import React from 'react';
import './Footer.css';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      {/* ── Cinta de Compromiso Litúrgico (Inspirada en el Folleto Oficial) ── */}
      <div className="footer-pillars-strip">
        <div className="container footer-pillars-flex">
          <div className="pillar-item">
            <span className="material-symbols-rounded pillar-icon">favorite</span>
            <div className="pillar-text">
              <span className="pillar-title">Devoción & Silencio</span>
              <span className="pillar-sub">Hecho a mano con devoción y calidad</span>
            </div>
          </div>
          <div className="pillar-divider"></div>
          <div className="pillar-item">
            <span className="material-symbols-rounded pillar-icon">share</span>
            <div className="pillar-text">
              <span className="pillar-title">Comunidad Litúrgica</span>
              <span className="pillar-sub">Síguenos: @velasbuenpastor</span>
            </div>
          </div>
          <div className="pillar-divider"></div>
          <div className="pillar-item">
            <span className="material-symbols-rounded pillar-icon">support_agent</span>
            <div className="pillar-text">
              <span className="pillar-title">Pedidos & Parroquias</span>
              <span className="pillar-sub">+54 9 11 4000-8800</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container footer-content">
        <div className="footer-top-grid">
          {/* Columna Marca */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <div className="footer-medallion-frame">
                <img
                  src="/logo-medallion-navy.png"
                  alt="Sello Velas Buen Pastor"
                  className="footer-medallion-img"
                />
              </div>
              <div>
                <span className="footer-brand-name">VELAS BUEN PASTOR</span>
                <span className="footer-brand-tagline">ILUMINA TU FE CON LA LUZ DEL BUEN PASTOR</span>
              </div>
            </div>
            <p className="footer-bio">
              Taller canónico de velas sagradas y cirios pascuales. Elaboración artesanal para dignificar la liturgia del altar y la oración en templos, capillas y hogares de todo el país.
            </p>
            <div className="footer-badges">
              <span className="footer-pill">
                <span className="material-symbols-rounded">flare</span>
                Luz y Devoción Sacra
              </span>
              <span className="footer-pill">
                <span className="material-symbols-rounded">church</span>
                Calibre Litúrgico Canónico
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
            © {CURRENT_YEAR} El Buen Pastor — Todos los derechos reservados. Diseñado con serenidad y Google Material Web.
          </p>
          <div className="footer-peace-blessing">
            <em>«Paz a todos los que están en Cristo»</em>
            <button 
              className="footer-admin-lock-btn" 
              onClick={() => onNavigate('admin')}
              title="Acceso Restringido Taller / Superusuario"
              aria-label="Acceso Administrador"
            >
              <span className="material-symbols-rounded">lock</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
