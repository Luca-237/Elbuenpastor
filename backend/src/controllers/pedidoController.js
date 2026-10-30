const { Pedido, Cliente } = require('../models');

/**
 * Obtener todos los pedidos con filtros opcionales
 * GET /api/pedidos
 */
const getPedidos = async (req, res) => {
  try {
    const { estado, busqueda } = req.query;
    const filter = {};

    if (estado && estado !== 'todos') {
      filter.estado = estado;
    }

    if (busqueda && busqueda.trim()) {
      const regex = new RegExp(busqueda.trim(), 'i');
      filter.$or = [
        { numeroPedido: regex },
        { clienteNombre: regex },
        { 'direccionEntrega.ciudad': regex },
        { 'direccionEntrega.provincia': regex },
      ];
    }

    const pedidos = await Pedido.find(filter)
      .sort({ createdAt: -1 })
      .populate('cliente', 'nombre apellido email telefono cuit');

    return res.status(200).json({
      success: true,
      total: pedidos.length,
      data: pedidos,
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de pedidos.',
      error: error.message,
    });
  }
};

/**
 * Obtener un pedido por ID
 * GET /api/pedidos/:id
 */
const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findById(id).populate('cliente');

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: pedido,
    });
  } catch (error) {
    console.error('Error al obtener pedido por ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al buscar el pedido.',
      error: error.message,
    });
  }
};

/**
 * Crear un nuevo pedido
 * POST /api/pedidos
 */
const createPedido = async (req, res) => {
  try {
    const {
      clienteId,
      clienteNombre,
      clienteEmail,
      clienteTelefono,
      items,
      direccionEntrega,
      notas,
      metodoPago = 'transferencia',
      tipoEntrega = 'retiro_local',
      descuentoPorcentaje = 0,
      costoEnvio = 0,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El pedido debe incluir al menos un producto.',
      });
    }

    // 1. Resolver Cliente (Buscar existente o crear uno rápido para asociar)
    let clienteDoc = null;
    if (clienteId) {
      clienteDoc = await Cliente.findById(clienteId);
    }

    if (!clienteDoc) {
      const emailQuery = (clienteEmail || `contacto-${Date.now()}@elbuenpastor.com`).toLowerCase().trim();
      clienteDoc = await Cliente.findOne({ email: emailQuery });

      if (!clienteDoc) {
        clienteDoc = await Cliente.create({
          nombre: clienteNombre || 'Cliente Web / Parroquia',
          email: emailQuery,
          telefono: clienteTelefono || '+54 9 11 0000-0000',
          direccion: {
            ciudad: direccionEntrega?.ciudad || 'Buenos Aires',
            provincia: direccionEntrega?.provincia || 'Buenos Aires',
          },
        });
      }
    }

    // 2. Mapear items asegurando el snapshot estricto
    const itemsSnapshot = items.map((it) => {
      const cant = Number(it.cantidad) || 1;
      const pu = Number(it.precioUnitario) || 0;
      return {
        productoId: it.productoId || null,
        sku: (it.sku || 'SKU-LIT-001').toUpperCase(),
        modeloNombre: it.modeloNombre || it.modelo || 'Vela Litúrgica Artesanal',
        tamanoNombre: it.tamanoNombre || it.tamano || 'Estándar',
        aroma: it.aroma || null,
        cantidad: cant,
        precioUnitario: pu,
        subtotal: cant * pu,
      };
    });

    const subtotal = itemsSnapshot.reduce((acc, it) => acc + it.subtotal, 0);
    const descuentoMonto = Math.round((subtotal * (Number(descuentoPorcentaje) || 0)) / 100);
    const total = subtotal - descuentoMonto + (Number(costoEnvio) || 0);

    // 3. Crear pedido en la base de datos
    const nuevoPedido = await Pedido.create({
      cliente: clienteDoc._id,
      clienteNombre: clienteNombre || clienteDoc.nombre,
      estado: 'pendiente',
      items: itemsSnapshot,
      direccionEntrega: {
        calle: direccionEntrega?.calle || '',
        numero: direccionEntrega?.numero || '',
        piso: direccionEntrega?.piso || '',
        ciudad: direccionEntrega?.ciudad || 'Buenos Aires',
        provincia: direccionEntrega?.provincia || 'Buenos Aires',
        codigoPostal: direccionEntrega?.codigoPostal || '',
        pais: direccionEntrega?.pais || 'Argentina',
      },
      subtotal,
      descuentoPorcentaje: Number(descuentoPorcentaje) || 0,
      descuentoMonto,
      costoEnvio: Number(costoEnvio) || 0,
      total,
      metodoPago,
      tipoEntrega,
      notas: notas || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Pedido litúrgico registrado con éxito.',
      data: nuevoPedido,
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return res.status(500).json({
      success: false,
      message: 'No se pudo crear el pedido.',
      error: error.message,
    });
  }
};

/**
 * Actualizar el estado de un pedido
 * PATCH /api/pedidos/:id/estado
 */
const updatePedidoEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = [
      'recibido',
      'en_camino',
      'entregado',
      // Compatibilidad con registros legados
      'borrador',
      'pendiente',
      'confirmado',
      'en_preparacion',
      'listo',
      'enviado',
      'cancelado',
    ];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado no válido. Opciones permitidas: ${estadosValidos.join(', ')}`,
      });
    }

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    ).populate('cliente');

    if (!pedidoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Estado del pedido actualizado a "${estado}".`,
      data: pedidoActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del pedido.',
      error: error.message,
    });
  }
};

/**
 * Eliminar un pedido
 * DELETE /api/pedidos/:id
 */
const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Pedido.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pedido eliminado correctamente.',
    });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el pedido.',
      error: error.message,
    });
  }
};

module.exports = {
  getPedidos,
  getPedidoById,
  createPedido,
  updatePedidoEstado,
  deletePedido,
};
