const express = require('express');
const router = express.Router();
const user = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    console.log(req.body);
});