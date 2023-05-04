import { ObjectId } from 'mongodb';
import mongoose, { Schema, model } from 'mongoose';

export interface IPost {
  _id: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    content: { type: String, required: true },
  },
  { timestamps: true },
);

const Post = model<IPost>('Post', postSchema);
export default Post;
// export default (mongoose.models?.Post as any) ||
//   model<IPost>('Post', postSchema);
