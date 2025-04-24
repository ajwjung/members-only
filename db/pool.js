const { Pool } = require("pg");

module.exports = new Pool({
	connectionString: process.env.CONNECTION_URI,
	ssl: {
		rejectUnauthorized: false, // Required for insecure SSL connections
	}
});