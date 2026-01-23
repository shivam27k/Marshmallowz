import { NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initializeDatabase();

    // Get product stats
    const products = await db.execute(`
      SELECT
        COUNT(*) as total_products,
        SUM(quantity_in_hand) as total_items,
        SUM(cost * quantity_in_hand) as inventory_value,
        SUM(CASE WHEN quantity_in_hand < 10 THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN quantity_in_hand = 0 THEN 1 ELSE 0 END) as out_of_stock_count
      FROM products
    `);

    // Get today's sales
    const todaySales = await db.execute(`
      SELECT
        COALESCE(SUM(quantity), 0) as items_sold,
        COALESCE(SUM(total_price), 0) as revenue
      FROM sales
      WHERE DATE(created_at) = DATE('now')
    `);

    // Get this week's sales
    const weekSales = await db.execute(`
      SELECT
        COALESCE(SUM(quantity), 0) as items_sold,
        COALESCE(SUM(total_price), 0) as revenue
      FROM sales
      WHERE created_at >= DATE('now', '-7 days')
    `);

    // Get low stock products
    const lowStock = await db.execute(`
      SELECT id, description, category, quantity_in_hand, cost
      FROM products
      WHERE quantity_in_hand < 10
      ORDER BY quantity_in_hand ASC
      LIMIT 10
    `);

    // Get recent sales
    const recentSales = await db.execute(`
      SELECT s.*, p.description as product_name, p.category
      FROM sales s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    // Get top selling products (last 30 days)
    const topSelling = await db.execute(`
      SELECT p.id, p.description, p.category, SUM(s.quantity) as total_sold
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.created_at >= DATE('now', '-30 days')
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    return NextResponse.json({
      products: products.rows[0],
      today: todaySales.rows[0],
      week: weekSales.rows[0],
      lowStock: lowStock.rows,
      recentSales: recentSales.rows,
      topSelling: topSelling.rows,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
