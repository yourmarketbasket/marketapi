const express = require('express');
const router = express.Router();
const user = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Authservice = require('../Services/authService')

router.post('/register', async (req, res) => {
    console.log(req.body);
});



module.exports = router;