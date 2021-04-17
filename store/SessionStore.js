const crypto = require("crypto")

class SessionStore {
  constructor() {
    this.sessions = new Set();
  }

  insert(id) {
    return this.sessions.add(id);
  }

  remove(id) {
    return this.sessions.delete(id);
  }

  generate() {
    let id = crypto.randomBytes(3).toString("hex").slice(1);
    if (this.sessions.has(id))
      id = this.generate();
    // this.insert(id);
    return id;
  }
}

module.exports = SessionStore