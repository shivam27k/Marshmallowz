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

    const result = await db.execute(
      "SELECT DISTINCT category FROM products ORDER BY category ASC"
    );

    const categories = result.rows
      .map((row) => row.category as string)
      .filter((cat) => cat && cat.trim() !== ""); // Filter out empty categories

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
