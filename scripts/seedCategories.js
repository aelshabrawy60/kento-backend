require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const oldCategoryNames = [
  "Portrait Photography", "Wedding Photography", "Landscape Photography", 
  "Fashion Photography", "Wildlife Photography", "Event Photography", 
  "Fine Art Photography", "Street Photography", "Sports Photography", 
  "Architectural Photography", "Commercial Photography", "Macro Photography", 
  "Food Photography", "Real Estate Photography"
];

const categories = [
  { name: "Portrait", description: "Capturing the personality of a subject or group." },
  { name: "Wedding", description: "Specializing in photographing events and activities related to weddings." },
  { name: "Landscape", description: "Capturing spaces within the world, sometimes vast and unending, but other times microscopic." },
  { name: "Fashion", description: "Displaying clothing and other fashion items, often conducted for advertisements or fashion magazines." },
  { name: "Wildlife", description: "Documenting various forms of wildlife in their natural habitat." },
  { name: "Event", description: "Capturing guests and occurrences at events or occasions." },
  { name: "Fine Art", description: "Photography created in accordance with the vision of the artist as photographer." },
  { name: "Street", description: "Photography conducted for art or enquiry that features unmediated chance encounters and random incidents within public places." },
  { name: "Sports", description: "The genre of photography that covers all types of sports." },
  { name: "Architectural", description: "Photographing buildings and similar structures that are both aesthetically pleasing and accurate representations." },
  { name: "Commercial", description: "Photography used to sell or promote a product, service, or otherwise support a business." },
  { name: "Macro", description: "Extreme close-up photography, usually of very small subjects and living organisms." },
  { name: "Food", description: "A still life photography genre used to create attractive still life photographs of food." },
  { name: "Real Estate", description: "Producing photographs of properties that are for sale." }
];

async function main() {
  console.log("Cleaning up old categories...");
  const deleteResult = await prisma.category.deleteMany({
    where: { name: { in: oldCategoryNames } }
  });
  console.log(`🗑️ Deleted ${deleteResult.count} old categories.`);

  console.log("\nSeeding new categories...");
  let count = 0;
  for (const cat of categories) {
    const exists = await prisma.category.findUnique({ where: { name: cat.name } });
    if (!exists) {
      await prisma.category.create({
        data: cat
      });
      console.log(`✅ Created category: ${cat.name}`);
      count++;
    } else {
      console.log(`ℹ️ Category already exists: ${cat.name}`);
    }
  }
  console.log(`\n🎉 Seed completed! Added ${count} new categories.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
