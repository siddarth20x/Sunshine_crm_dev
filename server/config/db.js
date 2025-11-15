const mysql = require('mysql2')
require('dotenv').config()

const connection = mysql.createPool({
    // socketPath: '/cloudsql/sunshine-dev-server:asia-south1:sunshine-dev-db',
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DB,
    password: process.env.MYSQL_PASS,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
});

module.exports = connection;
