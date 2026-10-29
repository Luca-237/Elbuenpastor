const express = require('express');
const router = express.Router();
const { loginAdmin, getMetricasAdmin } = require('../controllers/adminController');

router.post('/login', loginAdmin);
router.get('/metricas', getMetricasAdmin);

module.exports = router;
