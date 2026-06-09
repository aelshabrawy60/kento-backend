require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@kentograph.com";
  const password = "Admin@1234";
  const name = "Admin";

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log("✅ Admin already exists:", email);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created!");
  console.log("   Email   :", user.email);
  console.log("   Password:", password);
  console.log("   ID      :", user.id);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
