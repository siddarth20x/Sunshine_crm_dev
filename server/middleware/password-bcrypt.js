const bcrypt = require("bcrypt");
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const unEncryptedPass = await bcrypt.hash(password, saltRounds);
    return unEncryptedPass;
  } catch (error) {
    //console.log(error);
  }
};
const comparePassword = async (password, hashPassword) => {
  return bcrypt.compare(password, hashPassword);
};

module.exports = { hashPassword, comparePassword };
