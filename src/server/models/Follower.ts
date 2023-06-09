import { ObjectId } from 'mongodb';
import mongoose, { Model, Schema, model } from 'mongoose';
import { IUser } from './User';

export interface IFollower {
  _id: ObjectId;
  followerId: IUser;
  userId: IUser;
}

const followerSchema = new Schema<IFollower>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

followerSchema.index({ userId: 1, followerId: 1 }, { unique: true });

const Follower = model<IFollower>('Follower', followerSchema);
export default Follower;
// export default (mongoose.models?.Follower as Model<IFollower>) ||
//   model<IFollower>('Follower', followerSchema);
