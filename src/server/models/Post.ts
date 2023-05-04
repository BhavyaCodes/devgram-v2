import mongoose, { Schema, model } from 'mongoose';

interface IPost {
  content: string;
  createdAt: string;
  updatedAt: string;
}

const postSchema = new Schema<IPost>(
  {
    content: { type: String, required: true },
  },
  { timestamps: true },
);

// const Post = model<IPost>('Post', postSchema);
// export default Post;
export default (mongoose.models?.Post as any) ||
  model<IPost>('Post', postSchema);
