import mongoose from 'mongoose';

const dbConnect = async () => {
  mongoose
    .connect('mongodb://127.0.0.1:27017/test')
    .then(() => console.log('Connected to database'));
};

export default dbConnect;
