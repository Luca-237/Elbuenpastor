require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar Base de Datos MongoDB
connectDB();

// Rutas API
app.use('/api/whatsapp', whatsappRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'El Buen Pastor Backend API',
    time: new Date().toISOString(),
  });
});

// Iniciar Servidor
const server = app.listen(PORT, () => {
  console.log(`🕊️ Servidor litúrgico El Buen Pastor activo en http://localhost:${PORT}`);
  console.log(`📱 WhatsApp Webhook listo en: http://localhost:${PORT}/api/whatsapp/webhook`);
});

module.exports = { app, server };
