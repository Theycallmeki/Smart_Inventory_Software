const sequelize = require('./db');
const SalesHistory = require('./models/salesHistory');

async function seedDummySales() {
  await sequelize.sync();

  const itemId = 14;
  const baseQuantity = 20; // base monthly quantity
  const years = [2023, 2024, 2025];
  const dummySales = [];

  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      const paddedMonth = String(month).padStart(2, '0');
      const date = `${year}-${paddedMonth}-01`;

      // Optional: Create some basic seasonality
      let quantitySold = baseQuantity + Math.floor(Math.random() * 10); // add some randomness

      // Simulate seasonal boost in December
      if (month === 12) quantitySold += 30;

      // Simulate higher sales in July and October
      if (month === 7 || month === 10) quantitySold += 50;

      dummySales.push({ itemId, date, quantitySold });
    }
  }

  await SalesHistory.bulkCreate(dummySales);
  console.log(`✅ Seeded dummy sales data for itemId ${itemId} from 2023 to 2025`);
}

seedDummySales().then(() => process.exit());
