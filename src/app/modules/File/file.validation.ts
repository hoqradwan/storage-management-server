import { z } from "zod";
import mongoose from "mongoose";

export const fileValidationSchema = z.object({
    name: z.string().min(1, "File name is required"),
    type: z.enum(["note", "image", "pdf"]),
    size: z.number().positive("File size must be a positive number"),
    path: z.string().min(1, "File path is required"),
    user: z
        .string()
        .refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid user ID",
        }),
    isFavorite: z.boolean().optional(),
});

