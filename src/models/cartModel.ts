import mongoose, { Schema, model, Document } from "mongoose";

interface Icart extends Document {
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<Icart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userID is required"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "shoe",
      required: [true, "productID is required"],
    },
    quantity: {
      type: Number,
      default: 1,
      max: [5, "maximum quantity is 5"],
      min: [1, "minimum quantity is 1"],
    },
  },
  { timestamps: true }
);
cartSchema.index({ userID: 1, product: 1 }, { unique: true });

const Cart = model<Icart>("Cart", cartSchema);

export { Cart };
export default Cart;
