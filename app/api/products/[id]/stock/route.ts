import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Quick stock update (add/remove)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { adjustment, type } = await request.json();

    if (typeof adjustment !== "number" || adjustment <= 0) {
      return NextResponse.json({ error: "Invalid adjustment" }, { status: 400 });
    }

    // Get current stock
    const product = await db.execute({
      sql: "SELECT quantity_in_hand FROM products WHERE id = ?",
      args: [parseInt(id)],
    });

    if (product.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentStock = product.rows[0].quantity_in_hand as number;
    let newStock: number;

    if (type === "add") {
      newStock = currentStock + adjustment;
    } else if (type === "remove") {
      newStock = Math.max(0, currentStock - adjustment);
    } else if (type === "set") {
      newStock = adjustment;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    await db.execute({
      sql: "UPDATE products SET quantity_in_hand = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [newStock, parseInt(id)],
    });

    return NextResponse.json({ success: true, newStock });
  } catch (error) {
    console.error("Stock update error:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
