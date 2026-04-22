import * as dotenv from "dotenv";
dotenv.config();

import { prisma } from "../lib/prisma";
import {
  TEAM_CULTURE_DEFAULT_IDENTITY,
  TEAM_CULTURE_VALUES_FULL,
} from "../lib/data/team-culture-values-full";

const SEED_DATA = {
  ...TEAM_CULTURE_DEFAULT_IDENTITY,
  values: TEAM_CULTURE_VALUES_FULL,
};

async function main() {
  console.log("Checking for existing team culture record...");
  const existing = await prisma.teamCulture.findFirst();

  if (existing) {
    console.log("Updating existing team culture record...");
    await prisma.teamCulture.update({
      where: { id: existing.id },
      data: {
        purpose: SEED_DATA.purpose,
        vision: SEED_DATA.vision,
        mission: SEED_DATA.mission,
        values: SEED_DATA.values,
      },
    });
    console.log("Successfully updated team culture.");
  } else {
    console.log("Creating new team culture record...");
    await prisma.teamCulture.create({
      data: {
        purpose: SEED_DATA.purpose,
        vision: SEED_DATA.vision,
        mission: SEED_DATA.mission,
        values: SEED_DATA.values,
      },
    });
    console.log("Successfully created team culture.");
  }
}

main()
  .catch((e) => {
    console.error("Error seeding culture:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
