const express = require('express');
const router = express.Router();
const User = require('../models/User');


const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await User.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Signup 
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    // Email validation 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }


    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const user = await User.create(name, email, password);

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      res.status(409).json({ error: 'Email already in use' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Server error during signup' });
    }
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }


    const { user, token } = await User.authenticate(email, password);

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: 'Invalid email or password' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
});


router.get('/verify-token', authMiddleware, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user
  });
});

module.exports = router;