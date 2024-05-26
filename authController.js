// authController.js

const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes } = require('sequelize');

// Connect to Azure SQL Database
const sequelize = new Sequelize(process.env.SQL_DATABASE, process.env.SQL_USER, process.env.SQL_PASSWORD, {
  host: process.env.SQL_SERVER,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true
    }
  }
});

// Define User model
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false }
});

router.post('/register', async (req, res) => {
  console.log(req.body)
  const { username, password, name } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user
    await User.create({ username, password, name });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;