const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 5000; // You can change this to any available port number

// Configure JSON middleware to parse request bodies
app.use(express.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_username',
    password: 'your_mysql_password',
    database: 'your_database_name'
  });
  
  // Connect to the MySQL server
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL server');
  });
  
