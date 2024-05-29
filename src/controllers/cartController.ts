import { isValidObjectId } from "mongoose";
import {
  NextFunction,
  RequestWithUser,
  Response,
} from "../types/RequestWithuser";
import asyncWrapper from "../utils/asyncWrapper";
import { setError } from "../utils/customError";
import { User } from "../models/userModel";
import { Shoe } from "../models/shoeModel";
import Cart from "../models/cartModel";

export const addToCart = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { productID, quantity = 1 } = req.body;
    if (!productID) return next(setError("please provide product id", 400));
    if (!isValidObjectId(productID))
      return next(setError("Invalid product id", 400));
    const { userID } = req;
    if (!userID || !isValidObjectId(userID))
      return next(setError("something went wrong", 400));

    if (isNaN(Number(quantity)))
      return next(setError("quantity must be a number", 400));

    if (quantity <= 0) return next(setError("quantity atleast 1", 400));
    if (quantity >= 5) return next(setError("quantity atmost 5", 400));

    const isProductInCart = await Cart.findOne({
      userID: userID,
      product: productID,
    });
    if (isProductInCart) return next(setError("product already in cart", 400));

    const product = await Shoe.findById(productID);
    if (!product) return next(setError("product not found", 404));
    const user = await User.findById(userID);
    if (!user) return next(setError("something went wrong", 400));

    const cartItem = new Cart({
      userID: userID,
      product: productID,
      quantity: quantity,
    });

    await cartItem.save();

    await User.findByIdAndUpdate(userID, {
      $addToSet: { cartList: cartItem._id },
      $inc: { cartLength: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "product added to cart",
    });
  }
);

export const getCart = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userID = req.userID;
    if (userID) {
      next(setError("something went wrong", 400));
    }
    const cart = await Cart.find({ userID });
    console.log(cart);
    return res
      .status(200)
      .json({ success: true, message: "cart retrieved", cart });
  }
);

export const deleteFromCart = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userID = req.userID;
    if (!userID) return next(setError("something went wrong", 400));
    const { productID } = req.params;
    if (!productID) return next(setError("please provide product id", 400));
    if (!isValidObjectId(productID))
      return next(setError("Invalid product id", 400));
    const cart = await Cart.findOneAndDelete({ userID, product: productID });
    if (!cart) return next(setError("product not found in cart", 400));
    return res
      .status(200)
      .json({ success: true, message: "product deleted from cart" });
  }
);

export const updateQuantity = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userID = req.userID;
    if (!userID) return next(setError("something went wrong", 400));
    const { productID, quantity } = req.body;
    if (!productID) return next(setError("please provide product id", 400));
    if (!isValidObjectId(productID))
      return next(setError("Invalid product id", 400));
    if (isNaN(Number(quantity)))
      return next(setError("quantity must be a number", 400));
    if (quantity <= 0) return next(setError("quantity atleast 1", 400));
    if (quantity >= 5) return next(setError("quantity atmost 5", 400));
    const cart = await Cart.findOneAndUpdate(
      { userID, product: productID },
      { quantity: quantity }
    );
    if (!cart) return next(setError("product not found in cart", 400));
    return res
      .status(200)
      .json({ success: true, message: "product quantity updated" });
  }
);
