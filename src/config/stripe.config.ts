import Stripe from "stripe";
import { envFile } from "./env";

export const stripe = new Stripe(envFile.STRIPE.STRIPE_SECRET_KEY)