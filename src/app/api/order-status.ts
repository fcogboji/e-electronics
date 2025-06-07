import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { orderId, email } = await req.json();
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get current user if logged in
    const user = await currentUser();
    
    // Build the where clause - user can access order if:
    // 1. They're logged in and it's their order (by userId or email)
    // 2. They provide the email associated with the order (for guest orders)
    const whereClause: any = {
      id: orderId,
    };

    if (user) {
      // If user is logged in, they can access orders by userId or email
      whereClause.OR = [
        { userId: user.id },
        { email: user.emailAddresses[0]?.emailAddress }
      ];
    } else if (email) {
      // If not logged in, they must provide email to access guest orders
      whereClause.email = email;
    } else {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }

    // Return order details
    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        city: order.city,
        state: order.state,
        items: order.orderItems.map(item => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET method for simple status checks
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get current user if logged in
    const user = await currentUser();
    
    const whereClause: any = {
      id: orderId,
    };

    if (user) {
      whereClause.OR = [
        { userId: user.id },
        { email: user.emailAddresses[0]?.emailAddress }
      ];
    } else if (email) {
      whereClause.email = email;
    } else {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      select: {
        id: true,
        status: true,
        amount: true,
        createdAt: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      createdAt: order.createdAt
    });

  } catch (error) {
    console.error("Error fetching order status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}