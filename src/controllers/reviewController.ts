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

    if (rating <= 0) return next(setError("rating atleast 1", 400));
    if (rating >= 5) return next(setError("rating atmost 5", 400));

    if (
      product.reviews.find(
        (review) => review.reviewer._id.toString() === userID.toString()
      )
    )
      return next(setError("you already reviewed this product", 400));

    const review: ReviewType = {
      rating: Number(rating),
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

export const updateReview = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { reviewID, productID, rating, title, comment } = req.body;
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

    if (rating && (Number(rating) < 1 || Number(rating) > 5)) {
      return next(setError("Rating must be between 1 and 5", 400));
    }

    product.reviews = productReviews.map((review) => {
      if (String(review._id) === String(reviewID)) {
        if (rating) review.rating = Number(rating);
        if (title) review.title = title;
        if (comment) review.message = comment;
      }
      return review;
    });
    await product.save();
    return res
      .status(200)
      .json({ success: true, message: "review updated successfully" });
  }
);
