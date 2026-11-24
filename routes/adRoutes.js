const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');

router.get('/', adController.getIndex);
router.get('/create', adController.getCreate);
router.post('/', adController.create);
router.put('/ads/:id', adController.update);
router.delete('/ads/:id', adController.delete);

module.exports = router;