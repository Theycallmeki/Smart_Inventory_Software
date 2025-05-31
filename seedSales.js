const sequelize = require('./db');
const SalesHistory = require('./models/salesHistory');

async function seedDummySales() {
  try {
    await sequelize.sync();

    // All IDs except 2
    const itemIds = [
      3, 4, 5, 6, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
      29, 30, 31, 32, 33, 34
    ];

    const baseQuantity = 20;
    const years = [2023, 2024, 2025];
    const dummySales = [];

    for (const itemId of itemIds) {
      for (const year of years) {
        for (let month = 1; month <= 12; month++) {
          const paddedMonth = String(month).padStart(2, '0');
          const date = `${year}-${paddedMonth}-01`;

          let quantitySold = baseQuantity + Math.floor(Math.random() * 10);

          // Seasonal boosts
          if (month === 12) quantitySold += 30;
          if (month === 7 || month === 10) quantitySold += 50;

          // Slight variation by item
          quantitySold += Math.floor(Math.random() * 5 * itemIds.indexOf(itemId));

          dummySales.push({ itemId, date, quantitySold });
        }
      }
    }

    await SalesHistory.bulkCreate(dummySales);
    console.log(`✅ Seeded dummy sales data for itemIds except 2 from 2023 to 2025`);
  } catch (error) {
    console.error('Error seeding dummy sales:', error);
  } finally {
    await sequelize.close();
  }
}

seedDummySales();
