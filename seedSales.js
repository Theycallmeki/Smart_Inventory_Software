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

// Generate a random item name for simplicity
function getRandomItemName(index) {
  return `Item-${index + 1}`;
}

// Generate dummy barcode - simple incremental string
function getBarcode(index) {
  return (1000000000 + index).toString();
}

async function seed() {
  try {
    await sequelize.sync({ force: true }); // reset tables

    // Create 50 items
    const itemsData = [];
    for (let i = 0; i < 50; i++) {
      itemsData.push({
        name: getRandomItemName(i),
        quantity: Math.floor(Math.random() * 100) + 10,
        category: getRandomCategory(),
        price: getRandomPrice(),
        barcode: getBarcode(i),
      });
    }
    const items = await Item.bulkCreate(itemsData);
    console.log('50 dummy items created.');

    // Create sales history for each month in 2024 for each item
    const salesData = [];
    for (const item of items) {
      for (let month = 0; month < 12; month++) {
        // Use 15th day of each month for sales date (just a fixed date)
        const date = new Date(2024, month, 15);
        salesData.push({
          itemId: item.id,
          date: date.toISOString().split('T')[0], // YYYY-MM-DD format
          quantitySold: Math.floor(Math.random() * 20) + 1, // between 1 and 20
        });
      }
    }

    await SalesHistory.bulkCreate(salesData);
    console.log('Monthly sales data for 50 items created for 2024.');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}

seed();
