require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

async function testConnection() {
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Intentando conectar a MongoDB Atlas...');
    await client.connect();

    // Ping para confirmar conexión
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Conexión exitosa a MongoDB Atlas!');

    // Listar las bases de datos disponibles
    const adminDb = client.db('admin');
    const dbList = await adminDb.admin().listDatabases();

    console.log('\n📂 Bases de datos disponibles en el cluster:');
    dbList.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024).toFixed(2)} KB)`);
    });

    // Mostrar info del cluster
    const buildInfo = await adminDb.command({ buildInfo: 1 });
    console.log(`\n🖥️  Versión de MongoDB Server: ${buildInfo.version}`);
    console.log(`📡 App conectada a: ${process.env.MONGO_URI.split('@')[1].split('/')[0]}`);
    console.log('\n📌 Los datos de este ecommerce impactarán en:');
    console.log('   Cluster  : elbuenpastor.alueqni.mongodb.net');
    console.log('   App Name : ElBuenPastor');
    console.log('   Base de datos principal: ElBuenPastor (se creará al insertar el primer documento)');
    console.log('   Colecciones sugeridas  : productos, usuarios, pedidos, categorias, pagos\n');

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await client.close();
    console.log('🔒 Conexión cerrada correctamente.');
  }
}

testConnection();
