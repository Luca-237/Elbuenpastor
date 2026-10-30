import React, { useState, useEffect, useRef } from 'react';
import './Header.css';

export default function Header({
  activeSection,
  onNavigate,
  cartCount = 0,
  onOpenCart,
  isAdminAuthenticated = false,
  onOpenLoginModal,
  onAdminLogout,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      setIsScrolled((prev) => {
        if (!prev && scrollY > 80) {
          return true;
        }
        if (prev && scrollY <= 5) {
          return false;
        }
        return prev;
      });
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleUserButtonClick = () => {
    if (isAdminAuthenticated) {
      setIsUserMenuOpen((prev) => !prev);
    } else {
      if (onOpenLoginModal) onOpenLoginModal();
    }
  };

  const navItems = [
    { id: 'productos', label: 'PRODUCTOS' },
    { id: 'quienes-somos', label: 'QUIÉNES SOMOS' },
    { id: 'contacto', label: 'CONTACTO' },
    { id: 'historial', label: 'HISTORIAL' },
  ];

  return (
    <header className={`site-header-sober ${isScrolled ? 'is-collapsed' : ''}`}>
      {/* ── 0. BARRA SUPERIOR: REVENTA E IGLESIAS (ARRIBA DE TODO) ── */}
      <div className="top-announcement-bar">
        <div className="container announcement-bar-flex">
          <div className="announcement-msg-group">
            <span className="material-symbols-rounded announcement-spark-icon">church</span>
            <span className="announcement-text">
              ¿Buscás velas para reventa o para tu iglesia? Tenemos precios especiales para vos,{' '}
              <button
                type="button"
                className="announcement-data-link"
                onClick={() => onNavigate('contacto')}
              >
                ingresa tus datos acá
              </button>
            </span>
          </div>

          <div className="announcement-btn-group">
            <button
              type="button"
              className="top-credentials-action-btn"
              onClick={() => {
                if (isAdminAuthenticated) {
                  onNavigate('admin');
                } else {
                  if (onOpenLoginModal) onOpenLoginModal();
                }
              }}
              title="Poner credenciales de acceso"
            >
              <span className="material-symbols-rounded">vpn_key</span>
              <span>Poner Credenciales</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Top Bar Institucional (Azul Noche y Oro) ── */}
      <div className="top-bar-sober">
        <div className="container top-bar-flex">
          <div className="top-bar-left">
            <span className="liturgical-tagline">
              <span className="material-symbols-rounded top-star-icon">flare</span>
              Taller Litúrgico Canónico • Velas & Artículos Sagrados
            </span>
          </div>
          <div className="top-bar-right">
            <span className="top-contact-chip">
              <span className="material-symbols-rounded">location_on</span>
              <span>Envíos a Diócesis y Parroquias</span>
            </span>
            <span className="top-bar-divider">|</span>
            <span className="top-contact-chip">
              <span className="material-symbols-rounded">call</span>
              <span>+54 9 11 4000-8800</span>
            </span>
            <span className="top-bar-divider">|</span>
            <button className="top-link" onClick={() => onNavigate('contacto')}>
              CONTACTO
            </button>
            <span className="top-bar-divider">|</span>
            <button className="top-link" onClick={() => onNavigate('historial')}>
              SEGUIMIENTO
            </button>
            <span className="top-bar-divider">|</span>
            <button
              className={`top-link ${isAdminAuthenticated ? 'top-link-admin-active' : ''}`}
              onClick={() => {
                if (isAdminAuthenticated) {
                  onNavigate('admin');
                } else {
                  if (onOpenLoginModal) onOpenLoginModal();
                }
              }}
              title={isAdminAuthenticated ? 'Panel de Superusuario (Activo)' : 'Iniciar sesión de Administrador'}
            >
              <span
                className="material-symbols-rounded"
                style={{
                  fontSize: '15px',
                  marginRight: '4px',
                  verticalAlign: 'middle',
                  color: isAdminAuthenticated ? '#E8C87A' : '#C5A059',
                }}
              >
                {isAdminAuthenticated ? 'verified_user' : 'admin_panel_settings'}
              </span>
              ADMIN
              {isAdminAuthenticated && (
                <span className="top-bar-admin-badge">Activo</span>
              )}
            </button>
            <span className="top-bar-divider top-bar-cart-divider">|</span>
            <button className="top-link cart-top-link" onClick={onOpenCart}>
              <span className="material-symbols-rounded top-cart-icon">shopping_bag</span>
              PEDIDO ({cartCount})
            </button>
          </div>
        </div>
      </div>

      {/* ── Área Principal del Header (Azul Litúrgico Imperial) ── */}
      <div className="header-main-area">
        <div className="container header-main-container">
          {/* Logo y Marca Oficial El Buen Pastor */}
          <div 
            className="brand-sober-block" 
            onClick={() => onNavigate('productos')}
            role="button"
            tabIndex={0}
            title="Ir al inicio de Velas El Buen Pastor"
          >
            <div className="brand-medallion-frame">
              <img
                src="/logo-medallion-navy.png"
                alt="Sello Sagrado El Buen Pastor"
                className="brand-medallion-img"
              />
            </div>
            <div className="brand-text-wrapper">
              <h1 className="brand-name-sober">VELAS BUEN PASTOR</h1>
              <span className="brand-desc-sober">ILUMINA TU FE CON LA LUZ DEL BUEN PASTOR</span>
            </div>
          </div>

          {/* Navegación y Botones de Acción */}
          <div className="nav-and-actions-wrapper">
            <nav className="main-nav-sober" aria-label="Navegación principal">
              <div className="nav-links-centered">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <div key={item.id} className="nav-item-sober">
                      {isActive ? (
                        <md-filled-button
                          class="nav-btn-sober nav-btn-active"
                          onClick={() => onNavigate(item.id)}
                        >
                          {item.label}
                        </md-filled-button>
                      ) : (
                        <md-text-button
                          class="nav-btn-sober nav-btn-inactive"
                          onClick={() => onNavigate(item.id)}
                        >
                          {item.label}
                        </md-text-button>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Grupo de Acciones: Botón de Usuario (Admin) + Carrito */}
            <div className="header-actions-cluster">
              {/* Botón de Ingreso / Usuario */}
              <div className="header-user-menu-wrapper" ref={userMenuRef}>
                <button 
                  type="button"
                  className={`header-user-btn ${isAdminAuthenticated ? 'is-authenticated' : ''}`}
                  onClick={handleUserButtonClick}
                  title={isAdminAuthenticated ? 'Menú de Administrador' : 'Ingresar al Panel de Administrador'}
                  aria-label={isAdminAuthenticated ? 'Menú de Administrador' : 'Ingresar al Panel de Administrador'}
                >
                  <span className="material-symbols-rounded user-btn-icon">
                    {isAdminAuthenticated ? 'admin_panel_settings' : 'account_circle'}
                  </span>
                  <span className="user-btn-label">
                    {isAdminAuthenticated ? 'ADMIN' : 'INGRESAR'}
                  </span>
                  {isAdminAuthenticated && (
                    <span className="user-status-dot" title="Sesión activa" />
                  )}
                </button>

                {/* Dropdown flotante cuando está autenticado */}
                {isAdminAuthenticated && isUserMenuOpen && (
                  <div className="header-user-dropdown animate-scale-up">
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-icon">
                        <span className="material-symbols-rounded">verified_user</span>
                      </div>
                      <div>
                        <strong>Superusuario</strong>
                        <small>Taller El Buen Pastor</small>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-menu-item"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('admin');
                      }}
                    >
                      <span className="material-symbols-rounded">dashboard</span>
                      <span>Panel de Control</span>
                    </button>

                    <button
                      type="button"
                      className="dropdown-menu-item logout"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onAdminLogout) onAdminLogout();
                      }}
                    >
                      <span className="material-symbols-rounded">logout</span>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Botón Acceso Rápido al Carrito Desplegable */}
              <button 
                className="header-cart-trigger" 
                onClick={onOpenCart}
                title="Abrir pedido litúrgico"
                aria-label="Abrir carrito de compras"
              >
                <span className="material-symbols-rounded">shopping_bag</span>
                <span className="cart-trigger-label">PEDIDO</span>
                {cartCount > 0 && (
                  <span className="cart-count-badge animate-fade-in">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
