import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db_connection.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is ready');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
