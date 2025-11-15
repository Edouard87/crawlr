import express, { Application } from 'express';
import dotenv from 'dotenv';
import routes from './routes'
import mongoose from 'mongoose'

dotenv.config();

const app: Application = express();

mongoose.connect(process.env.MONGO_URI)

app.use(express.json());

app.use("/api", routes);

export default app;