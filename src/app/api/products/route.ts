// src/app/api/products/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (userId !== process.env.NEXT_PUBLIC_ADMIN_ID) {
      console.error('❌ Unauthorized user:', userId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

   const product = await prisma.product.create({
  data: {
    name: body.name,
    image: body.image,
    description: body.description,
    price: body.price,
    stock: body.stock,
    category: body.category,
    discount: body.discount ?? 0,   // ✅ Optional safety
    brand: body.brand ?? 'Generic', // ✅ FIX: Required field with fallback
  },
});


    return NextResponse.json(product);
  } catch (error) {
    console.error('❌ API Error:', error); // 👈 Log the actual error
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}
