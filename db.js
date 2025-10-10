const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'postgresql://database_2eqz_user:zUjzeeJBk8Bjkjn46tthHmohxM9Phxsa@dpg-d3kp392dbo4c73a76c4g-a.singapore-postgres.render.com/database_2eqz',
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

module.exports = sequelize;
