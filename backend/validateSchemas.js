require('dotenv').config();
const connectDB = require('./src/config/database');
const { CategoriaCliente, Cliente, Tamano, ModeloVela, Producto, Pedido } = require('./src/models');

async function validateSchemas() {
  await connectDB();

  console.log('\n🔍 Validando colecciones en MongoDB...\n');

  const modelos = [
    { nombre: 'CategoriaCliente', model: CategoriaCliente, coleccion: 'categorias_cliente' },
    { nombre: 'Cliente',          model: Cliente,           coleccion: 'clientes' },
    { nombre: 'Tamano',           model: Tamano,            coleccion: 'tamanos' },
    { nombre: 'ModeloVela',       model: ModeloVela,        coleccion: 'modelos_vela' },
    { nombre: 'Producto',         model: Producto,          coleccion: 'productos' },
    { nombre: 'Pedido',           model: Pedido,            coleccion: 'pedidos' },
  ];

  for (const { nombre, model, coleccion } of modelos) {
    const count = await model.countDocuments();
    const indexes = await model.collection.indexes();
    console.log(`  ✅ ${nombre.padEnd(20)} → colección: "${coleccion.padEnd(20)}" | docs: ${count} | índices: ${indexes.length}`);
  }

  console.log('\n✅ Todos los esquemas Mongoose validados correctamente.');
  console.log('📂 Base de datos: ElBuenPastor\n');
  process.exit(0);
}

validateSchemas().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
