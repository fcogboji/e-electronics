import { PrismaClient } from '../src/generated/prisma';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function fixProductImages() {
  console.log('Starting image fix...\n');

  // 1. Fix double /images/ prefix in ProductImage table
  const allImages = await prisma.productImage.findMany();

  for (const image of allImages) {
    if (image.imageUrl.includes('/images//images/')) {
      const correctedUrl = image.imageUrl.replace('/images//images/', '/images/');
      await prisma.productImage.update({
        where: { id: image.id },
        data: { imageUrl: correctedUrl }
      });
      console.log(`Fixed: ${image.imageUrl} -> ${correctedUrl}`);
    }
  }

  // 2. Check which images are missing and create placeholders
  const publicImagesDir = path.join(__dirname, '..', 'public', 'images');
  const updatedImages = await prisma.productImage.findMany();
  const uniqueImagePaths = [...new Set(updatedImages.map(i => i.imageUrl))];

  const missingImages: string[] = [];
  const existingImages: string[] = [];

  for (const imagePath of uniqueImagePaths) {
    const filename = imagePath.replace('/images/', '');
    const fullPath = path.join(publicImagesDir, filename);

    if (!fs.existsSync(fullPath)) {
      missingImages.push(filename);

      // Try to find a base image (without color suffix)
      const baseFilename = filename.replace(/[a-z]+\.(jpg|png)$/i, '.jpg');
      const basePath = path.join(publicImagesDir, baseFilename);

      // Also try removing color suffixes like 'b', 'grey', 's'
      const withoutColorSuffix = filename.replace(/(b|grey|s)\.(jpg|png)$/i, '.$2');
      const withoutColorPath = path.join(publicImagesDir, withoutColorSuffix);

      if (fs.existsSync(basePath)) {
        fs.copyFileSync(basePath, fullPath);
        console.log(`Created: ${filename} (copied from ${baseFilename})`);
      } else if (fs.existsSync(withoutColorPath)) {
        fs.copyFileSync(withoutColorPath, fullPath);
        console.log(`Created: ${filename} (copied from ${withoutColorSuffix})`);
      } else {
        // Look for any similar image
        const baseName = filename.replace(/(b|grey|s|black|white|silver)\.(jpg|png)$/i, '');
        const files = fs.readdirSync(publicImagesDir);
        const similarFile = files.find(f =>
          f.toLowerCase().includes(baseName.toLowerCase().slice(0, -1))
        );

        if (similarFile) {
          const similarPath = path.join(publicImagesDir, similarFile);
          fs.copyFileSync(similarPath, fullPath);
          console.log(`Created: ${filename} (copied from similar: ${similarFile})`);
        } else {
          console.warn(`⚠️  Missing: ${filename} (no base image found)`);
        }
      }
    } else {
      existingImages.push(filename);
    }
  }

  console.log(`\n✅ Fixed ${allImages.filter(i => i.imageUrl.includes('/images//images/')).length} double-prefix issues`);
  console.log(`✅ ${existingImages.length} images already exist`);
  console.log(`⚠️  ${missingImages.length} images were missing (attempted to create)`);

  await prisma.$disconnect();
}

fixProductImages().catch(console.error);
