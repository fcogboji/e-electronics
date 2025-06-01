// src/pages/api/cancel-order.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // adjust path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "Cancelled" },
    });

    return res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}