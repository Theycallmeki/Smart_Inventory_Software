const sequelize = require('./db');
const Item = require('./models/item');
const SalesHistory = require('./models/salesHistory');

async function seedSales() {
  try {
    await sequelize.sync(); // no force — keeps items intact

    const items = await Item.findAll();
    if (!items.length) {
      console.log('⚠️ No items found. Please add items first.');
      return;
    }

    console.log(`Found ${items.length} items. Seeding sales data...`);

    const salesData = [];

    // 📅 Generate 30 days of sales history for each item
    for (const item of items) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i)); // from 30 days ago to today

        // random trend simulation: different per item
        let baseQty = 10 + item.id * 5;
        const variation = Math.floor(Math.random() * 6) - 3; // ±3
        const quantitySold = Math.max(1, baseQty + variation + i); // some growth trend

        salesData.push({
          itemId: item.id,
          date,
          quantitySold, // ✅ fixed key
        });
      }
    }

    await SalesHistory.bulkCreate(salesData);
    console.log('✅ Seeded 7-day & 30-day sales data successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding sales data:', err);
    process.exit(1);
  }
}

seedSales();
