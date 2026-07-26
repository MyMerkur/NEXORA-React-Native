import { Schema, model, type InferSchemaType } from "mongoose";

const certificateSchema = new Schema(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true, unique: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    verificationCode: { type: String, required: true, unique: true },
    issuedAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type Certificate = InferSchemaType<typeof certificateSchema>;

export const CertificateModel = model("Certificate", certificateSchema);
