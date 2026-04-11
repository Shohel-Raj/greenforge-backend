import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { envFile } from "../config/env";
import { PrismaClient } from "../generated/prisma/client";


const connectionString = envFile.DATABASE_URL

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }
