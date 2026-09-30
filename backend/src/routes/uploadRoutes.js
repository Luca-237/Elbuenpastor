const express = require('express');
const router = express.Router();
const {
  uploadSingleImageMiddleware,
  uploadImageToCloudinary,
} = require('../controllers/uploadController');

// POST /api/upload - Subir imagen a Cloudinary
router.post('/', uploadSingleImageMiddleware, uploadImageToCloudinary);

module.exports = router;
