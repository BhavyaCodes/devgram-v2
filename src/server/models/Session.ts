import mongoose, { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';

interface ISession {
  userId: ObjectId;
  token: string;
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
// export default (mongoose.models?.Session as any) ||
//   model<ISession>('Session', sessionSchema);
