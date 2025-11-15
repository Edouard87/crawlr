import express, { Application } from 'express';
import dotenv from 'dotenv';
import routes from './routes'
import mongoose from 'mongoose'
import cors from 'cors';

dotenv.config();

const app: Application = express();

mongoose.connect(process.env.MONGO_URI)

app.use(express.json());
app.use(cors())

app.use("/api", routes);

export default app;