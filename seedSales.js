const sequelize = require('./db');
const SalesHistory = require('./models/salesHistory');

async function seedDummySales() {
  try {
    await sequelize.sync();

    // Use all available itemIds except 2
    const itemIds = [
      5,6,7
    ];

    const dummySales = [];
    const usedCombinations = new Set();

    while (dummySales.length < 100) {
      const itemId = itemIds[Math.floor(Math.random() * itemIds.length)];
      const year = 2023 + Math.floor(Math.random() * 3); // 2023–2025
      const month = 1 + Math.floor(Math.random() * 12);
      const paddedMonth = String(month).padStart(2, '0');
      const date = `${year}-${paddedMonth}-01`;

      const key = `${itemId}-${date}`;
      if (usedCombinations.has(key)) continue;
      usedCombinations.add(key);

      let quantitySold = 10 + Math.floor(Math.random() * 100); // Range: 10–109

      dummySales.push({ itemId, date, quantitySold });
    }

    await SalesHistory.bulkCreate(dummySales);
    console.log('✅ Seeded 100 dummy sales records.');
  } catch (error) {
    console.error('❌ Error seeding dummy sales:', error);
  } finally {
    await sequelize.close();
  }
}

seedDummySales();
