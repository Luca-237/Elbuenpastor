const { Producto } = require('../models');

/**
 * Obtener todos los productos
 * GET /api/productos
 */
const getProductos = async (req, res) => {
  try {
    const { categoriaId } = req.query;
    const filter = { activo: true };

    if (categoriaId && categoriaId !== 'todas') {
      filter.categoriaId = categoriaId;
    }

    const productos = await Producto.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: productos.length,
      data: productos,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener productos.',
      error: error.message,
    });
  }
};

/**
 * Actualizar precio o producto
 * PUT /api/productos/:id
 */
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = req.body;

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      actualizacion,
      { new: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente.',
      data: productoActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el producto.',
      error: error.message,
    });
  }
};

/**
 * Actualización masiva de precios por porcentaje
 * PATCH /api/productos/precios-masivos
 */
const bulkUpdatePrices = async (req, res) => {
  try {
    const { porcentaje, categoriaId } = req.body;
    const factor = 1 + (Number(porcentaje) || 0) / 100;

    const query = { activo: true };
    if (categoriaId && categoriaId !== 'todas') {
      query.categoriaId = categoriaId;
    }

    const productos = await Producto.find(query);

    for (const prod of productos) {
      prod.precioUnitario = Math.round(prod.precioUnitario * factor);
      if (prod.tamanosPorNumero && Array.isArray(prod.tamanosPorNumero)) {
        prod.tamanosPorNumero = prod.tamanosPorNumero.map((t) => ({
          ...t,
          precioUnitario: Math.round((t.precioUnitario || prod.precioUnitario) * factor),
        }));
      }
      await prod.save();
    }

    return res.status(200).json({
      success: true,
      message: `Precios actualizados en un ${porcentaje}% para ${productos.length} productos.`,
      afectados: productos.length,
    });
  } catch (error) {
    console.error('Error en actualización masiva de precios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al aplicar variación de precios.',
      error: error.message,
    });
  }
};

module.exports = {
  getProductos,
  updateProducto,
  bulkUpdatePrices,
};
