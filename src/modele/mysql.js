const mysql = require("mysql2");

const connexion = mysql.createConnection({
    host:process.env.MYSQLHOST,
    user:process.env.MYSQLUSER,
    port:process.env.MYSQLPORT,
    password:process.env.MYSQLPASS,
    database:process.env.MYSQLDATABASE
});

module.exports = connexion;