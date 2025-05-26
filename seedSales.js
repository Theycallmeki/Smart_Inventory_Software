const sequelize = require('./db');
const SalesHistory = require('./models/salesHistory');

async function seedDummySales() {
  await sequelize.sync();

  const dummySales = [
    { itemId: 2, date: '2024-11-01', quantitySold: 5 },
    { itemId: 2, date: '2024-12-01', quantitySold: 8 },
    { itemId: 2, date: '2025-01-01', quantitySold: 7 },
    { itemId: 2, date: '2025-01-31', quantitySold: 3 },
    { itemId: 2, date: '2025-02-15', quantitySold: 9 },
    { itemId: 2, date: '2025-03-02', quantitySold: 6 },
    { itemId: 2, date: '2025-04-01', quantitySold: 2 },
    { itemId: 2, date: '2025-04-25', quantitySold: 1 },
    { itemId: 2, date: '2025-05-01', quantitySold: 4 },
    { itemId: 2, date: '2025-05-31', quantitySold: 7 },
    { itemId: 2, date: '2025-06-10', quantitySold: 3 },
    { itemId: 2, date: '2025-07-01', quantitySold: 5 },
    { itemId: 2, date: '2025-08-01', quantitySold: 9 },
  ];

  for (const sale of dummySales) {
    await SalesHistory.create(sale);
  }

  console.log('✅ Dummy sales for itemId 2 seeded');
}

seedDummySales().then(() => process.exit());
