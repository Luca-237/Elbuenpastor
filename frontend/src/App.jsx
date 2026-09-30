import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductosSection from './components/ProductosSection';
import QuienesSomosSection from './components/QuienesSomosSection';
import ContactoSection from './components/ContactoSection';
import HistorialSection from './components/HistorialSection';
import AdminDashboardPage from './components/AdminDashboardPage';
import SidebarCart from './components/SidebarCart';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import './App.css';

// Catálogo inicial maestro estructurado
const INITIAL_PRODUCTOS = [
  {
    id: 'prod-01',
    sku: 'VEL-SOJ-MED-001',
    modelo: 'Vela Cilíndrica Pura Soja',
    categoriaId: 'soja',
    categoriaNombre: 'Velas de Soja',
    tipoCeraId: 'soja',
    tipoCeraNombre: '100% Cera de Soja Ecológica',
    tamano: 'Mediana (8 × 10 cm)',
    duracionHoras: 45,
    aromas: ['Incienso Sagrado', 'Mirra', 'Sándalo'],
    aromaDefault: 'Incienso Sagrado',
    imagen: '/hero-candles.jpg',
    descripcion: 'Vela de combustión lenta y serena. Elaborada artesanalmente con cera de soja vegetal pura que favorece el recogimiento y la oración.',
    precioUnitario: 3800,
    preciosPorVolumen: [
      { min: 1, max: 9, precio: 3800 },
      { min: 10, max: 49, precio: 3300 },
      { min: 50, max: null, precio: 2900 },
    ],
    tamanosPorNumero: [
      { numero: 1, label: 'Nº 1', dimensiones: '5 × 7 cm', duracionHoras: 25, precioUnitario: 2800 },
      { numero: 2, label: 'Nº 2', dimensiones: '6 × 8 cm', duracionHoras: 35, precioUnitario: 3300 },
      { numero: 3, label: 'Nº 3', dimensiones: '8 × 10 cm', duracionHoras: 45, precioUnitario: 3800, isDefault: true },
      { numero: 4, label: 'Nº 4', dimensiones: '10 × 12 cm', duracionHoras: 65, precioUnitario: 4900 },
      { numero: 5, label: 'Nº 5', dimensiones: '10 × 18 cm', duracionHoras: 90, precioUnitario: 6800 },
      { numero: 6, label: 'Nº 6', dimensiones: '10 × 25 cm', duracionHoras: 110, precioUnitario: 9200 },
    ],
    stock: 24,
    destacado: true,
  },
  {
    id: 'prod-02',
    sku: 'CIR-ABJ-GRD-002',
    modelo: 'Cirio Pascual & Altar de Abejas',
    categoriaId: 'cirios',
    categoriaNombre: 'Cirios Pascuales & Altar',
    tipoCeraId: 'abeja',
    tipoCeraNombre: '100% Cera Pura de Abejas Silvestres',
    tamano: 'Grande (10 × 35 cm)',
    duracionHoras: 120,
    aromas: ['Miel natural'],
    aromaDefault: 'Miel natural',
    imagen: '/cirio-pascual.jpg',
    descripcion: 'Cirio consagrado para celebraciones litúrgicas y altares. Llama constante sin humo negro y aroma puro a cera virgen.',
    precioUnitario: 14500,
    preciosPorVolumen: [
      { min: 1, max: 4, precio: 14500 },
      { min: 5, max: 19, precio: 12800 },
      { min: 20, max: null, precio: 11200 },
    ],
    tamanosPorNumero: [
      { numero: 1, label: 'Nº 1', dimensiones: '5 × 15 cm', duracionHoras: 40, precioUnitario: 5900 },
      { numero: 2, label: 'Nº 2', dimensiones: '6 × 20 cm', duracionHoras: 60, precioUnitario: 7800 },
      { numero: 3, label: 'Nº 3', dimensiones: '8 × 25 cm', duracionHoras: 85, precioUnitario: 10500 },
      { numero: 4, label: 'Nº 4', dimensiones: '10 × 30 cm', duracionHoras: 105, precioUnitario: 12800 },
      { numero: 5, label: 'Nº 5', dimensiones: '10 × 35 cm', duracionHoras: 120, precioUnitario: 14500, isDefault: true },
      { numero: 6, label: 'Nº 6', dimensiones: '12 × 45 cm', duracionHoras: 160, precioUnitario: 19800 },
    ],
    stock: 12,
    destacado: true,
  },
  {
    id: 'prod-03',
    sku: 'VOT-LGT-X12-003',
    modelo: 'Caja Velas Votivas de Oración',
    categoriaId: 'votivas',
    categoriaNombre: 'Velas Votivas & Sagrario',
    tipoCeraId: 'parafina',
    tipoCeraNombre: 'Soja & Parafina Purificada',
    tamano: 'Pack 12 unidades (4 × 5 cm)',
    duracionHoras: 12,
    aromas: ['Neutro (Sin fragancia)'],
    aromaDefault: 'Neutro para Sagrario',
    imagen: '/velas-votivas.jpg',
    descripcion: 'Juego de veladoras para capillas, sagrarios y oratorios familiares. Recipiente seguro de aluminio y combustión limpia sin goteo.',
    precioUnitario: 5200,
    preciosPorVolumen: [
      { min: 1, max: 9, precio: 5200 },
      { min: 10, max: 29, precio: 4600 },
      { min: 30, max: null, precio: 3950 },
    ],
    tamanosPorNumero: [
      { numero: 1, label: 'Nº 1', dimensiones: 'Pack ×6 (4 × 4 cm)', duracionHoras: 8, precioUnitario: 3100 },
      { numero: 2, label: 'Nº 2', dimensiones: 'Pack ×12 (4 × 5 cm)', duracionHoras: 12, precioUnitario: 5200, isDefault: true },
      { numero: 3, label: 'Nº 3', dimensiones: 'Pack ×24 (4 × 5 cm)', duracionHoras: 12, precioUnitario: 9800 },
      { numero: 4, label: 'Nº 4', dimensiones: 'Pack ×48 (4 × 5 cm)', duracionHoras: 12, precioUnitario: 18500 },
    ],
    stock: 45,
    destacado: false,
  },
  {
    id: 'prod-04',
    sku: 'VEL-BOT-SMC-004',
    modelo: 'Vela San Francisco en Terracota',
    categoriaId: 'botanica',
    categoriaNombre: 'Línea Botánica',
    tipoCeraId: 'soja',
    tipoCeraNombre: 'Cera de Soja & Aceite de Oliva',
    tamano: 'Cazuela Cerámica (9 × 9 cm)',
    duracionHoras: 50,
    aromas: ['Ramas de Olivo', 'Romero Silvestre'],
    aromaDefault: 'Ramas de Olivo',
    imagen: '/vela-terracota.jpg',
    descripcion: 'Inspirada en el Cántico de las Criaturas. Hecha a mano en vasija de terracota natural reutilizable con mecha de algodón puro.',
    precioUnitario: 4900,
    preciosPorVolumen: [
      { min: 1, max: 9, precio: 4900 },
      { min: 10, max: 39, precio: 4200 },
      { min: 40, max: null, precio: 3700 },
    ],
    tamanosPorNumero: [
      { numero: 1, label: 'Nº 1', dimensiones: 'Chica (7 × 7 cm)', duracionHoras: 30, precioUnitario: 3700 },
      { numero: 2, label: 'Nº 2', dimensiones: 'Mediana (9 × 9 cm)', duracionHoras: 50, precioUnitario: 4900, isDefault: true },
      { numero: 3, label: 'Nº 3', dimensiones: 'Grande (12 × 12 cm)', duracionHoras: 80, precioUnitario: 7200 },
      { numero: 4, label: 'Nº 4', dimensiones: 'Extra Grande (15 × 15 cm)', duracionHoras: 120, precioUnitario: 10800 },
    ],
    stock: 18,
    destacado: true,
  },
  {
    id: 'prod-05',
    sku: 'CIR-MIN-PAR-005',
    modelo: 'Cirio Procesional con Cruz en Relieve',
    categoriaId: 'cirios',
    categoriaNombre: 'Cirios Pascuales & Altar',
    tipoCeraId: 'abeja',
    tipoCeraNombre: 'Cera Virgen de Abejas',
    tamano: 'Fino Procesional (2.5 × 25 cm)',
    duracionHoras: 18,
    aromas: ['Miel natural'],
    aromaDefault: 'Miel natural',
    imagen: '/hero-candles.jpg',
    descripcion: 'Cirio estilizado con la Cruz del Buen Pastor en relief. Excelente estabilidad para procesiones, Bautismos y Primeras Comuniones.',
    precioUnitario: 1900,
    preciosPorVolumen: [
      { min: 1, max: 19, precio: 1900 },
      { min: 20, max: 99, precio: 1600 },
      { min: 100, max: null, precio: 1350 },
    ],
    tamanosPorNumero: [
      { numero: 1, label: 'Nº 1', dimensiones: 'Fino (2.0 × 20 cm)', duracionHoras: 12, precioUnitario: 1400 },
      { numero: 2, label: 'Nº 2', dimensiones: 'Estándar (2.5 × 25 cm)', duracionHoras: 18, precioUnitario: 1900, isDefault: true },
      { numero: 3, label: 'Nº 3', dimensiones: 'Procesional (3.0 × 30 cm)', duracionHoras: 26, precioUnitario: 2600 },
      { numero: 4, label: 'Nº 4', dimensiones: 'Procesional (4.0 × 35 cm)', duracionHoras: 38, precioUnitario: 3800 },
    ],
    stock: 80,
    destacado: false,
  },
  {
    id: 'prod-06',
    sku: 'VEL-SAG-FAM-006',
    modelo: 'Vela Aromática Sagrada Familia',
    categoriaId: 'soja',
    categoriaNombre: 'Velas de Soja',
    tipoCeraId: 'soja',
    tipoCeraNombre: '100% Soja Vegetal Pura',
    tamano: 'Frasco Ámbar con Tapa (250g)',
    duracionHoras: 55,
    aromas: ['Nardo Puro', 'Lirios del Valle'],
    aromaDefault: 'Nardo Puro',
    imagen: '/vela-aromatica.jpg',
    descripcion: 'Frasco ámbar que preserva los aceites aromáticos esenciales. Con tapa de madera natural grabada para bendición del hogar cristiano.',
    precioUnitario: 4600,
    preciosPorVolumen: [
      { min: 1, max: 9, precio: 4600 },
      { min: 10, max: 39, precio: 3950 },
      { min: 40, max: null, precio: 3450 },
    ],
    tamanosPorNumero: [
      { numero: 1, label: 'Nº 1', dimensiones: 'Frasco (150g)', duracionHoras: 35, precioUnitario: 3400 },
      { numero: 2, label: 'Nº 2', dimensiones: 'Frasco Ámbar (250g)', duracionHoras: 55, precioUnitario: 4600, isDefault: true },
      { numero: 3, label: 'Nº 3', dimensiones: 'Frasco Ámbar (400g)', duracionHoras: 85, precioUnitario: 6900 },
      { numero: 4, label: 'Nº 4', dimensiones: 'Vasija Especial (600g)', duracionHoras: 120, precioUnitario: 9800 },
    ],
    stock: 30,
    destacado: true,
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState(() => {
    return window.location.hash === '#admin' ? 'admin' : 'productos';
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Estado reactivo del catálogo de productos
  const [productos, setProductos] = useState(INITIAL_PRODUCTOS);

  // Carrito de compras
  const [cartItems, setCartItems] = useState([
    {
      id: 'prod-02-N5',
      cartItemId: 'prod-02-N5',
      sku: 'CIR-ABJ-GRD-002-N5',
      modelo: 'Cirio Pascual & Altar de Abejas',
      tamano: 'Nº 5 (10 × 35 cm)',
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

  // Bitácora de actividad
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
      detalle: '1 unidad de Cirio Pascual de Abejas (Nº 5) añadida al pedido.',
      type: 'add',
    },
  ]);

  // Scroll suave arriba al cambiar sección
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  // Función para registrar actividad
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

  // ── MANEJADORES DE OPERACIONES DE PRODUCTOS (SUPERUSUARIO CRUD) ──

  // Subir / Agregar producto nuevo
  const handleAddProducto = (nuevoProducto) => {
    setProductos((prev) => [nuevoProducto, ...prev]);
    registrarActividad(
      'Superusuario: Producto Creado',
      `Se dio de alta "${nuevoProducto.modelo}" (SKU: ${nuevoProducto.sku}).`,
      'discount'
    );
  };

  // Modificar producto existente
  const handleUpdateProducto = (productoActualizado) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === productoActualizado.id ? productoActualizado : p))
    );
    registrarActividad(
      'Superusuario: Producto Modificado',
      `Se actualizaron datos y precios de "${productoActualizado.modelo}".`,
      'info'
    );
  };

  // Eliminar producto
  const handleDeleteProducto = (productoId) => {
    const prodEliminado = productos.find((p) => p.id === productoId);
    setProductos((prev) => prev.filter((p) => p.id !== productoId));
    if (prodEliminado) {
      registrarActividad(
        'Superusuario: Producto Eliminado',
        `Se retiró "${prodEliminado.modelo}" del catálogo.`,
        'remove'
      );
    }
  };

  // Modificación Masiva de Precios por Porcentaje
  const handleBulkUpdatePrices = (porcentaje, categoriaId) => {
    const factor = 1 + porcentaje / 100;
    setProductos((prev) =>
      prev.map((p) => {
        if (categoriaId !== 'todas' && p.categoriaId !== categoriaId) {
          return p;
        }

        const nuevoPrecioUnitario = Math.round(p.precioUnitario * factor);
        const nuevosTamanos = (p.tamanosPorNumero || []).map((t) => ({
          ...t,
          precioUnitario: Math.round(t.precioUnitario * factor),
        }));

        const nuevosPreciosVolumen = (p.preciosPorVolumen || []).map((t) => ({
          ...t,
          precio: Math.round(t.precio * factor),
        }));

        return {
          ...p,
          precioUnitario: nuevoPrecioUnitario,
          tamanosPorNumero: nuevosTamanos,
          preciosPorVolumen: nuevosPreciosVolumen,
        };
      })
    );

    registrarActividad(
      'Superusuario: Ajuste Masivo de Precios',
      `Se aplicó variación de ${porcentaje > 0 ? '+' : ''}${porcentaje}% a la categoría ${categoriaId}.`,
      'discount'
    );
  };

  // ── MANEJADORES DE CARRITO ──
  const handleAddToCart = (producto) => {
    const itemKey = producto.cartItemId || producto.id;
    const qtyToAdd = producto.cantidad || 1;

    setCartItems((prevItems) => {
      const existe = prevItems.find((it) => (it.cartItemId || it.id) === itemKey);
      if (existe) {
        return prevItems.map((it) =>
          (it.cartItemId || it.id) === itemKey
            ? { ...it, cantidad: it.cantidad + qtyToAdd }
            : it
        );
      } else {
        return [
          ...prevItems,
          {
            id: itemKey,
            cartItemId: itemKey,
            sku: producto.sku,
            modelo: producto.modelo,
            tamano: producto.tamano || 'Estándar',
            aroma: producto.aromaSeleccionado || producto.aromaDefault || '',
            precioUnitario: producto.precioUnitario,
            cantidad: qtyToAdd,
            preciosPorVolumen: producto.preciosPorVolumen,
            imagen: producto.imagen,
            duracionHoras: producto.duracionHoras,
          },
        ];
      }
    });

    registrarActividad(
      `Añadido: ${producto.modelo}`,
      `${qtyToAdd} ${qtyToAdd === 1 ? 'unidad' : 'unidades'} (${producto.tamano || 'Estándar'}) al pedido. Code: ${producto.sku}`,
      'add'
    );

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((it) => (it.id === productId ? { ...it, cantidad: newQty } : it))
    );
  };

  const handleRemoveItem = (productId) => {
    const itemEliminado = cartItems.find((it) => it.id === productId);
    setCartItems((prev) => prev.filter((it) => it.id !== productId));

    if (itemEliminado) {
      registrarActividad(
        'Producto retirado',
        `Se eliminó "${itemEliminado.modelo}" del pedido.`,
        'remove'
      );
    }
  };

  const handleClearCart = () => {
    if (window.confirm('¿Deseas vaciar todos los artículos de tu pedido?')) {
      setCartItems([]);
      registrarActividad('Pedido vaciado', 'Se restableció la selección.', 'remove');
    }
  };

  const handleFinalizarPedido = () => {
    registrarActividad('Cotización solicitada', 'Derivado a contacto.', 'info');
    setIsCartOpen(false);
    setActiveSection('contacto');
  };

  const totalItemsCount = cartItems.reduce((acc, it) => acc + it.cantidad, 0);

  return (
    <div className="app-layout">
      {/* Header */}
      <Header
        activeSection={activeSection}
        onNavigate={setActiveSection}
        cartCount={totalItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Contenido Principal Dinámico */}
      <main className="main-content" id="main-content">
        {activeSection === 'productos' && (
          <ProductosSection
            productos={productos}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeSection === 'quienes-somos' && (
          <QuienesSomosSection
            onIrAProductos={() => setActiveSection('productos')}
            onIrAContacto={() => setActiveSection('contacto')}
          />
        )}

        {activeSection === 'contacto' && <ContactoSection />}

        {activeSection === 'historial' && <HistorialSection />}

        {activeSection === 'admin' && (
          <AdminDashboardPage
            productos={productos}
            onAddProducto={handleAddProducto}
            onUpdateProducto={handleUpdateProducto}
            onDeleteProducto={handleDeleteProducto}
            onBulkUpdatePrices={handleBulkUpdatePrices}
            activityLog={activityLog}
          />
        )}
      </main>

      {/* Sidebar Lateral Derecha (Carrito + Actividad) */}
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

      {/* Pie de página */}
      <Footer onNavigate={setActiveSection} />

      {/* Botón Flotante Litúrgico de WhatsApp */}
      <FloatingWhatsApp />
    </div>
  );
}
