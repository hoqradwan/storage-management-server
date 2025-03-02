import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  // origin: 'http://localhost:3000', // Frontend URL
  origin: 'https://cash-tracker0.web.app',
  credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is on!');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
