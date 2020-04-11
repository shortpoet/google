'use strict';

const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const CONFIG_PATH = '../../config/sqlClient.config.json';
const configPath = path.join(__dirname, CONFIG_PATH);
const config = require(configPath);

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: 'localhost',
  dialect: 'mssql',
//   pool: {
//     max: 5,
//     min: 0,
//     idle: 10000
// }
});

const baseFolder = __dirname;
// const indexFile = 'sqlClient.js';
const indexFiles = ['index.js','sqlClient.js'];
const db = {};


fs
  .readdirSync(baseFolder)
  .filter((file) => {
    // return (file.indexOf('.') !== 0) && (file !== indexFile) && (file.slice(-3) === '.js');
    return (file.indexOf('.') !== 0) && (!indexFiles.includes(file)) && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    const model = sequelize['import'](path.join(baseFolder, file));
    const modelName = file.split('.')[0];
    db[modelName] = model;
  });

Object.keys(db).forEach((modelName) => {
  if(db[modelName].options.classMethods.associate) {
    db[modelName].options.classMethods.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
