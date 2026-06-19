import express, { Request, Response } from 'express';
import rootRoutes from './routes/rootRoutes';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware';
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// A simple route to test the server is running
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Flowlit!');
});

app.use('/api/v1', rootRoutes);

// Global error handler
app.use(errorHandler);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});