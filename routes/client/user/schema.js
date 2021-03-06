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

// const test = {
//   tel: '18822917378',
//   name: 'gavell',
//   password: '1231231231223',
//   role: 'teacher',
// };
// console.log('==========================');
// const { error } = registerSchema.validate(test);
// console.log(error);
// console.log('==========================');
module.exports = { registerSchema, loginSchema };
