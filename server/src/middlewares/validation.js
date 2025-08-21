const Joi = require('joi');

// Simplified validation schemas
const schemas = {
  register: Joi.object({
    fullName: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  invoice: Joi.object({
    products: Joi.array().min(1).items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        rate: Joi.number().min(0).required(),
        totalAmount: Joi.number().min(0).required()
      })
    ).required(),
    summary: Joi.object({
      totalCharges: Joi.number().min(0).required(),
      gst: Joi.number().min(0).required(),
      finalAmount: Joi.number().min(0).required()
    }).optional()
  })
};

// Simplified validation middleware
const validate = (schemaName) => (req, res, next) => {
  const { error } = schemas[schemaName].validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map(d => d.message).join(', ')
    });
  }
  next();
};

module.exports = {
  validateRegister: validate('register'),
  validateLogin: validate('login'),
  validateInvoice: validate('invoice')
};
