const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all users (Admin/Manager only)
// @route   GET /api/users
// @access  Private (Admin/Manager)
router.get('/', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

