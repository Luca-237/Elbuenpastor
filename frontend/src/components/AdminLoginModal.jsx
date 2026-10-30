import React, { useState, useEffect, useRef } from 'react';
import './AdminLoginModal.css';

const DEFAULT_DEV_PIN = '2026';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Enfocar input al abrir
  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMsg('');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin) {
      setErrorMsg('Por favor ingresa la clave o PIN de taller.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Intentar validar primero contra el backend
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      }).catch(() => null);

      if (res && res.ok) {
        const json = await res.json();
        if (json.success) {
          setIsLoading(false);
          onLoginSuccess(json);
          return;
        }
      }

      // Fallback local en desarrollo si el server no está activo o responde error controlado
      if (cleanPin === DEFAULT_DEV_PIN || cleanPin === 'admin' || cleanPin === 'admin2026') {
        setIsLoading(false);
        onLoginSuccess({
          rol: 'superusuario',
          nombre: 'Maestro Artesano / Administrador',
        });
        return;
      }

      setIsLoading(false);
      setErrorMsg('Clave o PIN incorrecto. Verifica el valor ingresado.');
    } catch (err) {
      // Fallback local ante error inesperado
      if (cleanPin === DEFAULT_DEV_PIN || cleanPin === 'admin') {
        setIsLoading(false);
        onLoginSuccess();
        return;
      }
      setIsLoading(false);
      setErrorMsg('Credencial inválida. PIN de desarrollo: 2026');
    }
  };

  return (
    <div
      className="admin-modal-overlay animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div
        className="admin-modal-window animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar X */}
        <button
          type="button"
          className="admin-modal-close-btn"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <span className="material-symbols-rounded">close</span>
        </button>

        {/* Encabezado con estética litúrgica */}
        <div className="admin-modal-header-block">
          <div className="admin-modal-shepherd-emblem">
            <img
              src="/logo-medallion-navy.png"
              alt="Sello Sagrado El Buen Pastor"
              className="admin-modal-emblem-img"
            />
          </div>
          <span className="admin-modal-kicker">VELAS BUEN PASTOR</span>
          <h2 id="admin-modal-title" className="admin-modal-title">
            Panel de Administración
          </h2>
          <p className="admin-modal-desc">
            Acceso exclusivo para el control de catálogo sagrado, inventario y gestión de pedidos.
          </p>
        </div>

        {/* Formulario de PIN / Clave */}
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-modal-input-group">
            <label htmlFor="modal-admin-pin" className="admin-modal-label">
              PIN o Clave Maestra:
            </label>
            <div className="admin-modal-field-wrap">
              <span className="material-symbols-rounded field-leading-icon">key</span>
              <input
                ref={inputRef}
                id="modal-admin-pin"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa PIN (ej: 2026)..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="admin-modal-input"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password-visibility-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                tabIndex={-1}
              >
                <span className="material-symbols-rounded">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Mensaje de error si la clave es inválida */}
          {errorMsg && (
            <div className="admin-modal-error-box animate-fade-in" role="alert">
              <span className="material-symbols-rounded error-box-icon">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="admin-modal-actions-row">
            <button
              type="button"
              className="admin-modal-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="admin-modal-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="admin-spinner" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded">login</span>
                  <span>Ingresar al Panel</span>
                </>
              )}
            </button>
          </div>

          {/* Nota de ayuda en desarrollo */}
          <div className="admin-modal-dev-hint">
            <span className="material-symbols-rounded hint-icon">lightbulb</span>
            <span>PIN de desarrollo: <strong>2026</strong> o clave <strong>admin</strong></span>
          </div>
        </form>
      </div>
    </div>
  );
}
