import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { IndexRoutes } from './routes';
import { notFound } from './middlewares/notFound';
import cookieParser from "cookie-parser";
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { WebhookPaymentController } from './modules/strip-webhook/WEbhookPayment.controller';


const app: Application = express();

// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "https://green-forge-gilt.vercel.app",
  process.env.PROD_APP_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) // || /^https:\/\/medi-store-pi.*\.vercel\.app$/.test(origin)

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(cors());
// parsers
app.use("/api/auth", toNodeHandler(auth))

app.use(express.json());

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.post("/webhook", express.raw({ type: "application/json" }), WebhookPaymentController.handleStripeWebhookEvent)

// application routes
app.use('/api/v1', IndexRoutes);




app.get('/', (req: Request, res: Response) => {
  res.send('Hello from green forge World.....');
});

app.use(globalErrorHandler)

app.use(notFound)




export default app;
