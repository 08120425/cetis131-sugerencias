const express = require('express');
const router = express.Router();
const {
    createSuggestion,
    getAllSuggestions,
    getSuggestionById,
    updateSuggestion,
    deleteSuggestion,
    getStats,
    getOffensiveSuggestions
} = require('../controllers/suggestionController');

// Rutas públicas
router.post('/', createSuggestion);

// Rutas privadas (en producción agregar middleware de autenticación)
router.get('/', getAllSuggestions);
router.get('/stats', getStats);
router.get('/offensive', getOffensiveSuggestions);
router.get('/:id', getSuggestionById);
router.patch('/:id', updateSuggestion);
router.delete('/:id', deleteSuggestion);

module.exports = router;