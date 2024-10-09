module.exports = {
  checkIfNameExists: "SELECT * FROM users WHERE name = $1",
  checkIfEmailExists: "SELECT * FROM users WHERE email = $1",
  createUserOrAdmin:
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING * ",
};
