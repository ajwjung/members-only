const pool = require("./pool");

async function addNewUser(fullname, username, password, membership, admin) {
  const SQL = `
    INSERT INTO members (fullname, username, password, membership, admin)
    VALUES ($1, $2, $3, $4, $5)
  `;

  try {
    await pool.query(SQL, [fullname, username, password, membership, admin]);
  } catch (error) {
    console.error("Error inserting new user into database", {
      message: error.message,
      stack: error.stack,
      query: SQL
    });
  }
};

module.exports = {
  addNewUser,
}