// ============================================
// LIFE'S — Conexión MySQL
// ============================================
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'lifes_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
});

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL conectado correctamente');
    conn.release();
  } catch (err) {
    console.error('❌ Error conectando a MySQL:', err);
    process.exit(1);
  }
}

export default pool;
