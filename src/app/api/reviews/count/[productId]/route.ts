// /src/app/api/reviews/count/[productId]/route.ts
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  // Await the params Promise in Next.js 15
  const { productId } = await params;

  try {
    const count = await prisma.review.count({
      where: { productId },
    });

    return new Response(JSON.stringify({ count }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error counting reviews:", error);
    return new Response(
      JSON.stringify({ error: "Failed to count reviews" }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}