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
  banner?: string;
  tags?: {
    verified?: true;
    developer?: true;
  };
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true },
    image: { type: String },
    name: { type: String, required: true },
    bio: { type: String },
    banner: { type: String },
    tags: {
      verified: { type: Boolean },
      developer: { type: Boolean },
    },
  },

  { timestamps: true },
);

const User = model<IUser>('User', userSchema);
export default User;
// export default (mongoose.models?.User as Model<IUser>) ||
//   model<IUser>('User', userSchema);
