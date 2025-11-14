const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getLeadActivities,
  createActivity,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/lead/:leadId', getLeadActivities);
router.post(
  '/',
  [
    body('type').isIn(['Note', 'Call', 'Meeting', 'Email', 'Status Change']).withMessage('Invalid activity type'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('leadId').notEmpty().withMessage('Lead ID is required')
  ],
  createActivity
);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;

