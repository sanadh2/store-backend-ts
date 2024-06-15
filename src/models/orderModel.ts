import Joi from "joi";
import { Document, Schema, model } from "mongoose";

interface IProduct {
  product: Schema.Types.ObjectId;
  quantity: number;
  totalAmount: number;
}
interface IOrder extends Document {
  user: Schema.Types.ObjectId;
  products: IProduct[];
  totalAmount: number;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    houseNumber: number;
    phoneNumber: number;
  };
  isDelivered: boolean;
  deliveredAt: Date;
  _id: Schema.Types.ObjectId;
  id: string;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        product: {
          required: [true, "Please provide product id"],
          type: Schema.Types.ObjectId,
          ref: "Shoe",
        },
        quantity: { type: Number, required: [true, "Please provide quantity"] },
        totalAmount: {
          type: Number,
          required: [true, "Please provide total amount"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Please provide total amount"],
    },
    address: {
      street: { type: String, required: [true, "Please provide street"] },
      city: { type: String, required: [true, "Please provide city"] },
      state: { type: String, required: [true, "Please provide state"] },
      country: { type: String, required: [true, "Please provide country"] },
      zipCode: { type: String, required: [true, "Please provide zip code"] },
      houseNumber: {
        type: Number,
        required: [true, "Please provide house number"],
      },
      phoneNumber: {
        type: Number,
        required: [true, "Please provide phone number"],
      },
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  {
    timestamps: true,
    id: true,
  }
);

const validateOrder = (order: any) => {
  const productSchema = Joi.object({
    product: Joi.string().required(),
    quantity: Joi.number().min(1).required().messages({
      "number.min": "quantity must be atleast 1",
    }),
    totalAmount: Joi.number().required(),
  });
  const addressSchema = Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    zipCode: Joi.string().required(),
    houseNumber: Joi.number().required(),
    phoneNumber: Joi.number().required(),
  }).required();
  const schema = Joi.object({
    user: Joi.string().required(),
    products: Joi.array().items(productSchema).required(),
    totalAmount: Joi.number().required(),
    address: addressSchema,
  });
  return schema.validate(order);
};

const Order = model<IOrder>("Order", orderSchema);
export { validateOrder };
export default Order;
