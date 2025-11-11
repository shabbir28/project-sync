const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');
const { userJwtSecret } = require('../config');

// ------------------- Signup -------------------
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'ERROR', message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({ username, email, password: hashedPassword, role });

        // Create JWT token
        const token = jwt.sign({ data: newUser._id }, userJwtSecret, { expiresIn: '1d' });

        // Set cookie
        res.cookie('userToken', token, {
            httpOnly: true,
            secure: true,       // HTTPS only
            sameSite: 'none',   // allow cross-site
            maxAge: 24*60*60*1000
        });

        res.status(200).json({ status: 'SUCCESS', message: 'Signup successful', user: newUser });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

// ------------------- Login -------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(403).json({ status: 'ERROR', message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(403).json({ status: 'ERROR', message: 'Invalid credentials' });

        // Create JWT token
        const token = jwt.sign({ data: user._id }, userJwtSecret, { expiresIn: '1d' });

        // Set cookie
        res.cookie('userToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24*60*60*1000
        });

        res.status(200).json({ status: 'SUCCESS', message: 'Login successful', user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

// ------------------- Logout -------------------
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('userToken');
        res.status(200).json({ status: 'SUCCESS', message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ status: 'ERROR', message: 'Server error during logout' });
    }
});

module.exports = router;
