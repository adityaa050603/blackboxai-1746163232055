const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all stations
router.get('/', stationController.getAllStations);

// Add a new station (admin only)
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, stationController.addStation);

// Update a station (admin only)
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, stationController.updateStation);

// Delete a station (admin only)
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, stationController.deleteStation);

module.exports = router;
