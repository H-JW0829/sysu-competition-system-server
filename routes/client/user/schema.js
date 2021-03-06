const Joi = require('joi');

const registerSchema = Joi.object({
  tel: Joi.string()
    .length(11)
    .required()
    .pattern(/^[0-9]+$/, 'numbers'),
  name: Joi.string().max(20).required(),
  password: Joi.string().required(),
  staffId: Joi.string().required().min(8).max(20),
  role: Joi.string()
    .required()
    .pattern(/^student$|^teacher$/),
});

const loginSchema = Joi.object({
  tel: Joi.string()
    .length(11)
    .required()
    .pattern(/^[0-9]+$/, 'numbers'),
  password: Joi.string().required(),
  verify: Joi.any(),
});

const resetPwdSchema = Joi.object({
  tel: Joi.string()
    .length(11)
    .pattern(/^[0-9]+$/, 'numbers'),
  password: Joi.string().required(),
  id: Joi.string(),
});

const idSchema = Joi.object({
  id: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, resetPwdSchema, idSchema };
