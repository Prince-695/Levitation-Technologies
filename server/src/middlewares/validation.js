const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name cannot exceed 50 characters'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email',
      'string.empty': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.empty': 'Password is required'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm password is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email',
      'string.empty': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

const invoiceSchema = Joi.object({
  products: Joi.array()
    .min(1)
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        rate: Joi.number().min(0).required(),
        totalAmount: Joi.number().min(0).required()
      })
    )
    .required()
    .messages({
      'array.min': 'At least one product is required'
    }),
  summary: Joi.object({
    totalCharges: Joi.number().min(0).required(),
    gst: Joi.number().min(0).required(),
    finalAmount: Joi.number().min(0).required()
  }).required()
});

// Validation middleware function
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateInvoice: validate(invoiceSchema)
};
