import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductosSection from './components/ProductosSection';
import QuienesSomosSection from './components/QuienesSomosSection';
import ContactoSection from './components/ContactoSection';
import HistorialSection from './components/HistorialSection';
import SidebarCart from './components/SidebarCart';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import './App.css';

export default function App() {
  const [activeSection, setActiveSection] = useState('productos');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Carrito de compras con un producto de muestra inicial
  const [cartItems, setCartItems] = useState([
    {
      id: 'prod-02',
      sku: 'CIR-ABJ-GRD-002',
      modelo: 'Cirio Pascual & Altar de Abejas',
      tamano: 'Grande (10 × 35 cm)',
      precioUnitario: 14500,
      cantidad: 1,
      preciosPorVolumen: [
        { min: 1, max: 4, precio: 14500 },
        { min: 5, max: 19, precio: 12800 },
        { min: 20, max: null, precio: 11200 },
      ],
      imagen: '/cirio-pascual.jpg',
      duracionHoras: 120,
    },
  ]);

  // Registro de actividad / trazabilidad en tiempo real
  const [activityLog, setActivityLog] = useState([
    {
      id: 'act-1',
      time: '14:15',
      titulo: 'Inicio de navegación litúrgica',
      detalle: 'Consulta del catálogo de ceras sagradas y cirios de altar.',
      type: 'info',
    },
    {
      id: 'act-2',
      time: '14:18',
      titulo: 'Cirio Pascual agregado',
      detalle: '1 unidad de Cirio Pascual de Abejas añadida al pedido inicial.',
      type: 'add',
    },
  ]);

  // Desplazar suavemente hacia arriba al cambiar de vista
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  // Función para registrar eventos en la bitácora
  const registrarActividad = (titulo, detalle, type = 'info') => {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivityLog((prev) => [
      {
        id: `act-${Date.now()}`,
        time: hora,
        titulo,
        detalle,
        type,
      },
      ...prev,
    ]);
  };

  // Añadir producto al carrito
  const handleAddToCart = (producto) => {
    setCartItems((prevItems) => {
      const existe = prevItems.find((it) => it.id === producto.id);
      if (existe) {
        return prevItems.map((it) =>
          it.id === producto.id ? { ...it, cantidad: it.cantidad + 1 } : it
        );
      } else {
        return [
          ...prevItems,
          {
            id: producto.id,
            sku: producto.sku,
            modelo: producto.modelo,
            tamano: producto.tamano,
            precioUnitario: producto.precioUnitario,
            cantidad: 1,
            preciosPorVolumen: producto.preciosPorVolumen,
            imagen: producto.imagen,
            duracionHoras: producto.duracionHoras,
          },
        ];
      }
    });

    registrarActividad(
      `Añadido: ${producto.modelo}`,
      `1 unidad incorporada al pedido. Código: ${producto.sku}`,
      'add'
    );

    // Abrir automáticamente el drawer derecho
    setIsCartOpen(true);
  };

  // Actualizar cantidad
  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems((prevItems) => {
      return prevItems.map((it) => {
        if (it.id === productId) {
          // Detectar si sube a escala mayorista
          const tramoAnterior = it.preciosPorVolumen?.find(
            (t) => it.cantidad >= t.min && (t.max === null || it.cantidad <= t.max)
          );
          const tramoNuevo = it.preciosPorVolumen?.find(
            (t) => newQty >= t.min && (t.max === null || newQty <= t.max)
          );

          if (tramoNuevo && tramoAnterior && tramoNuevo.precio < tramoAnterior.precio) {
            registrarActividad(
              `¡Escala mayorista alcanzada!`,
              `El precio de "${it.modelo}" se redujo a $${tramoNuevo.precio.toLocaleString('es-AR')} por unidad (${newQty} un.).`,
              'discount'
            );
          }

          return { ...it, cantidad: newQty };
        }
        return it;
      });
    });
  };

  // Remover ítem individual
  const handleRemoveItem = (productId) => {
    const itemEliminado = cartItems.find((it) => it.id === productId);
    setCartItems((prev) => prev.filter((it) => it.id !== productId));

    if (itemEliminado) {
      registrarActividad(
        `Producto retirado`,
        `Se eliminó "${itemEliminado.modelo}" del pedido.`,
        'remove'
      );
    }
  };

  // Vaciar carrito completo
  const handleClearCart = () => {
    if (window.confirm('¿Deseas vaciar todos los artículos de tu pedido?')) {
      setCartItems([]);
      registrarActividad(
        'Pedido vaciado',
        'Se restableció la selección completa de productos.',
        'remove'
      );
    }
  };

  // Finalizar / Formalizar pedido
  const handleFinalizarPedido = () => {
    registrarActividad(
      'Cotización solicitada',
      'Desglose derivado a la sección de contacto litúrgico.',
      'info'
    );
    setIsCartOpen(false);
    setActiveSection('contacto');
  };

  const totalItemsCount = cartItems.reduce((acc, it) => acc + it.cantidad, 0);

  return (
    <div className="app-layout">
      {/* Header con soporte de contracción al scroll y botón de carrito */}
      <Header
        activeSection={activeSection}
        onNavigate={setActiveSection}
        cartCount={totalItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Contenido Principal Dinámico */}
      <main className="main-content" id="main-content">
        {activeSection === 'productos' && (
          <ProductosSection onAddToCart={handleAddToCart} />
        )}

        {activeSection === 'quienes-somos' && (
          <QuienesSomosSection
            onIrAProductos={() => setActiveSection('productos')}
            onIrAContacto={() => setActiveSection('contacto')}
          />
        )}

        {activeSection === 'contacto' && <ContactoSection />}

        {activeSection === 'historial' && <HistorialSection />}
      </main>

      {/* Sidebar Lateral Derecha Desplegable (Carrito + Actividad) */}
      <SidebarCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        activityLog={activityLog}
        onFinalizarPedido={handleFinalizarPedido}
      />

      {/* Pie de página sereno */}
      <Footer onNavigate={setActiveSection} />

      {/* Botón Flotante Litúrgico de WhatsApp */}
      <FloatingWhatsApp />
    </div>
  );
}
