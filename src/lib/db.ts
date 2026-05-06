import mysql from 'mysql2/promise'

export const db = mysql.createPool(process.env.DATABASE_URL!)