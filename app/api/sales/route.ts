import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Initialize sales table
async function initSalesTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      platform TEXT DEFAULT 'stall',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
}

// GET sales with optional date filter
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initializeDatabase();
    await initSalesTable();

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const productId = searchParams.get("product_id");

    let sql = `
      SELECT s.*, p.description as product_name, p.category
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE 1=1
    `;
    const args: (string | number)[] = [];

    if (date) {
      sql += " AND DATE(s.created_at) = DATE(?)";
      args.push(date);
    }

    if (productId) {
      sql += " AND s.product_id = ?";
      args.push(parseInt(productId));
    }

    sql += " ORDER BY s.created_at DESC LIMIT 100";

    const result = await db.execute({ sql, args });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

// POST new sale
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initializeDatabase();
    await initSalesTable();

    const { product_id, quantity, unit_price, platform, notes } = await request.json();

    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid sale data" }, { status: 400 });
    }

    // Check stock
    const product = await db.execute({
      sql: "SELECT quantity_in_hand, selling_price FROM products WHERE id = ?",
      args: [product_id],
    });

    if (product.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentStock = product.rows[0].quantity_in_hand as number;
    if (currentStock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    const price = unit_price || product.rows[0].selling_price;
    const total = price * quantity;

    // Record sale
    await db.execute({
      sql: `INSERT INTO sales (product_id, quantity, unit_price, total_price, platform, notes)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [product_id, quantity, price, total, platform || "stall", notes || null],
    });

    // Update stock
    await db.execute({
      sql: "UPDATE products SET quantity_in_hand = quantity_in_hand - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [quantity, product_id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json({ error: "Failed to record sale" }, { status: 500 });
  }
}
