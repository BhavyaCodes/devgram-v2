import { ObjectId } from 'mongodb';
import mongoose, { Model, Schema, model } from 'mongoose';
import { IUser } from './User';

export interface IComment {
  _id: ObjectId;
  userId: IUser;
  postId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
// export default (mongoose.models?.Comment as Model<IComment>) ||
//   model<IComment>('Comment', commentSchema);
