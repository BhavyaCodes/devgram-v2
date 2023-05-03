import { Schema, model } from 'mongoose';

interface IPost {
  content: string;
}

const postSchema = new Schema<IPost>(
  {
    content: { type: String, required: true },
  },
  { timestamps: true },
);

const Post = model<IPost>('Post', postSchema);

export default Post;
