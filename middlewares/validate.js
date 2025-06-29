const { validationResult } = require('express-validator');

module.exports = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const messages = errors.array().map((err) => err.msg);
    return res.status(422).json({ errors: messages });
  };
};