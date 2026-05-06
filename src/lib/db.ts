import mysql from 'mysql2/promise'

// Reuse the connection pool across hot reloads in development
const globalForDb = global as unknown as { db: mysql.Pool }

export const db =
  globalForDb.db ??
  mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'homelink',
    waitForConnections: true,
    connectionLimit: 10,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.db = db
