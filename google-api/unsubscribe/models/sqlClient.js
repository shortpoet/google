'use strict';

const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const KEY_PATH = '../../config/sqlClient.config.json';
const keyPath = path.join(__dirname, KEY_PATH);

const keyFile = require(keyPath);


class SqlClient {
  constructor(options) {
    var sample = 'mssql://user:pass@example.com:5432/dbname'
    this.sql = new Sequelize('Google', 'node_client', 'dFicJotG5hHPTCY1flfq', {
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
