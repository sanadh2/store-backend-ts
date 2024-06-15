import Joi from "joi";

const GENDERS = ["male", "female", "others"];

const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  zipCode: Joi.string().required(),
  houseNumber: Joi.number().required(),
  phoneNumber: Joi.number().required(),
}).required();

export const newUserValidator = (user: any) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.required": "name is required",
      "string.base": "name must be a string",
    }),
    email: Joi.string().email().required().messages({
      "string.required": "email is required",
      "string.base": "email must be a string",
      "string.email": "invalid email",
    }),
    password: Joi.string().required().min(6).messages({
      "string.required": "password is required",
      "string.base": "password must be a string",
      "string.min": "password must be atleast 6 characters",
    }),
    gender: Joi.string()
      .valid(...GENDERS)
      .required()
      .messages({
        "string.required": "gender is required",
        "string.base": "gender must be a string",
      }),
    phoneNumber: Joi.number()
      .min(6000000000)
      .max(9999999999)
      .required()
      .messages({
        "number.min": "invalid phone number",
        "number.max": "invalid phone number",
      }),
    address1: addressSchema,
    avatar: Joi.string().optional(),
  });
  return schema.validate(user);
};

export const updateUserValidator = (user: any) => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    gender: Joi.string().required().optional(),
    phoneNumber: Joi.number()
      .min(6000000000)
      .max(9999999999)
      .required()
      .messages({
        "number.min": "invalid phone number",
        "number.max": "invalid phone number",
      })
      .optional(),
    address1: addressSchema.optional(),
    address2: addressSchema.optional(),
    address3: addressSchema.optional(),
    avatar: Joi.string().optional(),
  });
  return schema.validateAsync(schema);
};
