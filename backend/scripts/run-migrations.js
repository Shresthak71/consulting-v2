const fs = require("fs")
const path = require("path")
const mysql = require("mysql2/promise")
require("dotenv").config()

async function runMigrations() {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true, // Allow multiple SQL statements
    })

    console.log("Connected to database")

    // Read migration files
    const migrationsDir = path.join(__dirname, "../migrations")
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort() // Sort to ensure order

    // Execute each migration file
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`)
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, "utf8")

      try {
        await connection.query(sql)
        console.log(`Migration ${file} completed successfully`)
      } catch (error) {
        console.error(`Error running migration ${file}:`, error.message)
        // Continue with next migration even if one fails
      }
    }

    await connection.end()
    console.log("All migrations completed")
  } catch (error) {
    console.error("Migration error:", error)
    process.exit(1)
  }
}

runMigrations()
