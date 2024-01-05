const ValidateEmail = (mail) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(mail);
};

const ValidatePassword = (password) => {
  if (password.length < 8) {
    return false;
  }
  return true;
};

module.exports = {
  ValidateEmail,
  ValidatePassword,
};
