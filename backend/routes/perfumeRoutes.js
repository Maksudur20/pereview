const express = require('express');
const router = express.Router();
const {
  getPerfumes, getPerfumeById, createPerfume, updatePerfume,
  deletePerfume, trackBuyClick, getSimilarPerfumes, comparePerfumes,
  getBrands, getNotes,
} = require('../controllers/perfumeController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/compare', comparePerfumes);
router.get('/meta/brands', getBrands);
router.get('/meta/notes', getNotes);
router.get('/', getPerfumes);
router.get('/:id', getPerfumeById);
router.get('/:id/similar', getSimilarPerfumes);
router.post('/:id/buy-click', trackBuyClick);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('image'), createPerfume);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updatePerfume);
router.delete('/:id', protect, authorize('admin'), deletePerfume);

module.exports = router;
