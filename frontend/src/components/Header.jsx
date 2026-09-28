import React, { useState, useEffect } from 'react';
import './Header.css';

export default function Header({
  activeSection,
  onNavigate,
  cartCount = 0,
  onOpenCart,
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'productos', label: 'PRODUCTOS' },
    { id: 'quienes-somos', label: 'QUIÉNES SOMOS' },
    { id: 'contacto', label: 'CONTACTO' },
    { id: 'historial', label: 'HISTORIAL' },
  ];

  return (
    <header className={`site-header-sober ${isScrolled ? 'is-collapsed' : ''}`}>
      {/* ── Top Bar Institucional ── */}
      <div className="top-bar-sober">
        <div className="container top-bar-flex">
          <div className="top-bar-left">
            <span className="liturgical-tagline">
              Taller de Ceras Litúrgicas & Artículos Sagrados
            </span>
          </div>
          <div className="top-bar-right">
            <button className="top-link" onClick={() => onNavigate('contacto')}>
              ATENCIÓN A PARROQUIAS
            </button>
            <span className="top-bar-divider">|</span>
            <button className="top-link" onClick={() => onNavigate('historial')}>
              SEGUIMIENTO DE PEDIDOS
            </button>
            <span className="top-bar-divider">|</span>
            <button className="top-link cart-top-link" onClick={onOpenCart}>
              <span className="material-symbols-rounded top-cart-icon">shopping_bag</span>
              PEDIDO ({cartCount})
            </button>
          </div>
        </div>
      </div>

      {/* ── Área Principal del Header ── */}
      <div className="header-main-area">
        <div className="container header-main-container">
          {/* Logo / Marca */}
          <div 
            className="brand-sober-block" 
            onClick={() => onNavigate('productos')}
            role="button"
            tabIndex={0}
            title="Ir al inicio"
          >
            <div className="brand-cross-icon">
              <span className="material-symbols-rounded">flare</span>
            </div>
            <div className="brand-text-wrapper">
              <h1 className="brand-name-sober">EL BUEN PASTOR</h1>
              <span className="brand-desc-sober">CERAS & ARTÍCULOS RELIGIOSOS</span>
            </div>
          </div>

          {/* Navegación y Botón de Carrito con Google Material Web */}
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
    </header>
  );
}
