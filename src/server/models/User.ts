import { ObjectId } from 'mongodb';
import mongoose, { Model, Schema, model } from 'mongoose';

export interface IUser {
  _id: ObjectId;
  email: string;
  image?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true },
    image: { type: String },
    name: { type: String, required: true },
    bio: { type: String },
  },

  { timestamps: true },
);

const User = model<IUser>('User', userSchema);
export default User;
// export default (mongoose.models?.User as Model<IUser>) ||
//   model<IUser>('User', userSchema);
