const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mbnu4jlf',
  api_key: process.env.CLOUDINARY_API_KEY || '843366799279225',
  api_secret: process.env.CLOUDINARY_API_SECRET || '1mn7ULElkZwmrSreEe8xAyYXcIU',
  secure: true,
});

module.exports = cloudinary;
