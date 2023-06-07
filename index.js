const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware');
const swaggerUI = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const port = 5000;
const secretKey = 'chiee@auth';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'chiee@mysql',
  database: 'accomodae_og'
});

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'API documentation for your Node.js application',
    },
  },
  apis: ['./index.js'], // Specify the file(s) where your routes are defined
};

// Generate the Swagger specification
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve the Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Serve the Swagger specification
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rest of your code goes here...


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register route
 *     description: Register a new user
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
app.post('/register', (req, res) => {
    // Retrieve user data from request body
    const { name, email, password } = req.body;
  
    // Connect to the database
    db.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      // Insert user into the database
      const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(query, [name, email, password], (err, results) => {
       // db.release(); // Close the database connection
  
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ message: 'Database error' });
        }
        db.end();
  
        // Return a success message
        res.json({ message: 'User registered successfully' });
      });
    });
  });
 /**
 * @swagger
 * /login:
 *   post:
 *     summary: Login route
 *     description: Authenticate a user
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
  app.post('/login', (req, res) => {
    // Retrieve user credentials from request body
    const { email, password } = req.body;
  
    // Connect to the database
    db.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      // Check user credentials in the database
      const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
      db.query(query, [email, password], (err, results) => {
         // Close the database connection
  
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ message: 'Database error' });
        }
  
        // Check if user exists and password matches
        if (results.length === 0) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
  
        // User authenticated successfully
        res.json({ message: 'Login successful' });
        
        
      });
    });
  });
  


  app.get('/protected', verifyToken, (req, res) => {
    // If the execution reaches this point, it means the token was successfully verified
    res.json({ message: 'Protected endpoint accessed' });
  });
  
  // Middleware function to verify JWT token
  function verifyToken(req, res, next) {
    // Get the token from the request headers
    const token = req.headers['authorization'];
  
    // Check if token is provided
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    // Verify the token
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Failed to authenticate token' });
      }
  
      // Token is valid, add the decoded user information to the request object
      req.user = decoded.user;
      next();
    });
  }
  
function verifyToken(req, res, next) {
  // Get the token from the request headers
  const token = req.headers['authorization'];

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    // Token is valid, add the decoded user information to the request object
    req.user = decoded.user;
    next();
  });
}

 
  
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erroe retrieving user');
        return;
        
      }
      res.json(result);
    });
  });
  
  app.post('/users', (req, res) => {
    const { name, email } = req.body;
    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.query(sql, [name, email], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error creating user');
        return;
      }
      res.send('User created successfully');
    });
  });
  app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email } = req.body;
    const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    db.query(sql, [name, email, userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error creating user');
        return;
        
      }
      res.send('User updated successfully');
    });
  });
  app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error deleting user');
        return;
      }
      res.send('User deleted successfully');
    });
  });

  db.connect((err) => {
    if (err) {
        console.error(err);
        res.status(500).send('Error connection to database');
        return;
   }
   console.log('Connected to the database');
  })

  app.listen(port, () => {
     console.log(`Example app listening on port ${port}`);
});