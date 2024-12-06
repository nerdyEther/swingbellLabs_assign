const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  static async create(name, email, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (name, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, email
    `;

    try {
      const result = await pool.query(query, [name, email, hashedPassword]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async authenticate(email, password) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    delete user.password;

    return { user, token };
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
   
      const query = 'SELECT id, name, email FROM users WHERE id = $1';
      const result = await pool.query(query, [decoded.id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = User;