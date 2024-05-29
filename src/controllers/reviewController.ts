import { isValidObjectId } from "mongoose";
import { User, Shoe, Review, ReviewType } from "../models/models";
import {
  NextFunction,
  RequestWithUser,
  Response,
} from "../types/RequestWithuser";
import asyncWrapper from "../utils/asyncWrapper";
import { setError } from "../utils/customError";

export const addReview = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { rating, title, comment, productID } = req.body;
    if (!rating || !title)
      return next(setError("please provide atleast rating and title", 400));
    const { userID } = req;
    if (!userID)
      return next(setError("something went wrong. Try logging again.", 400));
    if (!productID || !isValidObjectId(productID) || !isValidObjectId(userID))
      return next(setError("something went wrong", 400));
    const user = await User.findById(userID);
    if (!user) return next(setError("something went wrong", 400));
    const product = await Shoe.findById(productID);
    if (!product) return next(setError("product not found", 400));
    const review: ReviewType = {
      rating: rating,
      reviewer: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      title: title,
      message: comment,
    };
    const newReview = new Review(review);
    product.reviews.push(newReview);
    await product.save();
    return res
      .status(200)
      .json({ success: true, message: "review added successfully" });
  }
);

export const deleteReview = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { reviewID, productID } = req.params;
    if (!reviewID || !productID)
      return next(setError("please provide review id and product id", 400));
    const { userID } = req;
    if (!userID) return next(setError("something went wrong", 400));
    if (!isValidObjectId(productID))
      return next(setError("invalid product", 400));
    const product = await Shoe.findById(productID);
    if (!product) return next(setError("product not found", 400));
    const productReviews = product.reviews;
    const review = productReviews.find(
      (review) => review._id.toString() === reviewID
    );
    if (review === undefined) return next(setError("review not found", 400));

    if (review.reviewer._id.toString() !== userID.toString())
      return next(setError("unauthorised", 403));

    product.reviews = product.reviews.filter(
      (review) => String(review._id) !== String(reviewID)
    );

    await product.save();
    return res
      .status(200)
      .json({ success: true, message: "review deleted successfully" });
  }
);
