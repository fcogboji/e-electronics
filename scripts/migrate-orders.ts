// scripts/migrate-orders.ts
import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const prisma = new PrismaClient();

// Define the Order type based on what we're selecting
interface OrderSelect {
  id: string;
  email: string | null;
  createdAt: Date;
  customerName: string | null;
}

// Define the verification order type
interface VerifyOrder {
  id: string;
  email: string | null;
  userId: string | null;
  createdAt: Date;
}

async function migrateOrders() {
  try {
    console.log('🔄 Starting order migration...\n');

    const ordersWithoutUserId = await prisma.order.findMany({
      where: {
        userId: null,
        email: { not: '' }
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        customerName: true,
      }
    });

    console.log(`📊 Found ${ordersWithoutUserId.length} orders without userId but with email`);

    if (ordersWithoutUserId.length === 0) {
      console.log('✅ No orders need migration');
      return;
    }

    // Fix the reduce function with proper typing
    const emailGroups = ordersWithoutUserId.reduce((acc: Record<string, OrderSelect[]>, order: OrderSelect) => {
      const email = order.email!;
      if (!acc[email]) acc[email] = [];
      acc[email].push(order);
      return acc;
    }, {});

    console.log('\n📧 Orders grouped by email:');
    for (const [email, orders] of Object.entries(emailGroups)) {
      console.log(`  ${email}: ${(orders as OrderSelect[]).length} orders`);
    }

    const CURRENT_USER_ID = 'user_2x0gPgC8cciYAs98eX15bwdTWne'; // Updated to match API query
    const CURRENT_USER_EMAIL = 'friday.ogboji100@gmail.com';

    console.log(`\n🎯 Migrating orders for ${CURRENT_USER_EMAIL} to userId: ${CURRENT_USER_ID}`);

    const ordersToMigrate = ordersWithoutUserId.filter((order: OrderSelect) => order.email === CURRENT_USER_EMAIL);

    if (ordersToMigrate.length === 0) {
      console.log('❌ No orders found for the specified email');
      return;
    }

    console.log(`📦 Found ${ordersToMigrate.length} orders to migrate:`);
    ordersToMigrate.forEach((order: OrderSelect) => {
      console.log(`  - Order ${order.id} (${order.createdAt.toISOString()})`);
    });

    console.log('\n⚠️  This will update the orders to link them to the user account.');
    console.log('   Make sure this is correct before proceeding.\n');

    const result = await prisma.order.updateMany({
      where: {
        userId: null,
        email: CURRENT_USER_EMAIL,
      },
      data: {
        userId: CURRENT_USER_ID,
      },
    });

    console.log(`✅ Migration completed! Updated ${result.count} orders`);

    const verifyOrders: VerifyOrder[] = await prisma.order.findMany({
      where: { userId: CURRENT_USER_ID },
      select: {
        id: true,
        email: true,
        userId: true,
        createdAt: true,
      },
    });

    console.log(`\n🔍 Verification - Orders now linked to ${CURRENT_USER_ID}:`);
    verifyOrders.forEach((order: VerifyOrder) => {
      console.log(`  ✅ ${order.id} - ${order.email} - ${order.createdAt.toISOString()}`);
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateOrders();