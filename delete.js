// delete.js

const sequelize = require('./db');

async function deleteAllItems() {
  try {
    await sequelize.query('TRUNCATE TABLE "sales_histories", "Items" RESTART IDENTITY CASCADE');
    console.log('🗑️ All items and related sales history deleted successfully.');
  } catch (error) {
    console.error('❌ Error deleting items and sales history:', error);
  } finally {
    await sequelize.close();
  }
}

deleteAllItems();
