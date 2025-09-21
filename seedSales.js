// seedDemo3.js
const sequelize = require('./db');
const Item = require('./models/item');
const SalesHistory = require('./models/salesHistory');

async function seedDemo3() {
  try {
    await sequelize.sync(); // ✅ no force, keeps existing data

    // Create demo3 item (zigzag trend)
    const demo3 = await Item.create({
      id: 107,
      name: 'demo3',
      quantity: 100,
      category: 'Fruits',
      price: 9.99,
      barcode: '00000107',
    });

    const demo3Sales = [
      { date: '2025-09-14', quantitySold: 10 },
      { date: '2025-09-15', quantitySold: 20 },
      { date: '2025-09-16', quantitySold: 15 },
      { date: '2025-09-17', quantitySold: 25 },
      { date: '2025-09-18', quantitySold: 12 },
      { date: '2025-09-19', quantitySold: 30 },
      { date: '2025-09-20', quantitySold: 18 },
    ].map(s => ({ ...s, itemId: demo3.id }));

    await SalesHistory.bulkCreate(demo3Sales);

    console.log('✅ demo3 seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding demo3:', err);
    process.exit(1);
  }
}

seedDemo3();
