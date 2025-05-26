const sequelize = require('./db');
const SalesHistory = require('./models/salesHistory');

async function seedDummySales() {
  await sequelize.sync();

  const dummySales = [
    { itemId: 2, date: '2025-01-01', quantitySold: 10 },
    { itemId: 2, date: '2025-02-01', quantitySold: 12 },
    { itemId: 2, date: '2025-03-01', quantitySold: 15 },
    { itemId: 2, date: '2025-04-01', quantitySold: 14 },
    { itemId: 2, date: '2025-05-01', quantitySold: 18 },
    { itemId: 2, date: '2025-06-01', quantitySold: 20 },
    { itemId: 2, date: '2025-07-01', quantitySold: 22 },
    { itemId: 2, date: '2025-08-01', quantitySold: 24 },
    { itemId: 2, date: '2025-09-01', quantitySold: 23 },
    { itemId: 2, date: '2025-10-01', quantitySold: 25 },
    { itemId: 2, date: '2025-11-01', quantitySold: 27 },
    { itemId: 2, date: '2025-12-01', quantitySold: 30 },
  ];

  for (const sale of dummySales) {
    await SalesHistory.create(sale);
  }

  console.log('✅ Dummy sales for itemId 2 seeded with a clear upward trend and mild seasonality');
}

seedDummySales().then(() => process.exit());
