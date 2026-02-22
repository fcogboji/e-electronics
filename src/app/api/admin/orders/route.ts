import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export async function PATCH(req: NextRequest) {
  try {
    // Verify admin authentication
    const { userId } = await auth();
    if (!userId || userId !== ADMIN_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return new NextResponse('Missing orderId or status', { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Create status history record
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        oldStatus: updatedOrder.status,
        newStatus: status,
        changedBy: 'admin',
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Verify admin authentication
  const { userId } = await auth();
  if (!userId || userId !== ADMIN_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  // Extract pagination values
  let page = parseInt(searchParams.get('page') || '1', 10);
  let limit = parseInt(searchParams.get('limit') || '10', 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;
  const skip = (page - 1) * limit;

  // Extract filters
  const statusFilter = searchParams.get('status');
  const searchTerm = searchParams.get('search');
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  try {
    const where: any = {};

    // Filter by status if not "all"
    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter;
    }

    // Filter by search term
    if (searchTerm) {
      where.OR = [
        { id: { contains: searchTerm, mode: 'insensitive' } },
        { customerName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Filter by createdAt date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Fetch matching orders and count
    const [ordersRaw, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Get all unique product IDs
    const productIds = [...new Set(ordersRaw.flatMap(order =>
      order.orderItems.map(item => item.productId)
    ))];

    // Fetch products for all order items
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        brand: true,
        category: true,
      }
    });

    // Create product lookup map
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<string, any>);

    // Format orders for frontend
    const orders = ordersRaw.map((order) => {
      const calculatedTotal = order.orderItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);

      return {
        id: order.id,
        amount: order.amount || calculatedTotal,
        total: order.amount || calculatedTotal,
        status: order.status,
        customerName:
          order.customerName || order.user?.email?.split('@')[0] || 'Guest',
        email: order.email || order.user?.email || '',
        phone: order.phone || '',
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: productMap[item.productId]?.name || 'Product Not Found',
          price: item.price,
          quantity: item.quantity,
          condition: item.condition,
          storage: item.storage,
          simType: item.simType,
          color: item.color,
        })),
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        city: order.city,
        state: order.state,
        postalCode: order.postalCode,
        country: order.country,
        trackingId: order.trackingId,
        deliveryEta: order.deliveryEta,
        adminNote: order.adminNote,
      };
    });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
