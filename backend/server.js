import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('DB Connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Server is ready');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
