const mysql = require("mysql2/promise")
require("dotenv").config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "P@ssw0rd1",
  database: process.env.DB_NAME || "consultancy",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("Database connected successfully")
    connection.release()
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

testConnection()

module.exports = pool
