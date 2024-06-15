import { isValidObjectId } from "mongoose";
import {
  NextFunction,
  RequestWithUser,
  Response,
} from "../types/RequestWithuser";
import asyncWrapper from "../utils/asyncWrapper";
import { setError } from "../utils/customError";
import { User } from "../models/userModel";
import Order, { validateOrder } from "../models/orderModel";

export const newOrder = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { userID } = req;

    if (!isValidObjectId(userID)) {
      return next(setError("soemthing went wrong", 400));
    }
    const user = await User.findById(userID);
    if (!user) return next(setError("user not found", 404));
    const { products, totalAmount, address } = req.body;
    const validatedOrder = validateOrder({
      products,
      totalAmount,
      address,
      user: userID,
    });
    if (validatedOrder.error)
      return next(setError(validatedOrder.error.message, 400));

    const newOrder = new Order({
      user: userID,
      products,
      totalAmount,
      address,
    });

    await newOrder.save();
    user.ordersLength = user.ordersLength + 1;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "order created successfully" });
  }
);

export const getOrders = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userID = req.userID;
    if (!userID) return next(setError("something went wrong", 400));
    const orders = await Order.find({ user: userID });
    if (!orders) return next(setError("orders not found", 400));
    return res.status(200).json({ success: true, orders });
  }
);

export const deleteOrder = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { orderID } = req.params;
    if (!orderID) return next(setError("please provide order id", 400));
    if (!isValidObjectId(orderID))
      return next(setError("Invalid order id", 400));
    const userID = req.userID;
    if (!userID) return next(setError("something went wrong", 400));
    const order = await Order.findById(orderID);
    if (!order) return next(setError("order not found", 400));
    if (order.user.toString() !== userID.toString())
      return next(setError("unauthorised", 403));

    await order.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "order deleted successfully" });
  }
);
