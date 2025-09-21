// seedSales.js
const sequelize = require('./db');
const Item = require('./models/item');
const SalesHistory = require('./models/SalesHistory');

const categories = [
  'Fruits', 'Vegetables', 'Meat', 'Seafood', 'Dairy', 'Beverages',
  'Snacks', 'Bakery', 'Frozen', 'Canned Goods', 'Condiments',
  'Dry Goods', 'Grains & Pasta', 'Spices & Seasonings',
  'Breakfast & Cereal', 'Personal Care', 'Household', 'Baby Products',
  'Pet Supplies', 'Health & Wellness', 'Cleaning Supplies'
];

// Generate random category from list
function getRandomCategory() {
  return categories[Math.floor(Math.random() * categories.length)];
}

// Generate random price between 0.5 and 100
function getRandomPrice() {
  return (Math.random() * 99.5 + 0.5).toFixed(2);
}

// Generate a random item name
function getRandomItemName(index) {
  return `Item-${index + 1}`;
}

// Generate dummy barcode
function getBarcode(index) {
  return (1000000000 + index).toString();
}

// Generate random date between 2023 and 2025
function getRandomDate() {
  const start = new Date(2023, 0, 1).getTime();
  const end = new Date(2025, 8, 1).getTime(); // up to Sep 2025
  return new Date(start + Math.random() * (end - start));
}

async function seed() {
  try {
    await sequelize.sync({ force: true }); // reset tables

    // Create 100 items
    const itemsData = [];
    for (let i = 0; i < 100; i++) {
      const randomDate = getRandomDate();
      itemsData.push({
        name: getRandomItemName(i),
        quantity: Math.floor(Math.random() * 100) + 10,
        category: getRandomCategory(),
        price: getRandomPrice(),
        barcode: getBarcode(i),
        createdAt: randomDate,
        updatedAt: randomDate,
      });
    }
    const items = await Item.bulkCreate(itemsData);
    console.log('✅ 100 dummy items created.');

    // Create sales history (random 5–20 sales per item)
    const salesData = [];
    for (const item of items) {
      const salesCount = Math.floor(Math.random() * 16) + 5; // 5–20
      for (let i = 0; i < salesCount; i++) {
        const saleDate = getRandomDate();
        salesData.push({
          itemId: item.id,
          date: saleDate.toISOString().split('T')[0], // YYYY-MM-DD
          quantitySold: Math.floor(Math.random() * 50) + 1, // 1–50
        });
      }
    }

    await SalesHistory.bulkCreate(salesData);
    console.log(`✅ ${salesData.length} random sales history records created.`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding:', err);
    process.exit(1);
  }
}

seed();
