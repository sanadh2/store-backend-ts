import { isValidObjectId } from "mongoose";
import { User } from "../models/userModel";
import {
  ReQuestWithFile,
  Request,
  RequestWithUser,
  RequestWithUserandFile,
  Response,
  NextFunction,
} from "../types/RequestWithuser";
import asyncWrapper from "../utils/asyncWrapper";
import { setError } from "../utils/customError";
import { Shoe, validateShoe } from "../models/models";
import path from "path";
import deleteImage from "../utils/deleteImage";
import { isNumber } from "lodash";

export const newProduct = asyncWrapper(
  async (req: RequestWithUserandFile, res: Response, next: NextFunction) => {
    const { name, price, gender, isInInventory, itemsLeft, category, brand } =
      req.body;
    const image = req.file;

    if (!name || !price || !category || !brand || !image) {
      if (image) deleteImage(image.filename, "shoes");
      return next(setError("Please provide all the details", 400));
    }
    const isValidProduct = validateShoe({
      name,
      price,
      gender,
      isInInventory,
      itemsLeft,
      category,
      brand,
    });

    if (isValidProduct.error) {
      deleteImage(image.filename, "shoes");
      return next(setError(isValidProduct.error.details[0].message, 400));
    }

    const newShoe = new Shoe({
      name,
      price,
      gender,
      isInInventory,
      itemsLeft,
      category,
      brand,
      imageUrl: path.join(image.filename),
    });
    await newShoe.save();

    res
      .status(201)
      .json({ success: true, shoe: newShoe, message: "product added" });
  }
);

export const deleteProduct = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { productID } = req.params;
    if (!isValidObjectId(productID))
      return next(setError("Invalid product id", 400));
    const product = await Shoe.findByIdAndDelete(productID);
    if (!product) return next(setError("Product not found", 400));
    return res
      .status(200)
      .json({ success: true, product, message: "product deleted" });
  }
);

export const updateProduct = asyncWrapper(
  async (req: RequestWithUserandFile, res: Response, next: NextFunction) => {
    const { productID } = req.params;
    if (!productID) return next(setError("Invalid product id", 400));
    if (!isValidObjectId(productID))
      return next(setError("Invalid product id", 400));
    const { name, price, gender, isInInventory, itemsLeft, category, brand } =
      req.body;
    const image = req.file;
    const isValidProduct = validateShoe({
      name,
      price,
      gender,
      isInInventory,
      itemsLeft,
      category,
      brand,
    });
    if (isValidProduct.error) {
      if (image) deleteImage(image.filename, "shoes");
      return next(setError(isValidProduct.error.details[0].message, 400));
    }
    const product = await Shoe.findByIdAndUpdate(productID, req.body, {
      new: true,
    });
    if (!product) return next(setError("product not found", 400));
    if (image) {
      deleteImage(product.imageUrl, "shoes");
      product.imageUrl = path.join(image.filename);
      await product.save();
    }
    return res
      .status(200)
      .json({ success: true, product, message: "product updated" });
  }
);

export const getProductInfo = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { productID } = req.params;
    const userID = req.userID;
    if (!isValidObjectId(productID))
      return next(setError("Invalid product id", 400));
    const product = userID
      ? await Shoe.findByIdAndUpdate(productID, { $inc: { views: 1 } })
      : await Shoe.findById(productID);
    if (!product) return next(setError("product not found", 400));
    return res
      .status(200)
      .json({ success: true, product, message: "product found" });
  }
);
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const filtershoes = asyncWrapper(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const {
      s,
      brand,
      gender,
      featured,
      isInInventory,
      rating,
      limit,
      page,
      minPrice,
      maxPrice,
    } = req.query;
    const queryFilter: Record<string, any> = {};
    if (s) {
      console.log(s);
      const escapeRegExpSearch = new RegExp(escapeRegExp(s as string), "i");
      console.log("escapeRegExpSearch is", escapeRegExpSearch);
      queryFilter.$or = [
        {
          name: { $regex: escapeRegExpSearch },
        },
        { brand: { $regex: escapeRegExpSearch } },
        { category: { $regex: escapeRegExpSearch } },
      ];
    }
    if (!s && brand) {
      queryFilter.brand = brand;
    }
    if (
      gender &&
      ["boys", "girls", "kids", "unisex"].includes(gender as string)
    ) {
      queryFilter.gender = gender;
    }
    if (featured) {
      featured === "true"
        ? (queryFilter.featured = true)
        : (queryFilter.featured = false);
    }
    if (rating) {
      const minRating = parseInt(rating as string) | 0;
      const aggregationPipeline = [
        {
          $match: queryFilter,
        },
        {
          $project: {
            averageRating: { $avg: "$reviews.rating" },
          },
        },
        {
          $match: {
            averageRating: { $gt: minRating },
          },
        },
      ];

      const shoesWithAverageRating = await Shoe.aggregate(aggregationPipeline);

      const shoeIdsWithAverageRating = shoesWithAverageRating.map(
        (shoe) => shoe._id
      );

      queryFilter._id = { $in: shoeIdsWithAverageRating };
    }
    if (isInInventory) queryFilter.isInInventory = true;

    const limitValue =
      isNumber(limit as string) && parseInt(limit as string) > 0
        ? parseInt(limit as string)
        : 10;
    let skipValue = 0;
    let pageNumber = 1;
    if (isNumber(page) && page < 1) pageNumber = 1;
    else if (isNumber(page)) {
      pageNumber = page;
    }
    skipValue = (pageNumber - 1) * limitValue;

    let minimumPrice =
      isNumber(minPrice) && minPrice > 0 ? Number(minPrice) : 200;
    let maximumPrice =
      isNumber(maxPrice) && maxPrice > 0 ? Number(maxPrice) : 25000;
    if (minimumPrice < 200) minimumPrice = 200;
    if (maximumPrice > 25000) maximumPrice = 25000;
    queryFilter.price = { $gt: minimumPrice, $lt: maximumPrice };
    const countProducts = await Shoe.countDocuments(queryFilter);

    const products = await Shoe.find(queryFilter)
      .limit(limitValue)
      .skip(skipValue);

    return res.status(200).json({
      success: true,
      message: "products found",
      products,
      nbh: countProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(countProducts / limitValue),
    });
  }
);

export const bestSellers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit } = req.query;
    const limitValue =
      isNumber(limit as string) && parseInt(limit as string) > 0
        ? parseInt(limit as string)
        : 10;
    const products = await Shoe.find().sort({ sold: -1 }).limit(limitValue);
    return res
      .status(200)
      .json({ success: true, products, message: "products found" });
  }
);
