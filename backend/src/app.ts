import express, { Application } from 'express';
import dotenv from 'dotenv';
import routes from './routes'
import mongoose from 'mongoose'
import cors from 'cors';
import { errorHandler } from './middleware/error_middleware';

dotenv.config();

const app: Application = express();

mongoose.connect(process.env.MONGO_URI)

app.use(express.json());
app.use(cors())

app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

// Error handling middleware should be the last middleware added
app.use(errorHandler)

export default app;