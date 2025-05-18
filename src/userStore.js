import { Low } from "lowdb";
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const lodash = require('lodash');

const adapter = new JSONFile('./db/users.json');
const db = new Low(adapter);
db.data ||= { users: [] };

module.exports = {
  getUser: async (username) => {
    await db.read();
    return db.data.users.find(u => u.username === username);
  },

  createUser: async (username) => {
    await db.read();
    const user = {
      id: nanoid(),
      username,
      tokens: 1000,
      lastBonus: null,
    };
    db.data.users.push(user);
    await db.write();
    return user;
  },

  giveDailyBonus: async (username) => {
    await db.read();
    const user = db.data.users.find(u => u.username === username);
    const today = new Date().toISOString().split('T')[0];
    if (user.lastBonus !== today) {
      user.tokens += 250;
      user.lastBonus = today;
      await db.write();
      return { success: true, tokens: user.tokens };
    }
    return { success: false, tokens: user.tokens };
  },

  getAllUsers: async () => {
    await db.read();
    return db.data.users;
  }
};
