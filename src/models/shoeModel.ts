import { Document, Schema, model } from "mongoose";
import { User } from "./userModel";
import Joi from "joi";

interface IReview extends Document {
  reviewer: {
    name: string;
    email: string;
    _id: Schema.Types.ObjectId;
  };
  title: string;
  message?: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  _id: Schema.Types.ObjectId;
}

type ReviewType = {
  reviewer: {
    name: string;
    email: string;
    _id: Schema.Types.ObjectId;
  };
  title: string;
  message?: string;
  rating: number;
};

const reviewSchema = new Schema<IReview>(
  {
    reviewer: {
      name: {
        type: String,
        required: [true, "Please enter the name of the reviewer"],
      },

      email: {
        type: String,
        required: [true, "Please enter the email of the reviewer"],
      },
      _id: {
        type: Schema.Types.ObjectId,
        ref: User,
      },
    },
    message: {
      type: String,
      minlength: [3, "content must have atleast 3 letters"],
      trim: true,
    },
    rating: {
      type: Number,
      min: [0, "minimum rating is 0"],
      max: [5, "maximum rating is 5"],
      required: [true, "please enter the rating"],
    },
    title: {
      type: String,
      required: [true, "please enter the title"],
      trim: true,
    },
  },
  { timestamps: true }
);
const Review = model<IReview>("review", reviewSchema);

interface IShoe extends Document {
  name: string;
  brand: string;
  gender: string;
  category: string;
  price: number;
  isInInventory: boolean;
  itemsLeft: number;
  imageUrl: string;
  reviews: IReview[];
  reviewsLength: number;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  sold: number;
  views: number;
  viewers: Schema.Types.ObjectId[];
  rating: number;
}

const shoeSchema = new Schema<IShoe>(
  {
    name: {
      type: String,
      required: [true, "please enter the title of the shoes"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "please enter the brand of the shoes"],
    },
    gender: {
      type: String,
      required: [true, "please enter the gender"],
      enum: ["men", "women", "unisex", "kids"],
    },
    category: {
      type: String,
      required: [true, "please enter the category"],
      enum: ["running", "football", "casual", "formal", "basketball"],
    },
    price: {
      type: Number,
      required: [true, "please enter the price"],
    },
    isInInventory: {
      type: Boolean,
      required: [true, "please enter if it is in inventory or not"],
    },
    itemsLeft: {
      type: Number,
      required: [true, "please enter the number of items left"],
    },
    imageUrl: {
      type: String,
      required: [true, "please add the image of the product"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sold: {
      type: Number,
      default: 0,
    },
    viewers: {
      type: [Schema.ObjectId],
      default: [],
      ref: User,
    },
    views: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [Review.schema],
      default: [],
    },
    rating: {
      type: Number,
      min: [0, "minimum rating is 0"],
      max: [5, "maximum rating is 5"],
      required: [true, "please enter the rating"],
    },
  },
  { timestamps: true }
);
shoeSchema.index({ category: 1 });
shoeSchema.index({ name: 1 });
shoeSchema.index({ gender: 1 });

const Shoe = model("shoe", shoeSchema);

const validate = (shoe: any) => {
  const GENDERS = ["men", "women", "unisex", "kids"];
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    brand: Joi.string().required(),
    gender: Joi.string()
      .valid(...GENDERS)
      .required(),
    category: Joi.string().required(),
    price: Joi.number().required(),
    isInInventory: Joi.boolean().required(),
    itemsLeft: Joi.number().required(),
  });
  return schema.validate(shoe);
};

export { Shoe, validate, ReviewType, Review };
