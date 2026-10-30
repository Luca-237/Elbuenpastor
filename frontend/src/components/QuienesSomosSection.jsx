import React from 'react';
import './QuienesSomosSection.css';

export default function QuienesSomosSection({ onIrAProductos, onIrAContacto }) {
  const pilares = [
    {
      icon: 'flare',
      titulo: 'Dignidad & Calibre Litúrgico',
      descripcion:
        'Elaboramos cirios pascuales y velas con mechas calibradas y proporciones canónicas exactas para una combustión constante, limpia y sin humo en el altar.',
    },
    {
      icon: 'handshake',
      titulo: 'Elaboración con Silencio & Cuidado',
      descripcion:
        'Cada cirio es vertido y moldeado a mano en un ambiente de serenidad y recogimiento. Creemos que la vela encendida es oración convertida en luz.',
    },
    {
      icon: 'church',
      titulo: 'Servicio a Parroquias & Hogares',
      descripcion:
        'Acompañamos a comunidades parroquiales, capillas, santuarios y familias en sus celebraciones litúrgicas más significativas: Bautismos, Comuniones, Vigilias y Pascua.',
    },
  ];

  return (
    <section className="quienes-somos-section animate-fade-in">
      {/* Hero Visual Sereno con Medallón Dorado */}
      <div className="about-hero">
        <div className="container about-hero-grid">
          <div className="about-hero-content">
            <div className="about-brand-badge-wrap">
              <img
                src="/logo-medallion-navy.png"
                alt="Sello Sagrado El Buen Pastor"
                className="about-brand-seal-icon"
              />
              <span className="about-eyebrow">
                <span className="material-symbols-rounded">flare</span>
                Velas Buen Pastor • Taller Litúrgico
              </span>
            </div>

            <h2 className="about-title">Ilumina tu Fe con la Luz del Buen Pastor</h2>
            <p className="about-text-lead">
              En <strong>Velas Buen Pastor</strong> nacemos con la vocación canónica de rescatar la dignidad y nobleza de las velas sagradas para el culto litúrgico y el recogimiento espiritual en templos y hogares.
            </p>
            <p className="about-text-secondary">
              Inspirados en la figura de Cristo como Buen Pastor que guía y cuida a su rebaño, cada pieza es elaborada artesanalmente con dedicación y solemnidad. La luz viva de nuestras velas acompaña la oración con una llama serena y constante.
            </p>

            <div className="about-hero-actions">
              <button className="about-primary-btn" onClick={onIrAProductos}>
                <span className="material-symbols-rounded">store</span>
                Ver Catálogo Litúrgico
              </button>

              <button className="about-secondary-btn" onClick={onIrAContacto}>
                <span className="material-symbols-rounded">mail</span>
                Contactar al Taller
              </button>
            </div>
          </div>

          <div className="about-hero-image-wrapper">
            <div className="image-frame-serene">
              <div className="logo-engraving-card">
                <img
                  src="/logo-buen-pastor.png"
                  alt="Grabado tradicional El Buen Pastor - Cirios y Velas"
                  className="about-shepherd-engraving"
                />
                <div className="engraving-ribbon">
                  <span className="material-symbols-rounded">verified</span>
                  <span>Sello Litúrgico de Autenticidad</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Los 3 Pilares del Taller */}
      <div className="container pillars-section">
        <div className="pillars-header">
          <span className="pillars-tag">Nuestros Compromisos</span>
          <h3 className="pillars-title">Valores que Iluminan Nuestra Labor</h3>
          <p className="pillars-subtitle">
            Unimos la tradición litúrgica con procesos sostenibles y respetuosos con la Creación.
          </p>
        </div>

        <div className="pillars-grid">
          {pilares.map((p, idx) => (
            <div key={idx} className="pillar-card">
              <div className="pillar-icon-box">
                <span className="material-symbols-rounded">{p.icon}</span>
              </div>
              <h4 className="pillar-card-title">{p.titulo}</h4>
              <p className="pillar-card-desc">{p.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cita Espiritual / Reflexión */}
      <div className="container quote-container">
        <blockquote className="sacred-quote-box">
          <span className="quote-mark">“</span>
          <p className="quote-phrase">
            La llama de la vela no sólo alumbra la estancia, sino que enciende en el corazón el recuerdo de la presencia continua de Dios.
          </p>
          <cite className="quote-author">— Tradición Contemplativa de San Juan de la Cruz</cite>
        </blockquote>
      </div>
    </section>
  );
}
