const generateOTP = (num) => {
  let OTP = 0;

  for (let i = 1; i <= num; i++) {
    OTP = Math.round(OTP * 10 + Math.random() * 10);
  }

  return OTP;
};

module.exports = { generateOTP };
