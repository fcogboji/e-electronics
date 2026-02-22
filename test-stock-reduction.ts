/**
 * Test Script: Stock Reduction Verification
 *
 * This script helps you verify stock reduction after payment
 *
 * Usage:
 * 1. Run before making a purchase: npx ts-node test-stock-reduction.ts before <productId>
 * 2. Make your test purchase
 * 3. Run after purchase: npx ts-node test-stock-reduction.ts after <productId> <expectedQuantityReduction>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      stock: true,
      updatedAt: true,
    },
  });

  if (!product) {
    console.error('❌ Product not found:', productId);
    return null;
  }

  console.log('📦 Product Stock Information:');
  console.log('─────────────────────────────');
  console.log('Product ID:', product.id);
  console.log('Product Name:', product.name);
  console.log('Current Stock:', product.stock);
  console.log('Last Updated:', product.updatedAt);
  console.log('─────────────────────────────');

  return product;
}

async function verifyReduction(
  productId: string,
  beforeStock: number,
  expectedReduction: number
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });

  if (!product) {
    console.error('❌ Product not found');
    return false;
  }

  const actualReduction = beforeStock - product.stock;
  const isCorrect = actualReduction === expectedReduction;

  console.log('\n🔍 Stock Reduction Verification:');
  console.log('─────────────────────────────');
  console.log('Before Stock:', beforeStock);
  console.log('Current Stock:', product.stock);
  console.log('Expected Reduction:', expectedReduction);
  console.log('Actual Reduction:', actualReduction);
  console.log('Status:', isCorrect ? '✅ CORRECT' : '❌ INCORRECT');
  console.log('─────────────────────────────');

  return isCorrect;
}

async function checkRecentOrders(productId: string) {
  const recentOrders = await prisma.orderItem.findMany({
    where: {
      productId: productId,
      order: {
        status: 'PAID',
      },
    },
    include: {
      order: {
        select: {
          id: true,
          createdAt: true,
          amount: true,
          status: true,
          paymentReference: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  console.log('\n📋 Recent Orders for this Product:');
  console.log('─────────────────────────────');
  if (recentOrders.length === 0) {
    console.log('No recent orders found');
  } else {
    recentOrders.forEach((item, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log('  Order ID:', item.order.id);
      console.log('  Quantity:', item.quantity);
      console.log('  Status:', item.order.status);
      console.log('  Reference:', item.order.paymentReference);
      console.log('  Created:', item.order.createdAt);
    });
  }
  console.log('─────────────────────────────');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const productId = args[1];

  if (!command || !productId) {
    console.log('Usage:');
    console.log('  Check stock: npx ts-node test-stock-reduction.ts check <productId>');
    console.log('  Verify reduction: npx ts-node test-stock-reduction.ts verify <productId> <beforeStock> <expectedReduction>');
    console.log('  Recent orders: npx ts-node test-stock-reduction.ts orders <productId>');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'check':
        await checkStock(productId);
        break;

      case 'verify':
        const beforeStock = parseInt(args[2]);
        const expectedReduction = parseInt(args[3]);
        if (isNaN(beforeStock) || isNaN(expectedReduction)) {
          console.error('❌ Invalid stock values');
          process.exit(1);
        }
        await verifyReduction(productId, beforeStock, expectedReduction);
        break;

      case 'orders':
        await checkStock(productId);
        await checkRecentOrders(productId);
        break;

      default:
        console.error('❌ Unknown command:', command);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
