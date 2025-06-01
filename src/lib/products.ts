import { prisma } from "@/lib/prisma"; // or "@/lib/db" based on your file

export async function getProductsByBrand(brand: string) {
  return await prisma.product.findMany({
    where: {
      brand: {
        equals: brand,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
