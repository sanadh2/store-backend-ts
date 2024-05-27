import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Joi from "joi";

interface IUserMethods {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

interface IAddress extends mongoose.Document {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  houseNumber: number;
  phoneNumber: number;
  id: string;
}

interface AddressType {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  houseNumber: number;
  phoneNumber: number;
}

interface IUser extends mongoose.Document, IUserMethods {
  _id?: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  gender: "male" | "female" | "others";
  avatar?: string;
  phoneNumber: number;
  cartList: mongoose.Schema.Types.ObjectId[];
  cartLength: number;
  orders: mongoose.Schema.Types.ObjectId[];
  ordersLength: number;
  address1: IAddress;
  address2?: IAddress;
  address3?: IAddress;
  accountLockedUntil: Date | null;
  failedLoginAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

const addressSchema = new mongoose.Schema<IAddress>({
  street: {
    type: String,
    required: [true, "Street is required"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
  },
  country: {
    type: String,
    required: [true, "Country is required"],
  },
  zipCode: {
    type: String,
    required: [true, "Zip code is required"],
  },
  houseNumber: {
    type: Number,
    required: [true, "House number is required"],
  },
  phoneNumber: {
    type: Number,
    required: [true, "Phone number is required"],
  },
  id: {
    type: String,
  },
});

const userSchema = new mongoose.Schema<IUser>(
  {
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "others"],
    },
    avatar: {
      type: String,
    },
    phoneNumber: {
      type: Number,
      required: [true, "Phone number is required"],
      unique: true,
    },

    address1: { type: addressSchema, required: true },
    address2: { type: addressSchema, required: false },
    address3: { type: addressSchema, required: false },
    cartList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cartLength: {
      type: Number,
      default: 0,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    ordersLength: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 11);

  next();
});

const validate = (user: any) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    gender: Joi.string().required(),
    phoneNumber: Joi.number()
      .min(6000000000)
      .max(9999999999)
      .required()
      .messages({
        "number.min": "invalid phone number",
        "number.max": "invalid phone number",
      }),
    address1: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      zipCode: Joi.string().required(),
      houseNumber: Joi.number().required(),
      phoneNumber: Joi.number()
        .required()
        .min(6000000000)
        .max(9999999999)
        .message("invalid phone number"),
    }),
    avatar: Joi.string(),
  });
  return schema.validate(user);
};

userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);
const Address = mongoose.model<IAddress>("Address", addressSchema);
export { User, Address, AddressType, IUser, validate };
