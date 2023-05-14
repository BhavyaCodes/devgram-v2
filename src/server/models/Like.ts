import { ObjectId } from 'mongodb';
import mongoose, { Model, Schema, model } from 'mongoose';
import { IUser } from './User';

export interface ILike {
  _id: ObjectId;
  userId: IUser;
  postId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: true },
);

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Like = model<ILike>('Like', likeSchema);
export default Like;
// export default (mongoose.models?.Like as Model<ILike>) ||
//   model<ILike>('Like', likeSchema);
