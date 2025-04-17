// fetchData.ts
import { db } from "@/server/db";
async function fetchData() {
    const data = await db.gym_occupancy.findMany({
        orderBy: { timestamp: 'asc' }
    });

    // Save to JSON for Python
    const fs = require('fs');
    fs.writeFileSync('data.json', JSON.stringify(data));
}

fetchData();
