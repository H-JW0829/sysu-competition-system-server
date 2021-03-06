const Joi = require('joi');

const idSchema = Joi.object({
  competitionId: Joi.string().required(),
});

const signUpSchema = Joi.object({
  competitionId: Joi.string().required(),
  users: Joi.array().required(),
});

module.exports = { idSchema, signUpSchema };
