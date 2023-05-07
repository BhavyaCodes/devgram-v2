import { ObjectId } from 'mongodb';
import mongoose, { Schema, model } from 'mongoose';

export interface IUser {
  _id: ObjectId;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true },
    image: { type: String },
    name: { type: String },
  },

  { timestamps: true },
);

const User = model<IUser>('User', userSchema);
export default User;
// export default (mongoose.models?.User as any) ||
//   model<IUser>('User', userSchema);
