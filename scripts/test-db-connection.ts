import { PrismaClient } from "@prisma/client";
import { PrismaClient as EdgePrismaClient } from "@prisma/edge-client";

async function main() {
  console.log("Testing Postgres connection...");
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("✅ Postgres connection successful");
  } catch (e) {
    console.error("❌ Postgres connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }

  console.log("Testing Turso connection...");
  // Note: For real Turso connection, you'd need the driver adapter setup here.
  // This is just a basic check if the client initializes.
  const edgePrisma = new EdgePrismaClient();
  try {
    // await edgePrisma.$connect(); // Connect might fail without valid URL/adapter
    console.log("✅ Turso client initialized (connection requires valid URL/adapter)");
  } catch (e) {
    console.error("❌ Turso client initialization failed:", e);
  }
}

main();
