import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ProductInput } from "@/lib/types";

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await db.execute({
      sql: "SELECT * FROM products WHERE id = ?",
      args: [parseInt(id)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const product: ProductInput = await request.json();

    await db.execute({
      sql: `UPDATE products SET
        sno = ?, category = ?, description = ?, quantity_in_hand = ?,
        cost = ?, extra_expenses = ?, advertisement = ?, packaging = ?,
        shipment = ?, gst = ?, return_rate = ?, margin = ?,
        amazon_commission = ?, meesho_commission = ?, flipkart_commission = ?,
        instagram_commission = ?, selling_price = ?, sp_at_stall = ?,
        stall_margin = ?, actual_selling_price = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
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
        parseInt(id),
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);

    // Delete related sales records first (cascade)
    await db.execute({
      sql: "DELETE FROM sales WHERE product_id = ?",
      args: [productId],
    });

    // Now delete the product
    await db.execute({
      sql: "DELETE FROM products WHERE id = ?",
      args: [productId],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
