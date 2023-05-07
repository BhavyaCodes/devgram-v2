import { ObjectId } from 'mongodb';
import mongoose, { Schema, model } from 'mongoose';
import { IUser } from './User';

export interface IPost {
  _id: ObjectId;
  userId: IUser;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

const Post = model<IPost>('Post', postSchema);
export default Post;
// export default (mongoose.models?.Post as any) ||
//   model<IPost>('Post', postSchema);
