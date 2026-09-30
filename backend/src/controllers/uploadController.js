const cloudinary = require('../config/cloudinaryConfig');
const multer = require('multer');

// Configuración de Multer para almacenamiento temporal en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se admiten archivos de imagen (JPG, PNG, WEBP, GIF).'), false);
    }
  },
});

// Middleware de Multer para single file upload 'imagen'
const uploadSingleImageMiddleware = upload.single('imagen');

// Controlador para procesar la subida de la imagen a Cloudinary
const uploadImageToCloudinary = async (req, res) => {
  try {
    if (!req.file && !req.body.imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'No se ha adjuntado ninguna imagen para subir.',
      });
    }

    // Subida mediante Base64 si viene en el body
    if (req.body.imageBase64) {
      const result = await cloudinary.uploader.upload(req.body.imageBase64, {
        folder: 'elbuenpastor/productos',
        resource_type: 'auto',
      });

      return res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente a Cloudinary',
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    // Subida mediante Buffer de Multer
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'elbuenpastor/productos',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('❌ Error al subir imagen a Cloudinary:', error);
          return res.status(500).json({
            success: false,
            message: 'Error al procesar la imagen en Cloudinary.',
            error: error.message,
          });
        }

        console.log('✅ Imagen subida con éxito a Cloudinary:', result.secure_url);
        return res.status(200).json({
          success: true,
          message: 'Imagen subida exitosamente a Cloudinary',
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    console.error('❌ Error en el controlador de subida:', err);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor al subir la imagen.',
      error: err.message,
    });
  }
};

module.exports = {
  uploadSingleImageMiddleware,
  uploadImageToCloudinary,
};
