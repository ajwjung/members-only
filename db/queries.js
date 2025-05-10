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

async function getUserByUsername(username) {
  const SQL = `
    SELECT * FROM members
    WHERE username = $1
  `;

  try {
    const { rows } = await pool.query(SQL, [username]);
    return rows;
  } catch (error) {
    console.error("Error querying for user information from database", {
      message: error.message,
      stack: error.stack,
      query: SQL
    });
  };
};

async function getUserById(userId) {
  const SQL = `
    SELECT * FROM members
    WHERE id = $1
  `;

  try {
    const { rows } = await pool.query(SQL, [userId]);
    return rows;
  } catch (error) {
    console.error("Error querying for user information from database", {
      message: error.message,
      stack: error.stack,
      query: SQL
    });
  };
};

async function postNewMessage(userId, messageTitle, messageContent) {
  const SQL = `
    INSERT INTO messages (author, title, content)
    VALUES ($1, $2, $3);
  `;

  try {
    await pool.query(SQL, [userId, messageTitle, messageContent]);
  }  catch (error) {
    console.error("Error inserting new message into database", {
      message: error.message,
      stack: error.stack,
      query: SQL
    });
  };
};

async function getAllMessages() {
  const SQL = `
    SELECT messages.id AS id,
          members.fullname AS author,
          messages.date AS date,
          messages.title AS title,
          messages.content AS content
    FROM messages
    LEFT JOIN members
    ON messages.author = members.id;
  `;

  try {
    const { rows } = await pool.query(SQL);
    return rows;
  } catch (error) {
    console.error("Error getting messages from database", {
      message: error.message,
      stack: error.stack,
      query: SQL
    });
  }
};

module.exports = {
  addNewUser,
  getUserByUsername,
  getUserById,
  postNewMessage,
  getAllMessages,
};