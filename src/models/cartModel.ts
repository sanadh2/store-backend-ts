import mongoose, { Schema, model, Document } from "mongoose";
interface Icart extends Document {
  userID: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<Icart>(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Shoe",
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
