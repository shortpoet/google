'use strict';

const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const CONFIG_PATH = '../../config/sqlClient.config.json';
const configPath = path.join(__dirname, CONFIG_PATH);
const config = require(configPath);


class SqlClient {
  constructor(options) {
    var sample = 'mssql://user:pass@example.com:5432/dbname'
    this.sql = new Sequelize(config.database, config.username, config.password, {
      host: 'localhost',
      dialect: 'mssql',
    //   pool: {
    //     max: 5,
    //     min: 0,
    //     idle: 10000
    // }
  });
  
  }
  async authenticate() {
    return new Promise((resolve, reject) => {
      try {
        this.sql
        .authenticate()
        .then(() => {
          console.log('Connection has been established successfully.');
          resolve(this.sql)
        })
        .catch(err => {
          console.error('Unable to connect to the database:', err);
        });
      } 
      catch(e) {
        console.error(e);
        reject(e);
      }
    })
  }
}
module.exports = SqlClient;
