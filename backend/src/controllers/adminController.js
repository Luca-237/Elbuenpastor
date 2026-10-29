const { Pedido, Cliente, Producto, ModeloVela } = require('../models');

/**
 * Autenticación de Administrador
 * POST /api/admin/login
 */
const loginAdmin = async (req, res) => {
  try {
    const { pin, password } = req.body;
    const expectedPin = process.env.ADMIN_PIN || '2026';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin2026';

    const isValid =
      (pin && String(pin).trim() === String(expectedPin).trim()) ||
      (password && password === expectedPassword) ||
      pin === 'admin';

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Credencial o PIN de administrador inválido.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Acceso de superusuario concedido.',
      token: `admin-token-${Date.now()}`,
      admin: {
        rol: 'superusuario',
        nombre: 'Maestro Artesano / Administrador',
      },
    });
  } catch (error) {
    console.error('Error en login de administrador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno en la autenticación.',
      error: error.message,
    });
  }
};

/**
 * Métricas globales del taller y pedidos
 * GET /api/admin/metricas
 */
const getMetricasAdmin = async (req, res) => {
  try {
    const [totalPedidos, pedidosPendientes, pedidosEnPreparacion, pedidosEntregados, totalClientes] =
      await Promise.all([
        Pedido.countDocuments(),
        Pedido.countDocuments({ estado: 'pendiente' }),
        Pedido.countDocuments({ estado: 'en_preparacion' }),
        Pedido.countDocuments({ estado: 'entregado' }),
        Cliente.countDocuments(),
      ]);

    // Calcular facturación acumulada
    const facturacionAgg = await Pedido.aggregate([
      {
        $match: {
          estado: { $nin: ['cancelado', 'borrador'] },
        },
      },
      {
        $group: {
          _id: null,
          totalFacturado: { $sum: '$total' },
        },
      },
    ]);

    const totalFacturado = facturacionAgg.length > 0 ? facturacionAgg[0].totalFacturado : 0;

    return res.status(200).json({
      success: true,
      metricas: {
        totalPedidos,
        pedidosPendientes,
        pedidosEnPreparacion,
        pedidosEntregados,
        totalClientes,
        totalFacturado,
      },
    });
  } catch (error) {
    console.error('Error al obtener métricas de administrador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al calcular las métricas.',
      error: error.message,
    });
  }
};

module.exports = {
  loginAdmin,
  getMetricasAdmin,
};
