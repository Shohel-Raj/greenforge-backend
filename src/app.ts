import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { IndexRoutes } from './routes';
import { notFound } from './middlewares/notFound';
import cookieParser from "cookie-parser";
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { PaymentController } from './modules/payment/payment.controller';


const app: Application = express();
app.use(cors());
// parsers
app.use("/api/auth", toNodeHandler(auth))

app.use(express.json());

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)

// application routes
app.use('/api/v1', IndexRoutes);




app.get('/', (req: Request, res: Response) => {
  res.send('Hello from green forge World.....');
});

app.use(globalErrorHandler)

app.use(notFound)




export default app;
