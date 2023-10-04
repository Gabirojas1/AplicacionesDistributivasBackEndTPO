const { Pool } = require("pg");

const pg_pool = new Pool({
  user: "myhome",
  host: "myhome.pg",
  database: "myhome",
  password: "1234",
  port: 5432,
});

module.exports = {
  pg_pool,
};
