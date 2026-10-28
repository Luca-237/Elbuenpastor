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
import { INITIAL_CATEGORIES, INITIAL_PRODUCTOS, formatMedidaDimension } from './data/catalogoData';
import './App.css';

const STORAGE_KEY_CATEGORIES = 'elbuenpastor_categories_v3';
const STORAGE_KEY_PRODUCTOS = 'elbuenpastor_productos_v3';

export default function App() {
  const [activeSection, setActiveSection] = useState(() => {
    return window.location.hash === '#admin' ? 'admin' : 'productos';
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Categorías maestras (Velas Litúrgicas, Velones, Cirios) con medidas estandarizadas
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo categorías de localStorage:', e);
    }
    return INITIAL_CATEGORIES;
  });

  // Catálogo reactivo de productos
  const [productos, setProductos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo productos de localStorage:', e);
    }
    return INITIAL_PRODUCTOS;
  });

  // Carrito de compras
  const [cartItems, setCartItems] = useState([
    {
      id: 'prod-cirio-pascual-tam3',
      cartItemId: 'prod-cirio-pascual-tam3',
      sku: 'CIR-PAS-TRA-001-70x85',
      modelo: 'Cirio Pascual Tradicional & Cruz Solemne',
      tamano: 'Ø 70 mm × 85 cm',
      precioUnitario: 22500,
      cantidad: 1,
      preciosPorVolumen: [
        { min: 1, max: 4, precio: 22500 },
        { min: 5, max: 19, precio: 19800 },
        { min: 20, max: null, precio: 17500 },
      ],
      imagen: '/cirio-pascual.jpg',
      duracionHoras: 160,
    },
  ]);

  // Bitácora de actividad litúrgica y superusuario
  const [activityLog, setActivityLog] = useState([
    {
      id: 'act-1',
      time: '14:15',
      titulo: 'Inicio de navegación litúrgica',
      detalle: 'Consulta del catálogo sagrado: Velas Litúrgicas, Velones y Cirios.',
      type: 'info',
    },
    {
      id: 'act-2',
      time: '14:18',
      titulo: 'Cirio Pascual añadido',
      detalle: '1 unidad de Cirio Pascual de Abejas (Ø 70 mm × 85 cm) añadida al pedido.',
      type: 'add',
    },
  ]);

  // Sincronizar en localStorage para persistencia
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error guardando categorias:', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTOS, JSON.stringify(productos));
    } catch (e) {
      console.error('Error guardando productos:', e);
    }
  }, [productos]);

  // Scroll arriba al cambiar sección
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  // Registrar actividad
  const registrarActividad = (titulo, detalle, type = 'info') => {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivityLog((prev) => [
      {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        time: hora,
        titulo,
        detalle,
        type,
      },
      ...prev,
    ]);
  };

  // ── GESTIÓN DE CATEGORÍAS (SUPERUSER) ──────────────────────────────────────

  // Renombrar categoría y actualizar todos los productos correspondientes
  const handleRenameCategory = (categoryId, newNombre, newDescripcion) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            nombre: newNombre.trim(),
            descripcion: newDescripcion !== undefined ? newDescripcion.trim() : cat.descripcion,
          };
        }
        return cat;
      })
    );

    // Actualizar cache de nombre de categoría en todos los productos afectados
    setProductos((prev) =>
      prev.map((p) => {
        if (p.categoriaId === categoryId) {
          return { ...p, categoriaNombre: newNombre.trim() };
        }
        return p;
      })
    );

    registrarActividad(
      'Superusuario: Categoría Renombrada',
      `Se renombró la categoría a "${newNombre.trim()}".`,
      'info'
    );
  };

  // Agregar nueva categoría
  const handleAddCategory = (newCat) => {
    const slug = newCat.id || newCat.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const categoryToAdd = {
      ...newCat,
      id: slug,
      medidas: newCat.medidas || [],
    };
    setCategories((prev) => [...prev, categoryToAdd]);
    registrarActividad(
      'Superusuario: Categoría Creada',
      `Se agregó la nueva categoría "${newCat.nombre}".`,
      'discount'
    );
  };

  // ── GESTIÓN DE MEDIDAS POR CATEGORÍA ─────────────────────────────────────

  // Agregar medida a una categoría
  const handleAddMeasureToCategory = (categoryId, newMeasure) => {
    const measureId = `med-${newMeasure.diametroMm}-${newMeasure.largoCm}-${Date.now().toString().slice(-4)}`;
    const formattedMeasure = {
      id: measureId,
      diametroMm: Number(newMeasure.diametroMm),
      largoCm: Number(newMeasure.largoCm),
      duracionHoras: Number(newMeasure.duracionHoras) || 30,
      precioBase: Number(newMeasure.precioBase) || 4000,
    };

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            medidas: [...cat.medidas, formattedMeasure],
          };
        }
        return cat;
      })
    );

    registrarActividad(
      'Superusuario: Medida Estandarizada Agregada',
      `Nueva medida ${newMeasure.diametroMm} mm × ${newMeasure.largoCm} cm añadida a ${categoryId}.`,
      'add'
    );
  };

  // Editar medida existente en una categoría
  const handleEditMeasureInCategory = (categoryId, measureId, updatedMeasure) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            medidas: cat.medidas.map((m) =>
              m.id === measureId
                ? {
                    ...m,
                    diametroMm: Number(updatedMeasure.diametroMm),
                    largoCm: Number(updatedMeasure.largoCm),
                    duracionHoras: Number(updatedMeasure.duracionHoras),
                    precioBase: Number(updatedMeasure.precioBase),
                  }
                : m
            ),
          };
        }
        return cat;
      })
    );

    registrarActividad(
      'Superusuario: Medida Modificada',
      `Medida actualizada a ${updatedMeasure.diametroMm} mm × ${updatedMeasure.largoCm} cm.`,
      'info'
    );
  };

  // Eliminar medida de una categoría
  const handleDeleteMeasureFromCategory = (categoryId, measureId) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            medidas: cat.medidas.filter((m) => m.id !== measureId),
          };
        }
        return cat;
      })
    );

    registrarActividad(
      'Superusuario: Medida Eliminada',
      `Se removió una medida estándar de ${categoryId}.`,
      'remove'
    );
  };

  // ── GESTIÓN DE PRODUCTOS (SUPERUSER CRUD) ──────────────────────────────────

  // Subir / Agregar producto nuevo
  const handleAddProducto = (nuevoProducto) => {
    setProductos((prev) => [nuevoProducto, ...prev]);
    registrarActividad(
      'Superusuario: Producto Creado',
      `Se dio de alta "${nuevoProducto.modelo}" (Categoría: ${nuevoProducto.categoriaNombre}).`,
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
      `Se actualizaron datos, medidas y precios de "${productoActualizado.modelo}".`,
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
        `Se retiró "${prodEliminado.modelo}" del catálogo litúrgico.`,
        'remove'
      );
    }
  };

  // Recategorizar producto (Cambio inmediato de categoría)
  const handleRecategorizeProducto = (productoId, newCategoryId) => {
    const targetCat = categories.find((c) => c.id === newCategoryId);
    if (!targetCat) return;

    setProductos((prev) =>
      prev.map((p) => {
        if (p.id !== productoId) return p;

        // Si el producto cambia de categoría, adoptamos las medidas estándar de la nueva categoría si las tiene
        let updatedSizes = p.tamanosPorNumero;
        if (targetCat.medidas && targetCat.medidas.length > 0) {
          updatedSizes = targetCat.medidas.map((m, idx) => ({
            numero: idx + 1,
            id: m.id,
            diametroMm: m.diametroMm,
            largoCm: m.largoCm,
            label: `${m.diametroMm} mm × ${m.largoCm} cm`,
            dimensiones: formatMedidaDimension(m.diametroMm, m.largoCm),
            duracionHoras: m.duracionHoras,
            precioUnitario: m.precioBase || p.precioUnitario,
            isDefault: idx === 0,
          }));
        }

        const nuevoPrecio = updatedSizes[0]?.precioUnitario || p.precioUnitario;
        const tamanoLabel = updatedSizes[0]?.dimensiones || p.tamano;

        return {
          ...p,
          categoriaId: targetCat.id,
          categoriaNombre: targetCat.nombre,
          tamano: tamanoLabel,
          precioUnitario: nuevoPrecio,
          tamanosPorNumero: updatedSizes,
        };
      })
    );

    const prod = productos.find((p) => p.id === productoId);
    registrarActividad(
      'Superusuario: Producto Recategorizado',
      `"${prod?.modelo || 'Producto'}" trasladado a la categoría "${targetCat.nombre}".`,
      'info'
    );
  };

  // Control rápido de precio individual
  const handleUpdatePrice = (productoId, nuevoPrecio) => {
    const precioNum = Math.max(1, Number(nuevoPrecio));
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id !== productoId) return p;
        const factor = precioNum / (p.precioUnitario || 1);

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
          precioUnitario: precioNum,
          tamanosPorNumero: nuevosTamanos,
          preciosPorVolumen: nuevosPreciosVolumen,
        };
      })
    );

    const prod = productos.find((p) => p.id === productoId);
    registrarActividad(
      'Superusuario: Precio Actualizado',
      `Precio base de "${prod?.modelo}" fijado en $${precioNum.toLocaleString('es-AR')}.`,
      'discount'
    );
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

  // Restablecer catálogo a valores de fábrica
  const handleResetCatalog = () => {
    if (window.confirm('¿Restablecer el catálogo y categorías originales de El Buen Pastor? Se reiniciarán los datos locales.')) {
      setCategories(INITIAL_CATEGORIES);
      setProductos(INITIAL_PRODUCTOS);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      localStorage.removeItem(STORAGE_KEY_PRODUCTOS);
      registrarActividad(
        'Superusuario: Catálogo Restablecido',
        'Se reconfiguraron las 3 categorías canónicas y medidas iniciales.',
        'info'
      );
    }
  };

  // ── MANEJADORES DE CARRITO ────────────────────────────────────────────────
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
      `${qtyToAdd} ${qtyToAdd === 1 ? 'unidad' : 'unidades'} (${producto.tamano || 'Estándar'}) al pedido.`,
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
    registrarActividad('Cotización solicitada', 'Derivado a contacto parroquial.', 'info');
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
            categories={categories}
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
            categories={categories}
            onAddProducto={handleAddProducto}
            onUpdateProducto={handleUpdateProducto}
            onDeleteProducto={handleDeleteProducto}
            onRecategorizeProducto={handleRecategorizeProducto}
            onUpdatePrice={handleUpdatePrice}
            onBulkUpdatePrices={handleBulkUpdatePrices}
            onRenameCategory={handleRenameCategory}
            onAddCategory={handleAddCategory}
            onAddMeasureToCategory={handleAddMeasureToCategory}
            onEditMeasureInCategory={handleEditMeasureInCategory}
            onDeleteMeasureFromCategory={handleDeleteMeasureFromCategory}
            onResetCatalog={handleResetCatalog}
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
