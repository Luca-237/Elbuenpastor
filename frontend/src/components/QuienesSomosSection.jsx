import React from 'react';
import './QuienesSomosSection.css';

export default function QuienesSomosSection({ onIrAProductos, onIrAContacto }) {
  const pilares = [
    {
      icon: 'flare',
      titulo: 'Pureza en las Materias Primas',
      descripcion:
        'Utilizamos cera de soja vegetal 100% biodegradable y cera pura de opérculo de abejas de montes nativos. Sin derivados tóxicos del petróleo ni aditivos sintéticos irritantes.',
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
      {/* Hero Visual Sereno */}
      <div className="about-hero">
        <div className="container about-hero-grid">
          <div className="about-hero-content">
            <span className="about-eyebrow">
              <span className="material-symbols-rounded">history_edu</span>
              Nuestra Vocación Artesanal
            </span>
            <h2 className="about-title">Luz Noble para Acompañar la Oración</h2>
            <p className="about-text-lead">
              En <strong>El Buen Pastor</strong> nacemos con el anhelo de rescatar la dignidad y nobleza de las ceras sagradas. Ofrecemos velas que arden con llama limpia y constante, perfumando el ambiente con fragancias puras de incienso, mirra y cera virgen.
            </p>
            <p className="about-text-secondary">
              Nos inspira el pasaje del Evangelio que nos recuerda ser luz en la oscuridad. Cada cirio que sale de nuestro taller lleva consigo la dedicación de manos artesanas que trabajan con esmero para dignificar el culto divino y el rincón de oración del hogar.
            </p>

            <div className="about-hero-actions">
              <md-filled-button onClick={onIrAProductos}>
                <span slot="icon" className="material-symbols-rounded">store</span>
                Explorar Catálogo
              </md-filled-button>

              <md-outlined-button onClick={onIrAContacto}>
                <span slot="icon" className="material-symbols-rounded">mail</span>
                Escribir al Taller
              </md-outlined-button>
            </div>
          </div>

          <div className="about-hero-image-wrapper">
            <div className="image-frame-serene">
              <img
                src="/hero-candles.jpg"
                alt="Cirios y velas artesanales El Buen Pastor"
                className="about-hero-image"
              />
              <div className="image-caption-tag">
                <span className="material-symbols-rounded">spa</span>
                <span>Taller artesanal • Cera 100% natural</span>
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
