// seedSalesForAI.js
const sequelize = require('./db');
const Item = require('./models/item');
const SalesHistory = require('./models/salesHistory');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedSalesForAI() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const items = await Item.findAll();

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1); // older sales for realism

    for (const item of items) {
      const salesEntries = [];

      // 1. Last 30 days: 1-5 sales per day
      for (let d = 0; d <= 30; d++) {
        const date = new Date();
        date.setDate(today.getDate() - d);

        const salesCount = getRandomInt(0, 3); // 0-3 sales per day
        for (let i = 0; i < salesCount; i++) {
          salesEntries.push({
            itemId: item.id,
            date,
            quantitySold: getRandomInt(1, 50),
          });
        }
      }

      // 2. Last year: some random older sales (optional)
      const olderSalesCount = getRandomInt(10, 50);
      for (let i = 0; i < olderSalesCount; i++) {
        salesEntries.push({
          itemId: item.id,
          date: getRandomDate(oneYearAgo, thirtyDaysAgo),
          quantitySold: getRandomInt(1, 100),
        });
      }

      await SalesHistory.bulkCreate(salesEntries);
    }

    console.log('✅ Sales history seeded for AI (7-day & 30-day)!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed sales:', err);
    process.exit(1);
  }
}

seedSalesForAI();
