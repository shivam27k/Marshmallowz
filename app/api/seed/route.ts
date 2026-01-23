import { NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { createDefaultAdmin } from "@/lib/auth";

const initialProducts = [
  { sno: 1, category: "Bows", description: "Multicolored 3 dots", quantity_in_hand: 12, cost: 28, extra_expenses: 8, advertisement: 1.4, packaging: 10, shipment: 80, gst: 1.4, return_rate: 2.8, margin: 8.4, amazon_commission: 3.92, meesho_commission: 0, flipkart_commission: 5.6, instagram_commission: 0, selling_price: 140, sp_at_stall: 47, stall_margin: 140, actual_selling_price: 179 },
  { sno: 2, category: "Bows", description: "Multicolored Polka Dot with lace", quantity_in_hand: 0, cost: 27, extra_expenses: 8, advertisement: 1.35, packaging: 10, shipment: 80, gst: 1.35, return_rate: 2.7, margin: 8.1, amazon_commission: 3.78, meesho_commission: 0, flipkart_commission: 5.4, instagram_commission: 0, selling_price: 148, sp_at_stall: 46, stall_margin: 135, actual_selling_price: 173 },
  { sno: 3, category: "Bows", description: "Solid multicolored with lace", quantity_in_hand: 0, cost: 27, extra_expenses: 8, advertisement: 1.35, packaging: 10, shipment: 80, gst: 1.35, return_rate: 2.7, margin: 8.1, amazon_commission: 3.78, meesho_commission: 0, flipkart_commission: 5.4, instagram_commission: 0, selling_price: 148, sp_at_stall: 46, stall_margin: 135, actual_selling_price: 173 },
  { sno: 4, category: "Bows", description: "Black & White; 2 colored with lace", quantity_in_hand: 0, cost: 27, extra_expenses: 8, advertisement: 1.35, packaging: 10, shipment: 80, gst: 1.35, return_rate: 2.7, margin: 8.1, amazon_commission: 3.78, meesho_commission: 0, flipkart_commission: 5.4, instagram_commission: 0, selling_price: 148, sp_at_stall: 46, stall_margin: 135, actual_selling_price: 173 },
  { sno: 5, category: "Bows", description: "Multi Colored Bow Rubber bands (will be sold in sets)", quantity_in_hand: 100, cost: 4, extra_expenses: 8, advertisement: 0.2, packaging: 10, shipment: 80, gst: 0.2, return_rate: 0.4, margin: 1.2, amazon_commission: 0.56, meesho_commission: 0, flipkart_commission: 0.8, instagram_commission: 0, selling_price: 106, sp_at_stall: 15, stall_margin: 16, actual_selling_price: 30 },
  { sno: 6, category: "Rubber Bands & Hair Ties", description: "Mogra Hair tie bun", quantity_in_hand: 12, cost: 8, extra_expenses: 8, advertisement: 0.4, packaging: 10, shipment: 80, gst: 0.4, return_rate: 0.8, margin: 2.4, amazon_commission: 1.12, meesho_commission: 0, flipkart_commission: 1.6, instagram_commission: 0, selling_price: 113, sp_at_stall: 20, stall_margin: 32, actual_selling_price: 50 },
  { sno: 7, category: "Rubber Bands & Hair Ties", description: "Beige Polka dot lace Scrunchy", quantity_in_hand: 30, cost: 24, extra_expenses: 8, advertisement: 1.2, packaging: 10, shipment: 80, gst: 1.2, return_rate: 2.4, margin: 7.2, amazon_commission: 3.36, meesho_commission: 0, flipkart_commission: 4.8, instagram_commission: 0, selling_price: 142, sp_at_stall: 42, stall_margin: 48, actual_selling_price: 83 },
  { sno: 8, category: "Rubber Bands & Hair Ties", description: "Multicolored floral white base scrunchy", quantity_in_hand: 30, cost: 40, extra_expenses: 8, advertisement: 2, packaging: 10, shipment: 80, gst: 2, return_rate: 4, margin: 12, amazon_commission: 5.6, meesho_commission: 0, flipkart_commission: 8, instagram_commission: 0, selling_price: 172, sp_at_stall: 63, stall_margin: 48, actual_selling_price: 99 },
  { sno: 9, category: "Rubber Bands & Hair Ties", description: "Multicolored black base stripes Scruncy", quantity_in_hand: 30, cost: 40, extra_expenses: 8, advertisement: 2, packaging: 10, shipment: 80, gst: 2, return_rate: 4, margin: 12, amazon_commission: 5.6, meesho_commission: 0, flipkart_commission: 8, instagram_commission: 0, selling_price: 172, sp_at_stall: 63, stall_margin: 48, actual_selling_price: 99 },
  { sno: 10, category: "Rubber Bands & Hair Ties", description: "Polka dot beige and black Scrunchy", quantity_in_hand: 30, cost: 40, extra_expenses: 8, advertisement: 2, packaging: 10, shipment: 80, gst: 2, return_rate: 4, margin: 12, amazon_commission: 5.6, meesho_commission: 0, flipkart_commission: 8, instagram_commission: 0, selling_price: 172, sp_at_stall: 63, stall_margin: 48, actual_selling_price: 99 },
  { sno: 11, category: "Rubber Bands & Hair Ties", description: "Black base check print Scrunchy", quantity_in_hand: 30, cost: 24, extra_expenses: 8, advertisement: 1.2, packaging: 10, shipment: 80, gst: 1.2, return_rate: 2.4, margin: 7.2, amazon_commission: 3.36, meesho_commission: 0, flipkart_commission: 4.8, instagram_commission: 0, selling_price: 142, sp_at_stall: 42, stall_margin: 48, actual_selling_price: 83 },
  { sno: 12, category: "Rubber Bands & Hair Ties", description: "(U) - Multicolored scrunchy set of 3", quantity_in_hand: 12, cost: 25, extra_expenses: 8, advertisement: 1.25, packaging: 10, shipment: 80, gst: 1.25, return_rate: 2.5, margin: 7.5, amazon_commission: 3.5, meesho_commission: 0, flipkart_commission: 5, instagram_commission: 0, selling_price: 144, sp_at_stall: 43, stall_margin: 63, actual_selling_price: 98 },
  { sno: 13, category: "Rubber Bands & Hair Ties", description: "(U) - Spiral Hair Tie set of 3", quantity_in_hand: 0, cost: 24, extra_expenses: 8, advertisement: 1.2, packaging: 10, shipment: 80, gst: 1.2, return_rate: 2.4, margin: 7.2, amazon_commission: 3.36, meesho_commission: 0, flipkart_commission: 4.8, instagram_commission: 0, selling_price: 142, sp_at_stall: 42, stall_margin: 36, actual_selling_price: 71 },
  { sno: 14, category: "Hair Clips", description: "Multicolored smallest clip set for kids", quantity_in_hand: 0, cost: 4, extra_expenses: 8, advertisement: 0.2, packaging: 10, shipment: 80, gst: 0.2, return_rate: 0.4, margin: 1.2, amazon_commission: 0.56, meesho_commission: 0, flipkart_commission: 0.8, instagram_commission: 0, selling_price: 106, sp_at_stall: 15, stall_margin: 6, actual_selling_price: 20 },
  { sno: 15, category: "Hair Clips", description: "Multicolored Tic Tac pins", quantity_in_hand: 0, cost: 25, extra_expenses: 8, advertisement: 1.25, packaging: 10, shipment: 80, gst: 1.25, return_rate: 2.5, margin: 7.5, amazon_commission: 3.5, meesho_commission: 0, flipkart_commission: 5, instagram_commission: 0, selling_price: 144, sp_at_stall: 43, stall_margin: 38, actual_selling_price: 73 },
  { sno: 16, category: "Hair Clips", description: "Multicolored Tic Tac Star shaped pins", quantity_in_hand: 0, cost: 25, extra_expenses: 8, advertisement: 1.25, packaging: 10, shipment: 80, gst: 1.25, return_rate: 2.5, margin: 7.5, amazon_commission: 3.5, meesho_commission: 0, flipkart_commission: 5, instagram_commission: 0, selling_price: 144, sp_at_stall: 43, stall_margin: 38, actual_selling_price: 73 },
  { sno: 17, category: "Hair Clips", description: "Multicolored Sparkle Bobby pin box", quantity_in_hand: 12, cost: 11, extra_expenses: 8, advertisement: 0.55, packaging: 10, shipment: 80, gst: 0.55, return_rate: 1.1, margin: 3.3, amazon_commission: 1.54, meesho_commission: 0, flipkart_commission: 2.2, instagram_commission: 0, selling_price: 119, sp_at_stall: 24, stall_margin: 17, actual_selling_price: 37 },
  { sno: 18, category: "Hair Clips", description: "Rubber Flower shaped multi colored hair pins", quantity_in_hand: 0, cost: 10, extra_expenses: 8, advertisement: 0.5, packaging: 10, shipment: 80, gst: 0.5, return_rate: 1, margin: 3, amazon_commission: 1.4, meesho_commission: 0, flipkart_commission: 2, instagram_commission: 0, selling_price: 117, sp_at_stall: 23, stall_margin: 15, actual_selling_price: 35 },
  { sno: 19, category: "Hair Clips", description: "Multicolored Shiny plastic flower shaped hair pins", quantity_in_hand: 12, cost: 13, extra_expenses: 8, advertisement: 0.65, packaging: 10, shipment: 80, gst: 0.65, return_rate: 1.3, margin: 3.9, amazon_commission: 1.82, meesho_commission: 0, flipkart_commission: 2.6, instagram_commission: 0, selling_price: 122, sp_at_stall: 27, stall_margin: 20, actual_selling_price: 42 },
  { sno: 20, category: "Hair Clips", description: "Pink Base hair clips", quantity_in_hand: 12, cost: 13, extra_expenses: 8, advertisement: 0.65, packaging: 10, shipment: 80, gst: 0.65, return_rate: 1.3, margin: 3.9, amazon_commission: 1.82, meesho_commission: 0, flipkart_commission: 2.6, instagram_commission: 0, selling_price: 122, sp_at_stall: 27, stall_margin: 20, actual_selling_price: 42 },
  { sno: 21, category: "Hair Clips", description: "(U) - Sparkle Bow Hair Clips", quantity_in_hand: 0, cost: 27, extra_expenses: 8, advertisement: 1.35, packaging: 10, shipment: 80, gst: 1.35, return_rate: 2.7, margin: 8.1, amazon_commission: 3.78, meesho_commission: 0, flipkart_commission: 5.4, instagram_commission: 0, selling_price: 148, sp_at_stall: 46, stall_margin: 41, actual_selling_price: 78 },
  { sno: 22, category: "Hair Clips", description: "(U) - Heart Hair Clip", quantity_in_hand: 12, cost: 10, extra_expenses: 8, advertisement: 0.5, packaging: 10, shipment: 80, gst: 0.5, return_rate: 1, margin: 3, amazon_commission: 1.4, meesho_commission: 0, flipkart_commission: 2, instagram_commission: 0, selling_price: 117, sp_at_stall: 23, stall_margin: 15, actual_selling_price: 35 },
  { sno: 23, category: "Hair Clips", description: "(U) - Flower Multicolored Hair Clip", quantity_in_hand: 12, cost: 11, extra_expenses: 8, advertisement: 0.55, packaging: 10, shipment: 80, gst: 0.55, return_rate: 1.1, margin: 3.3, amazon_commission: 1.54, meesho_commission: 0, flipkart_commission: 2.2, instagram_commission: 0, selling_price: 119, sp_at_stall: 24, stall_margin: 17, actual_selling_price: 37 },
  { sno: 24, category: "Clutchers", description: "Kids Multicolored clutcher set", quantity_in_hand: 5, cost: 60, extra_expenses: 8, advertisement: 3, packaging: 10, shipment: 80, gst: 3, return_rate: 6, margin: 18, amazon_commission: 8.4, meesho_commission: 0, flipkart_commission: 12, instagram_commission: 0, selling_price: 209, sp_at_stall: 90, stall_margin: 90, actual_selling_price: 162 },
  { sno: 25, category: "Clutchers", description: "Pack of 100 Small Clutchers", quantity_in_hand: 100, cost: 1, extra_expenses: 8, advertisement: 0.05, packaging: 10, shipment: 80, gst: 0.05, return_rate: 0.1, margin: 0.3, amazon_commission: 0.14, meesho_commission: 0, flipkart_commission: 0.2, instagram_commission: 0, selling_price: 100, sp_at_stall: 11, stall_margin: 2, actual_selling_price: 12 },
  { sno: 26, category: "Clutchers", description: "Multicolored metal flower clutcher", quantity_in_hand: 12, cost: 14, extra_expenses: 8, advertisement: 0.7, packaging: 10, shipment: 80, gst: 0.7, return_rate: 1.4, margin: 4.2, amazon_commission: 1.96, meesho_commission: 0, flipkart_commission: 2.8, instagram_commission: 0, selling_price: 124, sp_at_stall: 28, stall_margin: 21, actual_selling_price: 45 },
  { sno: 27, category: "Clutchers", description: "Multicolored two flower plastic clutcher", quantity_in_hand: 12, cost: 17, extra_expenses: 8, advertisement: 0.85, packaging: 10, shipment: 80, gst: 0.85, return_rate: 1.7, margin: 5.1, amazon_commission: 2.38, meesho_commission: 0, flipkart_commission: 3.4, instagram_commission: 0, selling_price: 130, sp_at_stall: 32, stall_margin: 26, actual_selling_price: 53 },
  { sno: 28, category: "Clutchers", description: "Multicolored single flower Plastic clutcher", quantity_in_hand: 12, cost: 17, extra_expenses: 8, advertisement: 0.85, packaging: 10, shipment: 80, gst: 0.85, return_rate: 1.7, margin: 5.1, amazon_commission: 2.38, meesho_commission: 0, flipkart_commission: 3.4, instagram_commission: 0, selling_price: 130, sp_at_stall: 32, stall_margin: 26, actual_selling_price: 53 },
  { sno: 29, category: "Clutchers", description: "Butter fly clutcher - Set of 2", quantity_in_hand: 12, cost: 10, extra_expenses: 8, advertisement: 0.5, packaging: 10, shipment: 80, gst: 0.5, return_rate: 1, margin: 3, amazon_commission: 1.4, meesho_commission: 0, flipkart_commission: 2, instagram_commission: 0, selling_price: 117, sp_at_stall: 23, stall_margin: 15, actual_selling_price: 35 },
  { sno: 30, category: "Clutchers", description: "High Quality Single flower Plastic Clutcher", quantity_in_hand: 6, cost: 64, extra_expenses: 8, advertisement: 3.2, packaging: 10, shipment: 80, gst: 3.2, return_rate: 6.4, margin: 19.2, amazon_commission: 8.96, meesho_commission: 0, flipkart_commission: 12.8, instagram_commission: 0, selling_price: 216, sp_at_stall: 96, stall_margin: 96, actual_selling_price: 173 },
  { sno: 31, category: "Clutchers", description: "(U) - Big Heart Multicolored clutcher", quantity_in_hand: 12, cost: 22, extra_expenses: 8, advertisement: 1.1, packaging: 10, shipment: 80, gst: 1.1, return_rate: 2.2, margin: 6.6, amazon_commission: 3.08, meesho_commission: 0, flipkart_commission: 4.4, instagram_commission: 0, selling_price: 139, sp_at_stall: 39, stall_margin: 33, actual_selling_price: 65 },
  { sno: 32, category: "Clutchers", description: "(U) - Butter fly multicolored clutcher", quantity_in_hand: 12, cost: 12, extra_expenses: 8, advertisement: 0.6, packaging: 10, shipment: 80, gst: 0.6, return_rate: 1.2, margin: 3.6, amazon_commission: 1.68, meesho_commission: 0, flipkart_commission: 2.4, instagram_commission: 0, selling_price: 120, sp_at_stall: 26, stall_margin: 18, actual_selling_price: 40 },
  { sno: 33, category: "Other Accessories", description: "Nail Cutter", quantity_in_hand: 8, cost: 27, extra_expenses: 8, advertisement: 1.35, packaging: 10, shipment: 80, gst: 1.35, return_rate: 2.7, margin: 8.1, amazon_commission: 3.78, meesho_commission: 0, flipkart_commission: 5.4, instagram_commission: 0, selling_price: 148, sp_at_stall: 46, stall_margin: 41, actual_selling_price: 78 },
  { sno: 34, category: "Other Accessories", description: "Tic Tac Toe Key Ring", quantity_in_hand: 12, cost: 17, extra_expenses: 8, advertisement: 0.85, packaging: 10, shipment: 80, gst: 0.85, return_rate: 1.7, margin: 5.1, amazon_commission: 2.38, meesho_commission: 0, flipkart_commission: 3.4, instagram_commission: 0, selling_price: 130, sp_at_stall: 32, stall_margin: 26, actual_selling_price: 53 },
  { sno: 35, category: "Other Accessories", description: "Mirrors", quantity_in_hand: 5, cost: 88, extra_expenses: 8, advertisement: 4.4, packaging: 10, shipment: 80, gst: 4.4, return_rate: 8.8, margin: 26.4, amazon_commission: 12.32, meesho_commission: 0, flipkart_commission: 17.6, instagram_commission: 0, selling_price: 260, sp_at_stall: 128, stall_margin: 132, actual_selling_price: 234 },
];

export async function POST() {
  try {
    await initializeDatabase();
    await createDefaultAdmin();

    // Check if products already exist
    const existing = await db.execute("SELECT COUNT(*) as count FROM products");
    const count = existing.rows[0].count as number;

    if (count > 0) {
      return NextResponse.json({ message: "Database already seeded", count });
    }

    // Insert all products
    for (const product of initialProducts) {
      await db.execute({
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
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${initialProducts.length} products`,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
