import { ObjectId } from 'mongodb';
import mongoose, { Schema, model } from 'mongoose';

export interface ILike {
  _id: ObjectId;
  userId: ObjectId;
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
// export default (mongoose.models?.Like as any) ||
//   model<ILike>('Like', likeSchema);
