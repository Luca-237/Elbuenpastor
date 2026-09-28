import React, { useState } from 'react';
import './ContactoSection.css';

export default function ContactoSection() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoCliente: 'parroquia',
    mensaje: '',
  });

  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email) {
      alert('Por favor completa al menos tu nombre y correo electrónico.');
      return;
    }
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        tipoCliente: 'parroquia',
        mensaje: '',
      });
    }, 5000);
  };

  return (
    <section className="contacto-section animate-fade-in">
      <div className="section-hero">
        <div className="container">
          <span className="section-eyebrow">
            <span className="material-symbols-rounded">chat_bubble</span>
            Estamos a tu disposición
          </span>
          <h2 className="section-title">Comunícate con Nuestro Taller</h2>
          <p className="section-subtitle">
            Escríbenos para consultar presupuestos mayoristas, pedidos litúrgicos personalizados o pedidos individuales para el hogar. Te responderemos con prontitud y serenidad.
          </p>
        </div>
      </div>

      <div className="container contacto-grid-container">
        <div className="contacto-grid">
          {/* Formulario con Material Web */}
          <div className="contacto-form-card">
            <div className="form-card-header">
              <span className="material-symbols-rounded form-icon">edit_note</span>
              <div>
                <h3 className="form-title">Envíanos tu Mensaje</h3>
                <p className="form-subtitle">Completa el formulario y nos contactaremos a la brevedad.</p>
              </div>
            </div>

            {enviado ? (
              <div className="mensaje-exito animate-fade-in">
                <span className="material-symbols-rounded exito-icon">task_alt</span>
                <h4>¡Mensaje Recibido en Paz!</h4>
                <p>Muchas gracias, {formData.nombre}. Hemos recibido tu consulta y nos pondremos en contacto contigo dentro de las próximas 24 horas hábiles.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="form-inputs">
                <div className="input-group">
                  <label className="input-label" htmlFor="nombre-input">
                    Nombre o Nombre de la Parroquia / Institución *
                  </label>
                  <input
                    id="nombre-input"
                    type="text"
                    className="serene-input"
                    placeholder="Ej. Parroquia San José / María González"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="input-group">
                    <label className="input-label" htmlFor="email-input">
                      Correo Electrónico *
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      className="serene-input"
                      placeholder="nombre@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="telefono-input">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      id="telefono-input"
                      type="tel"
                      className="serene-input"
                      placeholder="+54 9 11 ..."
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Tipo de Consulta</label>
                  <div className="radio-group-serene">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="tipoCliente"
                        value="parroquia"
                        checked={formData.tipoCliente === 'parroquia'}
                        onChange={(e) => setFormData({ ...formData, tipoCliente: e.target.value })}
                      />
                      <span>Parroquia / Diócesis</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="tipoCliente"
                        value="mayorista"
                        checked={formData.tipoCliente === 'mayorista'}
                        onChange={(e) => setFormData({ ...formData, tipoCliente: e.target.value })}
                      />
                      <span>Santería / Mayorista</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="tipoCliente"
                        value="particular"
                        checked={formData.tipoCliente === 'particular'}
                        onChange={(e) => setFormData({ ...formData, tipoCliente: e.target.value })}
                      />
                      <span>Particular / Familia</span>
                    </label>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="mensaje-input">
                    ¿En qué podemos ayudarte? *
                  </label>
                  <textarea
                    id="mensaje-input"
                    rows="4"
                    className="serene-input serene-textarea"
                    placeholder="Detalla las velas, cirios o medidas que necesitas y cualquier fecha límite litúrgica..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-submit-row">
                  <md-filled-button type="submit" class="submit-btn-full">
                    <span slot="icon" className="material-symbols-rounded">send</span>
                    Enviar Consulta con Paz
                  </md-filled-button>
                </div>
              </form>
            )}
          </div>

          {/* Información Directa del Taller */}
          <div className="contacto-info-cards">
            <div className="info-card">
              <div className="info-card-icon">
                <span className="material-symbols-rounded">phone_iphone</span>
              </div>
              <div className="info-card-text">
                <h4>WhatsApp Litúrgico</h4>
                <p className="highlight-text">+54 9 11 4000-8800</p>
                <p className="sub-text">Atención directa para presupuestos rápidos y coordinación de envíos.</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <span className="material-symbols-rounded">mail</span>
              </div>
              <div className="info-card-text">
                <h4>Correo Institucional</h4>
                <p className="highlight-text">taller@elbuenpastor.com.ar</p>
                <p className="sub-text">Para órdenes oficiales de congregaciones, colegios y capillas.</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <span className="material-symbols-rounded">location_on</span>
              </div>
              <div className="info-card-text">
                <h4>Taller de Elaboración</h4>
                <p className="highlight-text">Buenos Aires, Argentina</p>
                <p className="sub-text">Despachos diarios a todo el territorio nacional con embalaje de protección especial.</p>
              </div>
            </div>

            <div className="info-card peaceful-quote-card">
              <span className="material-symbols-rounded quote-peace-icon">spa</span>
              <p>
                «Que la paz que sobrepasa todo entendimiento guarde sus corazones y sus pensamientos».
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
