import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize database tables
export async function initializeDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sno INTEGER,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity_in_hand INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      extra_expenses REAL DEFAULT 0,
      advertisement REAL DEFAULT 0,
      packaging REAL DEFAULT 0,
      shipment REAL DEFAULT 0,
      gst REAL DEFAULT 0,
      return_rate REAL DEFAULT 0,
      margin REAL DEFAULT 0,
      amazon_commission REAL DEFAULT 0,
      meesho_commission REAL DEFAULT 0,
      flipkart_commission REAL DEFAULT 0,
      instagram_commission REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      sp_at_stall REAL DEFAULT 0,
      stall_margin REAL DEFAULT 0,
      actual_selling_price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
