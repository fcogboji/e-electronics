import { prisma } from "@/lib/prisma"; // or "@/lib/db" if that’s your setup

// ✅ Brand-based products (no category include)
export async function getProductsByBrand(brand: string) {
  if (!brand) return [];

  return await prisma.product.findMany({
    where: {
      brand: {
        equals: brand,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    // Removed 'include: { category: true }' because category is just a string
  });
}

// ✅ Category-based products
export async function getProductsByCategory(category: string) {
  if (!category) return [];

  return await prisma.product.findMany({
    where: {
      category: {
        equals: category,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
