import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ProductInput } from "@/lib/types";

// GET all products
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initializeDatabase();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    let sql = "SELECT * FROM products WHERE 1=1";
    const args: (string | number)[] = [];

    if (search) {
      sql += " AND (description LIKE ? OR category LIKE ?)";
      args.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      sql += " AND category = ?";
      args.push(category);
    }

    sql += " ORDER BY sno ASC";

    const result = await db.execute({ sql, args });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initializeDatabase();

    const product: ProductInput = await request.json();

    const result = await db.execute({
      sql: `INSERT INTO products (
        sno, category, description, quantity_in_hand, cost, extra_expenses,
        advertisement, packaging, shipment, gst, return_rate, margin,
        amazon_commission, meesho_commission, flipkart_commission, instagram_commission,
        selling_price, sp_at_stall, stall_margin, actual_selling_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        product.sno,
        product.category,
        product.description,
        product.quantity_in_hand,
        product.cost,
        product.extra_expenses,
        product.advertisement,
        product.packaging,
        product.shipment,
        product.gst,
        product.return_rate,
        product.margin,
        product.amazon_commission,
        product.meesho_commission,
        product.flipkart_commission,
        product.instagram_commission,
        product.selling_price,
        product.sp_at_stall,
        product.stall_margin,
        product.actual_selling_price,
      ],
    });

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
