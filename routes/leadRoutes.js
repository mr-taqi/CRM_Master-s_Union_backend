const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getLeads);
router.get('/:id', getLead);
router.post(
  '/',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  createLead
);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;

