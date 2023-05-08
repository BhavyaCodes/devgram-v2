import mongoose, { Model, Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUser } from './User';

export interface ISession {
  _id: ObjectId;
  userId: IUser;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
  },

  { timestamps: true },
);

const Session = model<ISession>('Session', sessionSchema);
export default Session;
// export default (mongoose.models?.Session as Model<ISession>) ||
//   model<ISession>('Session', sessionSchema);
