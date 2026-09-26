const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("1. Enabling pg_trgm extension...");
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
  console.log("✓ pg_trgm extension enabled");

  console.log("2. Creating trgm index on Product(nama)...");
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS product_nama_trgm_idx 
    ON "Product" USING gin (nama gin_trgm_ops);
  `);
  console.log("✓ product_nama_trgm_idx created");

  console.log("3. Checking if Product(deskripsi) or ProductVariant(namaVarian) can be indexed...");
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS product_deskripsi_trgm_idx 
    ON "Product" USING gin (deskripsi gin_trgm_ops);
  `);
  console.log("✓ product_deskripsi_trgm_idx created");

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS productvariant_namavarian_trgm_idx 
    ON "ProductVariant" USING gin ("namaVarian" gin_trgm_ops);
  `);
  console.log("✓ productvariant_namavarian_trgm_idx created");

  // Test similarity query
  const testResults = await prisma.$queryRawUnsafe(`
    SELECT nama, similarity(nama, 'pulpn') as score
    FROM "Product"
    WHERE nama % 'pulpn' OR nama ILIKE '%pulpn%'
    ORDER BY score DESC
    LIMIT 5;
  `);
  console.log("Test similarity for 'pulpn':", testResults);
}

main()
  .catch((e) => {
    console.error("Error setting up pg_trgm:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
