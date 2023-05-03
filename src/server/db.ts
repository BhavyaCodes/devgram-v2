import mongoose from 'mongoose';
import { env } from './env';

const dbConnect = async () => {
  mongoose
    .connect(env.DATABASE_URL)
    .then(() => console.log('Connected to database'));
};

export default dbConnect;
