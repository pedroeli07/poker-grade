import { sharkScopeGet } from "@/lib/utils";

async function main() {
  const path = `/networks/PlayerGroup/players/Fabiano%20CL%202022/statistics/Count,EarlyFinish,LateFinish,AvROI?filter=Class:SCHEDULED;Date:30D`;
  console.log("Fetching:", path);
  try {
    const raw = await sharkScopeGet(path);
    console.log(JSON.stringify(raw, null, 2));
  } catch(e) {
    console.error(e);
  }
}

main();
