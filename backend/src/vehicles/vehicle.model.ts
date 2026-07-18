import mongoose, { Schema } from "mongoose";

export interface IVehicle {
  _id: mongoose.Types.ObjectId;
  make: string;
  model: string;
  category: "Sedan" | "SUV" | "Truck" | "Hatchback" | "Coupe" | "Convertible" | "Van" | "Electric";
  price: number;
  quantity: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const vehicleCategories = [
  "Sedan",
  "SUV",
  "Truck",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Van",
  "Electric",
];

const vehicleSchema = new Schema<IVehicle>(
  {
    make: {
      type: String,
      required: [true, "Make is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: vehicleCategories,
        message: "Invalid category",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be less than 0"],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be less than 0"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle = mongoose.model<IVehicle>("Vehicle", vehicleSchema);
