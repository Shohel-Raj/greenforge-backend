// src/app.ts
import express7 from "express";
import cors from "cors";

// src/middlewares/globalErrorHandler.ts
import status3 from "http-status";

// src/config/env.ts
import dotenv from "dotenv";
import status from "http-status";

// src/errors/AppError.ts
var AppError = class extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/config/env.ts
dotenv.config();
var loadEnvVariables = () => {
  const requireEnvVariable = [
    "PORT",
    "DATABASE_URL",
    "NODE_ENV",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "FRONTEND_URL",
    "ACCESS_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_SECRET",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "ADMIN_PASSWORD",
    "ADMIN_EMAIL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET"
  ];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but not set in .env file.`
      );
    }
  });
  return {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    },
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    },
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
  };
};
var envFile = loadEnvVariables();

// src/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
import status2 from "http-status";
cloudinary.config({
  cloud_name: envFile.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envFile.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envFile.CLOUDINARY.CLOUDINARY_API_SECRET
});
var deleteFileFromCloudinary = async (url) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image"
        }
      );
      console.log(`File ${publicId} deleted from cloudinary`);
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new AppError_default(status2.INTERNAL_SERVER_ERROR, "Failed to delete file from Cloudinary");
  }
};
var cloudinaryUpload = cloudinary;

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (envFile.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  if (req.file) {
    await deleteFileFromCloudinary(req.file.path);
  }
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imageUrls = req.files.map((file) => file.path);
    await Promise.all(imageUrls.map((url) => deleteFileFromCloudinary(url)));
  }
  let errorSources = [];
  let statusCode = status3.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status3.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    error: envFile.NODE_ENV === "development" ? err : void 0,
    stack: envFile.NODE_ENV === "development" ? stack : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/routes/index.ts
import { Router as Router3 } from "express";

// src/modules/Auth/auth.route.ts
import { Router } from "express";

// src/shared/nextRes.ts
var nextRes = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/Auth/auth.controller.ts
import ms from "ms";

// src/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/modules/Auth/auth.controller.ts
import status6 from "http-status";

// src/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envFile.ACCESS_TOKEN_SECRET,
    { expiresIn: envFile.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envFile.REFRESH_TOKEN_SECRET,
    { expiresIn: envFile.REFRESH_TOKEN_EXPIRES_IN }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7d
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/modules/Auth/auth.service.ts
import status5 from "http-status";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.6.0",
  "engineVersion": "75cbdc1eb7150937890ad5465d861175c6624711",
  "activeProvider": "postgresql",
  "inlineSchema": 'model Admin {\n  id            String   @id @default(uuid(7))\n  name          String\n  email         String   @unique\n  profilePhoto  String?\n  contactNumber String?\n  createdAt     DateTime @default(now())\n  gender        Gender\n  updatedAt     DateTime @updatedAt\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@map("admins")\n}\n\nmodel User {\n  id            String     @id\n  name          String\n  email         String\n  emailVerified Boolean    @default(false)\n  image         String?\n  sessions      Session[]\n  accounts      Account[]\n  role          Role       @default(MEMBER)\n  status        UserStatus @default(ACTIVE)\n  member        member?\n  admin         Admin?\n\n  votes     Vote[]\n  comments  Comment[]\n  payments  Payment[]\n  watchlist Watchlist[]\n  catagory  Category[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Category {\n  id   String @id @default(uuid(7))\n  name String @unique\n\n  createdAt DateTime @default(now())\n\n  // relations\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  // relations\n  ideas Idea[]\n\n  @@map("categories")\n}\n\nmodel Comment {\n  id String @id @default(uuid(7))\n\n  content String\n  rating  Int?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // relations\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  ideaId String\n  idea   Idea   @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n\n  // nested comment\n  parentId String?\n  parent   Comment?  @relation("CommentToReply", fields: [parentId], references: [id])\n  replies  Comment[] @relation("CommentToReply")\n\n  @@index([ideaId])\n  @@index([parentId])\n  @@map("comments")\n}\n\nenum Role {\n  ADMIN\n  MEMBER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum IdeaStatus {\n  UNDER_REVIEW\n  APPROVED\n  REJECTED\n  DRAFT\n}\n\nenum VoteType {\n  UP\n  DOWN\n}\n\nenum PaymentStatus {\n  PENDING\n  SUCCESS\n  FAILED\n}\n\nmodel Idea {\n  id String @id @default(uuid(7))\n\n  title            String\n  problemStatement String\n  solution         String\n  description      String\n  image            String?\n\n  isPaid    Boolean @default(false)\n  price     Float?\n  isDeleted Boolean @default(false)\n\n  status     IdeaStatus @default(UNDER_REVIEW)\n  feedback   String?\n  isfeatures Boolean    @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // relations\n  memberId String\n  member   member @relation(fields: [memberId], references: [id], onDelete: Cascade)\n\n  categoryId String\n  category   Category @relation(fields: [categoryId], references: [id])\n\n  votes     Vote[]\n  comments  Comment[]\n  payments  Payment[]\n  watchlist Watchlist[]\n\n  @@map("ideas")\n}\n\nmodel member {\n  id String @id @default(uuid(7))\n\n  name          String\n  email         String   @unique\n  profilePhoto  String?\n  contactNumber String?\n  address       String?\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n  gender        Gender?\n\n  //relations\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n  idea   Idea[]\n\n  @@index([email], name: "idx_member_email")\n  @@map("member")\n}\n\nmodel Newsletter {\n  id    String @id @default(uuid(7))\n  email String @unique\n\n  createdAt DateTime @default(now())\n\n  @@map("newsletter")\n}\n\nmodel Payment {\n  id String @id @default(uuid(7))\n\n  amount Float\n  status PaymentStatus @default(PENDING)\n\n  transactionId      String   @unique\n  stripeEventId      String?  @unique\n  paymentGatewayData Json?\n  updatedAt          DateTime @updatedAt\n\n  createdAt DateTime @default(now())\n\n  // relations\n  userId String\n  user   User   @relation(fields: [userId], references: [id])\n\n  ideaId String\n  idea   Idea   @relation(fields: [ideaId], references: [id])\n\n  @@unique([userId, ideaId]) // user buys once per idea\n  @@index([ideaId])\n  @@index([transactionId])\n  @@map("payments")\n}\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Vote {\n  id String @id @default(uuid(7))\n\n  type VoteType\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  ideaId String\n  idea   Idea   @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n\n  @@unique([userId, ideaId]) // one vote per user per idea\n  @@index([ideaId])\n  @@index([userId])\n  @@map("votes")\n}\n\nmodel Watchlist {\n  id String @id @default(uuid(7))\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id])\n\n  ideaId String\n  idea   Idea   @relation(fields: [ideaId], references: [id])\n\n  createdAt DateTime @default(now())\n\n  @@unique([userId, ideaId])\n  @@map("watchlist")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"member","kind":"object","type":"member","relationName":"UserTomember"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"},{"name":"votes","kind":"object","type":"Vote","relationName":"UserToVote"},{"name":"comments","kind":"object","type":"Comment","relationName":"CommentToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"watchlist","kind":"object","type":"Watchlist","relationName":"UserToWatchlist"},{"name":"catagory","kind":"object","type":"Category","relationName":"CategoryToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CategoryToUser"},{"name":"ideas","kind":"object","type":"Idea","relationName":"CategoryToIdea"}],"dbName":"categories"},"Comment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CommentToUser"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"CommentToIdea"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"parent","kind":"object","type":"Comment","relationName":"CommentToReply"},{"name":"replies","kind":"object","type":"Comment","relationName":"CommentToReply"}],"dbName":"comments"},"Idea":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"problemStatement","kind":"scalar","type":"String"},{"name":"solution","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"isPaid","kind":"scalar","type":"Boolean"},{"name":"price","kind":"scalar","type":"Float"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"status","kind":"enum","type":"IdeaStatus"},{"name":"feedback","kind":"scalar","type":"String"},{"name":"isfeatures","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"memberId","kind":"scalar","type":"String"},{"name":"member","kind":"object","type":"member","relationName":"IdeaTomember"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToIdea"},{"name":"votes","kind":"object","type":"Vote","relationName":"IdeaToVote"},{"name":"comments","kind":"object","type":"Comment","relationName":"CommentToIdea"},{"name":"payments","kind":"object","type":"Payment","relationName":"IdeaToPayment"},{"name":"watchlist","kind":"object","type":"Watchlist","relationName":"IdeaToWatchlist"}],"dbName":"ideas"},"member":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserTomember"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaTomember"}],"dbName":"member"},"Newsletter":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"newsletter"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToPayment"}],"dbName":"payments"},"Vote":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"VoteType"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserToVote"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToVote"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"votes"},"Watchlist":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserToWatchlist"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToWatchlist"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"watchlist"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","member","ideas","_count","category","idea","votes","parent","replies","comments","payments","watchlist","admin","catagory","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","data","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","create","update","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","having","_min","_max","Admin.groupBy","Admin.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Comment.findUnique","Comment.findUniqueOrThrow","Comment.findFirst","Comment.findFirstOrThrow","Comment.findMany","Comment.createOne","Comment.createMany","Comment.createManyAndReturn","Comment.updateOne","Comment.updateMany","Comment.updateManyAndReturn","Comment.upsertOne","Comment.deleteOne","Comment.deleteMany","_avg","_sum","Comment.groupBy","Comment.aggregate","Idea.findUnique","Idea.findUniqueOrThrow","Idea.findFirst","Idea.findFirstOrThrow","Idea.findMany","Idea.createOne","Idea.createMany","Idea.createManyAndReturn","Idea.updateOne","Idea.updateMany","Idea.updateManyAndReturn","Idea.upsertOne","Idea.deleteOne","Idea.deleteMany","Idea.groupBy","Idea.aggregate","member.findUnique","member.findUniqueOrThrow","member.findFirst","member.findFirstOrThrow","member.findMany","member.createOne","member.createMany","member.createManyAndReturn","member.updateOne","member.updateMany","member.updateManyAndReturn","member.upsertOne","member.deleteOne","member.deleteMany","member.groupBy","member.aggregate","Newsletter.findUnique","Newsletter.findUniqueOrThrow","Newsletter.findFirst","Newsletter.findFirstOrThrow","Newsletter.findMany","Newsletter.createOne","Newsletter.createMany","Newsletter.createManyAndReturn","Newsletter.updateOne","Newsletter.updateMany","Newsletter.updateManyAndReturn","Newsletter.upsertOne","Newsletter.deleteOne","Newsletter.deleteMany","Newsletter.groupBy","Newsletter.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Vote.findUnique","Vote.findUniqueOrThrow","Vote.findFirst","Vote.findFirstOrThrow","Vote.findMany","Vote.createOne","Vote.createMany","Vote.createManyAndReturn","Vote.updateOne","Vote.updateMany","Vote.updateManyAndReturn","Vote.upsertOne","Vote.deleteOne","Vote.deleteMany","Vote.groupBy","Vote.aggregate","Watchlist.findUnique","Watchlist.findUniqueOrThrow","Watchlist.findFirst","Watchlist.findFirstOrThrow","Watchlist.findMany","Watchlist.createOne","Watchlist.createMany","Watchlist.createManyAndReturn","Watchlist.updateOne","Watchlist.updateMany","Watchlist.updateManyAndReturn","Watchlist.upsertOne","Watchlist.deleteOne","Watchlist.deleteMany","Watchlist.groupBy","Watchlist.aggregate","AND","OR","NOT","id","userId","ideaId","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","VoteType","type","amount","PaymentStatus","status","transactionId","stripeEventId","paymentGatewayData","updatedAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","email","name","profilePhoto","contactNumber","address","Gender","gender","every","some","none","title","problemStatement","solution","description","image","isPaid","price","isDeleted","IdeaStatus","feedback","isfeatures","memberId","categoryId","content","rating","parentId","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","emailVerified","Role","role","UserStatus","userId_ideaId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "2wZ00AENAwAAiwMAIOsBAAC7AwAw7AEAACsAEO0BAAC7AwAw7gEBAAAAAe8BAQAAAAHxAUAAgwMAIYUCQACDAwAhjAIBAAAAAY0CAQCCAwAhjgIBAIkDACGPAgEAiQMAIZICAAC8A5ICIgEAAAABACAMAwAAiwMAIOsBAADSAwAw7AEAAAMAEO0BAADSAwAw7gEBAIIDACHvAQEAggMAIfEBQACDAwAhhQJAAIMDACGoAkAAgwMAIbICAQCCAwAhswIBAIkDACG0AgEAiQMAIQMDAADXBAAgswIAAOQDACC0AgAA5AMAIAwDAACLAwAg6wEAANIDADDsAQAAAwAQ7QEAANIDADDuAQEAAAAB7wEBAIIDACHxAUAAgwMAIYUCQACDAwAhqAJAAIMDACGyAgEAAAABswIBAIkDACG0AgEAiQMAIQMAAAADACABAAAEADACAAAFACARAwAAiwMAIOsBAADQAwAw7AEAAAcAEO0BAADQAwAw7gEBAIIDACHvAQEAggMAIfEBQACDAwAhhQJAAIMDACGpAgEAggMAIaoCAQCCAwAhqwIBAIkDACGsAgEAiQMAIa0CAQCJAwAhrgJAANEDACGvAkAA0QMAIbACAQCJAwAhsQIBAIkDACEIAwAA1wQAIKsCAADkAwAgrAIAAOQDACCtAgAA5AMAIK4CAADkAwAgrwIAAOQDACCwAgAA5AMAILECAADkAwAgEQMAAIsDACDrAQAA0AMAMOwBAAAHABDtAQAA0AMAMO4BAQAAAAHvAQEAggMAIfEBQACDAwAhhQJAAIMDACGpAgEAggMAIaoCAQCCAwAhqwIBAIkDACGsAgEAiQMAIa0CAQCJAwAhrgJAANEDACGvAkAA0QMAIbACAQCJAwAhsQIBAIkDACEDAAAABwAgAQAACAAwAgAACQAgDwMAAIsDACAKAACMAwAg6wEAAIgDADDsAQAACwAQ7QEAAIgDADDuAQEAggMAIe8BAQCCAwAh8QFAAIMDACGFAkAAgwMAIYwCAQCCAwAhjQIBAIIDACGOAgEAiQMAIY8CAQCJAwAhkAIBAIkDACGSAgAAigOSAiMBAAAACwAgGQYAAM4DACAJAADPAwAgCwAAsQMAIA4AALIDACAPAACzAwAgEAAAtAMAIOsBAADLAwAw7AEAAA0AEO0BAADLAwAw7gEBAIIDACHxAUAAgwMAIYECAADNA58CIoUCQACDAwAhlgIBAIIDACGXAgEAggMAIZgCAQCCAwAhmQIBAIIDACGaAgEAiQMAIZsCIACqAwAhnAIIAMwDACGdAiAAqgMAIZ8CAQCJAwAhoAIgAKoDACGhAgEAggMAIaICAQCCAwAhCQYAAO8FACAJAAD9BQAgCwAA8QUAIA4AAPIFACAPAADzBQAgEAAA9AUAIJoCAADkAwAgnAIAAOQDACCfAgAA5AMAIBkGAADOAwAgCQAAzwMAIAsAALEDACAOAACyAwAgDwAAswMAIBAAALQDACDrAQAAywMAMOwBAAANABDtAQAAywMAMO4BAQAAAAHxAUAAgwMAIYECAADNA58CIoUCQACDAwAhlgIBAIIDACGXAgEAggMAIZgCAQCCAwAhmQIBAIIDACGaAgEAiQMAIZsCIACqAwAhnAIIAMwDACGdAiAAqgMAIZ8CAQCJAwAhoAIgAKoDACGhAgEAggMAIaICAQCCAwAhAwAAAA0AIAEAAA4AMAIAAA8AIAMAAAANACABAAAOADACAAAPACABAAAADQAgCgMAAIsDACAKAAC_AwAg6wEAAMkDADDsAQAAEwAQ7QEAAMkDADDuAQEAggMAIe8BAQCCAwAh8AEBAIIDACHxAUAAgwMAIf4BAADKA_4BIgIDAADXBAAgCgAA-wUAIAsDAACLAwAgCgAAvwMAIOsBAADJAwAw7AEAABMAEO0BAADJAwAw7gEBAAAAAe8BAQCCAwAh8AEBAIIDACHxAUAAgwMAIf4BAADKA_4BIrkCAADIAwAgAwAAABMAIAEAABQAMAIAABUAIA8DAACLAwAgCgAAvwMAIAwAAMcDACANAACyAwAg6wEAAMUDADDsAQAAFwAQ7QEAAMUDADDuAQEAggMAIe8BAQCCAwAh8AEBAIIDACHxAUAAgwMAIYUCQACDAwAhowIBAIIDACGkAgIAxgMAIaUCAQCJAwAhBgMAANcEACAKAAD7BQAgDAAA_AUAIA0AAPIFACCkAgAA5AMAIKUCAADkAwAgDwMAAIsDACAKAAC_AwAgDAAAxwMAIA0AALIDACDrAQAAxQMAMOwBAAAXABDtAQAAxQMAMO4BAQAAAAHvAQEAggMAIfABAQCCAwAh8QFAAIMDACGFAkAAgwMAIaMCAQCCAwAhpAICAMYDACGlAgEAiQMAIQMAAAAXACABAAAYADACAAAZACABAAAAFwAgAwAAABcAIAEAABgAMAIAABkAIAEAAAAXACAPAwAAiwMAIAoAAL8DACDrAQAAwQMAMOwBAAAeABDtAQAAwQMAMO4BAQCCAwAh7wEBAIIDACHwAQEAggMAIfEBQACDAwAh_wEIAMIDACGBAgAAwwOBAiKCAgEAggMAIYMCAQCJAwAhhAIAAMQDACCFAkAAgwMAIQQDAADXBAAgCgAA-wUAIIMCAADkAwAghAIAAOQDACAQAwAAiwMAIAoAAL8DACDrAQAAwQMAMOwBAAAeABDtAQAAwQMAMO4BAQAAAAHvAQEAggMAIfABAQCCAwAh8QFAAIMDACH_AQgAwgMAIYECAADDA4ECIoICAQAAAAGDAgEAAAABhAIAAMQDACCFAkAAgwMAIbkCAADAAwAgAwAAAB4AIAEAAB8AMAIAACAAIAkDAACLAwAgCgAAvwMAIOsBAAC-AwAw7AEAACIAEO0BAAC-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_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_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_QEAMAEYAAD9AQAwDAMAAPgDACAKAAD5AwAg7gEBANYDACHvAQEA1gMAIfEBQADXAwAhhQJAANcDACGMAgEA1gMAIY0CAQDWAwAhjgIBAOwDACGPAgEA7AMAIZACAQDsAwAhkgIAAPcDkgIjAgAAAPQBACAYAACAAgAgCu4BAQDWAwAh7wEBANYDACHxAUAA1wMAIYUCQADXAwAhjAIBANYDACGNAgEA1gMAIY4CAQDsAwAhjwIBAOwDACGQAgEA7AMAIZICAAD3A5ICIwIAAAALACAYAACCAgAgAgAAAAsAIBgAAIICACADAAAA9AEAIB8AAPsBACAgAACAAgAgAQAAAPQBACABAAAACwAgBwgAAPQDACAlAAD2AwAgJgAA9QMAII4CAADkAwAgjwIAAOQDACCQAgAA5AMAIJICAADkAwAgDesBAACEAwAw7AEAAIkCABDtAQAAhAMAMO4BAQDoAgAh7wEBAOgCACHxAUAA6QIAIYUCQADpAgAhjAIBAOgCACGNAgEA6AIAIY4CAQD2AgAhjwIBAPYCACGQAgEA9gIAIZICAACFA5ICIwMAAAALACABAACIAgAwJAAAiQIAIAMAAAALACABAAD3AQAwAgAA9AEAIAbrAQAAgQMAMOwBAACPAgAQ7QEAAIEDADDuAQEAAAAB8QFAAIMDACGMAgEAAAABAQAAAIwCACABAAAAjAIAIAbrAQAAgQMAMOwBAACPAgAQ7QEAAIEDADDuAQEAggMAIfEBQACDAwAhjAIBAIIDACEAAwAAAI8CACABAACQAgAwAgAAjAIAIAMAAACPAgAgAQAAkAIAMAIAAIwCACADAAAAjwIAIAEAAJACADACAACMAgAgA-4BAQAAAAHxAUAAAAABjAIBAAAAAQEYAACUAgAgA-4BAQAAAAHxAUAAAAABjAIBAAAAAQEYAACWAgAwARgAAJYCADAD7gEBANYDACHxAUAA1wMAIYwCAQDWAwAhAgAAAIwCACAYAACZAgAgA-4BAQDWAwAh8QFAANcDACGMAgEA1gMAIQIAAACPAgAgGAAAmwIAIAIAAACPAgAgGAAAmwIAIAMAAACMAgAgHwAAlAIAICAAAJkCACABAAAAjAIAIAEAAACPAgAgAwgAAPEDACAlAADzAwAgJgAA8gMAIAbrAQAAgAMAMOwBAACiAgAQ7QEAAIADADDuAQEA6AIAIfEBQADpAgAhjAIBAOgCACEDAAAAjwIAIAEAAKECADAkAACiAgAgAwAAAI8CACABAACQAgAwAgAAjAIAIAEAAAAgACABAAAAIAAgAwAAAB4AIAEAAB8AMAIAACAAIAMAAAAeACABAAAfADACAAAgACADAAAAHgAgAQAAHwAwAgAAIAAgDAMAAO8DACAKAADwAwAg7gEBAAAAAe8BAQAAAAHwAQEAAAAB8QFAAAAAAf8BCAAAAAGBAgAAAIECAoICAQAAAAGDAgEAAAABhAKAAAAAAYUCQAAAAAEBGAAAqgIAIAruAQEAAAAB7wEBAAAAAfABAQAAAAHxAUAAAAAB_wEIAAAAAYECAAAAgQICggIBAAAAAYMCAQAAAAGEAoAAAAABhQJAAAAAAQEYAACsAgAwARgAAKwCADAMAwAA7QMAIAoAAO4DACDuAQEA1gMAIe8BAQDWAwAh8AEBANYDACHxAUAA1wMAIf8BCADqAwAhgQIAAOsDgQIiggIBANYDACGDAgEA7AMAIYQCgAAAAAGFAkAA1wMAIQIAAAAgACAYAACvAgAgCu4BAQDWAwAh7wEBANYDACHwAQEA1gMAIfEBQADXAwAh_wEIAOoDACGBAgAA6wOBAiKCAgEA1gMAIYMCAQDsAwAhhAKAAAAAAYUCQADXAwAhAgAAAB4AIBgAALECACACAAAAHgAgGAAAsQIAIAMAAAAgACAfAACqAgAgIAAArwIAIAEAAAAgACABAAAAHgAgBwgAAOUDACAlAADoAwAgJgAA5wMAIIcBAADmAwAgiAEAAOkDACCDAgAA5AMAIIQCAADkAwAgDesBAADzAgAw7AEAALgCABDtAQAA8wIAMO4BAQDoAgAh7wEBAOgCACHwAQEA6AIAIfEBQADpAgAh_wEIAPQCACGBAgAA9QKBAiKCAgEA6AIAIYMCAQD2AgAhhAIAAPcCACCFAkAA6QIAIQMAAAAeACABAAC3AgAwJAAAuAIAIAMAAAAeACABAAAfADACAAAgACABAAAAFQAgAQAAABUAIAMAAAATACABAAAUADACAAAVACADAAAAEwAgAQAAFAAwAgAAFQAgAwAAABMAIAEAABQAMAIAABUAIAcDAADiAwAgCgAA4wMAIO4BAQAAAAHvAQEAAAAB8AEBAAAAAfEBQAAAAAH-AQAAAP4BAgEYAADAAgAgBe4BAQAAAAHvAQEAAAAB8AEBAAAAAfEBQAAAAAH-AQAAAP4BAgEYAADCAgAwARgAAMICADAHAwAA4AMAIAoAAOEDACDuAQEA1gMAIe8BAQDWAwAh8AEBANYDACHxAUAA1wMAIf4BAADfA_4BIgIAAAAVACAYAADFAgAgBe4BAQDWAwAh7wEBANYDACHwAQEA1gMAIfEBQADXAwAh_gEAAN8D_gEiAgAAABMAIBgAAMcCACACAAAAEwAgGAAAxwIAIAMAAAAVACAfAADAAgAgIAAAxQIAIAEAAAAVACABAAAAEwAgAwgAANwDACAlAADeAwAgJgAA3QMAIAjrAQAA7wIAMOwBAADOAgAQ7QEAAO8CADDuAQEA6AIAIe8BAQDoAgAh8AEBAOgCACHxAUAA6QIAIf4BAADwAv4BIgMAAAATACABAADNAgAwJAAAzgIAIAMAAAATACABAAAUADACAAAVACABAAAAJAAgAQAAACQAIAMAAAAiACABAAAjADACAAAkACADAAAAIgAgAQAAIwAwAgAAJAAgAwAAACIAIAEAACMAMAIAACQAIAYDAADaAwAgCgAA2wMAIO4BAQAAAAHvAQEAAAAB8AEBAAAAAfEBQAAAAAEBGAAA1gIAIATuAQEAAAAB7wEBAAAAAfABAQAAAAHxAUAAAAABARgAANgCADABGAAA2AIAMAYDAADYAwAgCgAA2QMAIO4BAQDWAwAh7wEBANYDACHwAQEA1gMAIfEBQADXAwAhAgAAACQAIBgAANsCACAE7gEBANYDACHvAQEA1gMAIfABAQDWAwAh8QFAANcDACECAAAAIgAgGAAA3QIAIAIAAAAiACAYAADdAgAgAwAAACQAIB8AANYCACAgAADbAgAgAQAAACQAIAEAAAAiACADCAAA0wMAICUAANUDACAmAADUAwAgB-sBAADnAgAw7AEAAOQCABDtAQAA5wIAMO4BAQDoAgAh7wEBAOgCACHwAQEA6AIAIfEBQADpAgAhAwAAACIAIAEAAOMCADAkAADkAgAgAwAAACIAIAEAACMAMAIAACQAIAfrAQAA5wIAMOwBAADkAgAQ7QEAAOcCADDuAQEA6AIAIe8BAQDoAgAh8AEBAOgCACHxAUAA6QIAIQ4IAADrAgAgJQAA7gIAICYAAO4CACDyAQEAAAAB8wEBAAAABPQBAQAAAAT1AQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBAO0CACH6AQEAAAAB-wEBAAAAAfwBAQAAAAELCAAA6wIAICUAAOwCACAmAADsAgAg8gFAAAAAAfMBQAAAAAT0AUAAAAAE9QFAAAAAAfYBQAAAAAH3AUAAAAAB-AFAAAAAAfkBQADqAgAhCwgAAOsCACAlAADsAgAgJgAA7AIAIPIBQAAAAAHzAUAAAAAE9AFAAAAABPUBQAAAAAH2AUAAAAAB9wFAAAAAAfgBQAAAAAH5AUAA6gIAIQjyAQIAAAAB8wECAAAABPQBAgAAAAT1AQIAAAAB9gECAAAAAfcBAgAAAAH4AQIAAAAB-QECAOsCACEI8gFAAAAAAfMBQAAAAAT0AUAAAAAE9QFAAAAAAfYBQAAAAAH3AUAAAAAB-AFAAAAAAfkBQADsAgAhDggAAOsCACAlAADuAgAgJgAA7gIAIPIBAQAAAAHzAQEAAAAE9AEBAAAABPUBAQAAAAH2AQEAAAAB9wEBAAAAAfgBAQAAAAH5AQEA7QIAIfoBAQAAAAH7AQEAAAAB_AEBAAAAAQvyAQEAAAAB8wEBAAAABPQBAQAAAAT1AQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBAO4CACH6AQEAAAAB-wEBAAAAAfwBAQAAAAEI6wEAAO8CADDsAQAAzgIAEO0BAADvAgAw7gEBAOgCACHvAQEA6AIAIfABAQDoAgAh8QFAAOkCACH-AQAA8AL-ASIHCAAA6wIAICUAAPICACAmAADyAgAg8gEAAAD-AQLzAQAAAP4BCPQBAAAA_gEI-QEAAPEC_gEiBwgAAOsCACAlAADyAgAgJgAA8gIAIPIBAAAA_gEC8wEAAAD-AQj0AQAAAP4BCPkBAADxAv4BIgTyAQAAAP4BAvMBAAAA_gEI9AEAAAD-AQj5AQAA8gL-ASIN6wEAAPMCADDsAQAAuAIAEO0BAADzAgAw7gEBAOgCACHvAQEA6AIAIfABAQDoAgAh8QFAAOkCACH_AQgA9AIAIYECAAD1AoECIoICAQDoAgAhgwIBAPYCACGEAgAA9wIAIIUCQADpAgAhDQgAAOsCACAlAAD_AgAgJgAA_wIAIIcBAAD_AgAgiAEAAP8CACDyAQgAAAAB8wEIAAAABPQBCAAAAAT1AQgAAAAB9gEIAAAAAfcBCAAAAAH4AQgAAAAB-QEIAP4CACEHCAAA6wIAICUAAP0CACAmAAD9AgAg8gEAAACBAgLzAQAAAIECCPQBAAAAgQII-QEAAPwCgQIiDggAAPgCACAlAAD7AgAgJgAA-wIAIPIBAQAAAAHzAQEAAAAF9AEBAAAABfUBAQAAAAH2AQEAAAAB9wEBAAAAAfgBAQAAAAH5AQEA-gIAIfoBAQAAAAH7AQEAAAAB_AEBAAAAAQ8IAAD4AgAgJQAA-QIAICYAAPkCACDyAYAAAAAB9QGAAAAAAfYBgAAAAAH3AYAAAAAB-AGAAAAAAfkBgAAAAAGGAgEAAAABhwIBAAAAAYgCAQAAAAGJAoAAAAABigKAAAAAAYsCgAAAAAEI8gECAAAAAfMBAgAAAAX0AQIAAAAF9QECAAAAAfYBAgAAAAH3AQIAAAAB-AECAAAAAfkBAgD4AgAhDPIBgAAAAAH1AYAAAAAB9gGAAAAAAfcBgAAAAAH4AYAAAAAB-QGAAAAAAYYCAQAAAAGHAgEAAAABiAIBAAAAAYkCgAAAAAGKAoAAAAABiwKAAAAAAQ4IAAD4AgAgJQAA-wIAICYAAPsCACDyAQEAAAAB8wEBAAAABfQBAQAAAAX1AQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBAPoCACH6AQEAAAAB-wEBAAAAAfwBAQAAAAEL8gEBAAAAAfMBAQAAAAX0AQEAAAAF9QEBAAAAAfYBAQAAAAH3AQEAAAAB-AEBAAAAAfkBAQD7AgAh-gEBAAAAAfsBAQAAAAH8AQEAAAABBwgAAOsCACAlAAD9AgAgJgAA_QIAIPIBAAAAgQIC8wEAAACBAgj0AQAAAIECCPkBAAD8AoECIgTyAQAAAIECAvMBAAAAgQII9AEAAACBAgj5AQAA_QKBAiINCAAA6wIAICUAAP8CACAmAAD_AgAghwEAAP8CACCIAQAA_wIAIPIBCAAAAAHzAQgAAAAE9AEIAAAABPUBCAAAAAH2AQgAAAAB9wEIAAAAAfgBCAAAAAH5AQgA_gIAIQjyAQgAAAAB8wEIAAAABPQBCAAAAAT1AQgAAAAB9gEIAAAAAfcBCAAAAAH4AQgAAAAB-QEIAP8CACEG6wEAAIADADDsAQAAogIAEO0BAACAAwAw7gEBAOgCACHxAUAA6QIAIYwCAQDoAgAhBusBAACBAwAw7AEAAI8CABDtAQAAgQMAMO4BAQCCAwAh8QFAAIMDACGMAgEAggMAIQvyAQEAAAAB8wEBAAAABPQBAQAAAAT1AQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBAO4CACH6AQEAAAAB-wEBAAAAAfwBAQAAAAEI8gFAAAAAAfMBQAAAAAT0AUAAAAAE9QFAAAAAAfYBQAAAAAH3AUAAAAAB-AFAAAAAAfkBQADsAgAhDesBAACEAwAw7AEAAIkCABDtAQAAhAMAMO4BAQDoAgAh7wEBAOgCACHxAUAA6QIAIYUCQADpAgAhjAIBAOgCACGNAgEA6AIAIY4CAQD2AgAhjwIBAPYCACGQAgEA9gIAIZICAACFA5ICIwcIAAD4AgAgJQAAhwMAICYAAIcDACDyAQAAAJICA_MBAAAAkgIJ9AEAAACSAgn5AQAAhgOSAiMHCAAA-AIAICUAAIcDACAmAACHAwAg8gEAAACSAgPzAQAAAJICCfQBAAAAkgIJ-QEAAIYDkgIjBPIBAAAAkgID8wEAAACSAgn0AQAAAJICCfkBAACHA5ICIw8DAACLAwAgCgAAjAMAIOsBAACIAwAw7AEAAAsAEO0BAACIAwAw7gEBAIIDACHvAQEAggMAIfEBQACDAwAhhQJAAIMDACGMAgEAggMAIY0CAQCCAwAhjgIBAIkDACGPAgEAiQMAIZACAQCJAwAhkgIAAIoDkgIjC_IBAQAAAAHzAQEAAAAF9AEBAAAABfUBAQAAAAH2AQEAAAAB9wEBAAAAAfgBAQAAAAH5AQEA-wIAIfoBAQAAAAH7AQEAAAAB_AEBAAAAAQTyAQAAAJICA_MBAAAAkgIJ9AEAAACSAgn5AQAAhwOSAiMXBAAArQMAIAUAAK4DACAGAACvAwAgCwAAsQMAIA4AALIDACAPAACzAwAgEAAAtAMAIBEAALADACASAAC1AwAg6wEAAKkDADDsAQAAVQAQ7QEAAKkDADDuAQEAggMAIfEBQACDAwAhgQIAAKwDuQIihQJAAIMDACGMAgEAggMAIY0CAQCCAwAhmgIBAIkDACG1AiAAqgMAIbcCAACrA7cCIroCAABVACC7AgAAVQAgA5MCAAANACCUAgAADQAglQIAAA0AIBPrAQAAjQMAMOwBAADxAQAQ7QEAAI0DADDuAQEA6AIAIfEBQADpAgAhgQIAAJADnwIihQJAAOkCACGWAgEA6AIAIZcCAQDoAgAhmAIBAOgCACGZAgEA6AIAIZoCAQD2AgAhmwIgAI4DACGcAggAjwMAIZ0CIACOAwAhnwIBAPYCACGgAiAAjgMAIaECAQDoAgAhogIBAOgCACEFCAAA6wIAICUAAJYDACAmAACWAwAg8gEgAAAAAfkBIACVAwAhDQgAAPgCACAlAACUAwAgJgAAlAMAIIcBAACUAwAgiAEAAJQDACDyAQgAAAAB8wEIAAAABfQBCAAAAAX1AQgAAAAB9gEIAAAAAfcBCAAAAAH4AQgAAAAB-QEIAJMDACEHCAAA6wIAICUAAJIDACAmAACSAwAg8gEAAACfAgLzAQAAAJ8CCPQBAAAAnwII-QEAAJEDnwIiBwgAAOsCACAlAACSAwAgJgAAkgMAIPIBAAAAnwIC8wEAAACfAgj0AQAAAJ8CCPkBAACRA58CIgTyAQAAAJ8CAvMBAAAAnwII9AEAAACfAgj5AQAAkgOfAiINCAAA-AIAICUAAJQDACAmAACUAwAghwEAAJQDACCIAQAAlAMAIPIBCAAAAAHzAQgAAAAF9AEIAAAABfUBCAAAAAH2AQgAAAAB9wEIAAAAAfgBCAAAAAH5AQgAkwMAIQjyAQgAAAAB8wEIAAAABfQBCAAAAAX1AQgAAAAB9gEIAAAAAfcBCAAAAAH4AQgAAAAB-QEIAJQDACEFCAAA6wIAICUAAJYDACAmAACWAwAg8gEgAAAAAfkBIACVAwAhAvIBIAAAAAH5ASAAlgMAIQvrAQAAlwMAMOwBAADbAQAQ7QEAAJcDADDuAQEA6AIAIe8BAQDoAgAh8AEBAOgCACHxAUAA6QIAIYUCQADpAgAhowIBAOgCACGkAgIAmAMAIaUCAQD2AgAhDQgAAPgCACAlAAD4AgAgJgAA-AIAIIcBAACUAwAgiAEAAPgCACDyAQIAAAAB8wECAAAABfQBAgAAAAX1AQIAAAAB9gECAAAAAfcBAgAAAAH4AQIAAAAB-QECAJkDACENCAAA-AIAICUAAPgCACAmAAD4AgAghwEAAJQDACCIAQAA-AIAIPIBAgAAAAHzAQIAAAAF9AECAAAABfUBAgAAAAH2AQIAAAAB9wECAAAAAfgBAgAAAAH5AQIAmQMAIQfrAQAAmgMAMOwBAADDAQAQ7QEAAJoDADDuAQEA6AIAIe8BAQDoAgAh8QFAAOkCACGNAgEA6AIAIQnrAQAAmwMAMOwBAACtAQAQ7QEAAJsDADDuAQEA6AIAIfEBQADpAgAhhQJAAOkCACGmAgEA6AIAIacCAQDoAgAhqAJAAOkCACEJ6wEAAJwDADDsAQAAmgEAEO0BAACcAwAw7gEBAIIDACHxAUAAgwMAIYUCQACDAwAhpgIBAIIDACGnAgEAggMAIagCQACDAwAhEOsBAACdAwAw7AEAAJQBABDtAQAAnQMAMO4BAQDoAgAh7wEBAOgCACHxAUAA6QIAIYUCQADpAgAhqQIBAOgCACGqAgEA6AIAIasCAQD2AgAhrAIBAPYCACGtAgEA9gIAIa4CQACeAwAhrwJAAJ4DACGwAgEA9gIAIbECAQD2AgAhCwgAAPgCACAlAACgAwAgJgAAoAMAIPIBQAAAAAHzAUAAAAAF9AFAAAAABfUBQAAAAAH2AUAAAAAB9wFAAAAAAfgBQAAAAAH5AUAAnwMAIQsIAAD4AgAgJQAAoAMAICYAAKADACDyAUAAAAAB8wFAAAAABfQBQAAAAAX1AUAAAAAB9gFAAAAAAfcBQAAAAAH4AUAAAAAB-QFAAJ8DACEI8gFAAAAAAfMBQAAAAAX0AUAAAAAF9QFAAAAAAfYBQAAAAAH3AUAAAAAB-AFAAAAAAfkBQACgAwAhC-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-AwAw7AEAACIAEO0BAAC-AwAw7gEBAIIDACHvAQEAggMAIfABAQCCAwAh8QFAAIMDACEbBgAAzgMAIAkAAM8DACALAACxAwAgDgAAsgMAIA8AALMDACAQAAC0AwAg6wEAAMsDADDsAQAADQAQ7QEAAMsDADDuAQEAggMAIfEBQACDAwAhgQIAAM0DnwIihQJAAIMDACGWAgEAggMAIZcCAQCCAwAhmAIBAIIDACGZAgEAggMAIZoCAQCJAwAhmwIgAKoDACGcAggAzAMAIZ0CIACqAwAhnwIBAIkDACGgAiAAqgMAIaECAQCCAwAhogIBAIIDACG6AgAADQAguwIAAA0AIALvAQEAAAAB8AEBAAAAAQ8DAACLAwAgCgAAvwMAIOsBAADBAwAw7AEAAB4AEO0BAADBAwAw7gEBAIIDACHvAQEAggMAIfABAQCCAwAh8QFAAIMDACH_AQgAwgMAIYECAADDA4ECIoICAQCCAwAhgwIBAIkDACGEAgAAxAMAIIUCQACDAwAhCPIBCAAAAAHzAQgAAAAE9AEIAAAABPUBCAAAAAH2AQgAAAAB9wEIAAAAAfgBCAAAAAH5AQgA_wIAIQTyAQAAAIECAvMBAAAAgQII9AEAAACBAgj5AQAA_QKBAiIM8gGAAAAAAfUBgAAAAAH2AYAAAAAB9wGAAAAAAfgBgAAAAAH5AYAAAAABhgIBAAAAAYcCAQAAAAGIAgEAAAABiQKAAAAAAYoCgAAAAAGLAoAAAAABDwMAAIsDACAKAAC_AwAgDAAAxwMAIA0AALIDACDrAQAAxQMAMOwBAAAXABDtAQAAxQMAMO4BAQCCAwAh7wEBAIIDACHwAQEAggMAIfEBQACDAwAhhQJAAIMDACGjAgEAggMAIaQCAgDGAwAhpQIBAIkDACEI8gECAAAAAfMBAgAAAAX0AQIAAAAF9QECAAAAAfYBAgAAAAH3AQIAAAAB-AECAAAAAfkBAgD4AgAhEQMAAIsDACAKAAC_AwAgDAAAxwMAIA0AALIDACDrAQAAxQMAMOwBAAAXABDtAQAAxQMAMO4BAQCCAwAh7wEBAIIDACHwAQEAggMAIfEBQACDAwAhhQJAAIMDACGjAgEAggMAIaQCAgDGAwAhpQIBAIkDACG6AgAAFwAguwIAABcAIALvAQEAAAAB8AEBAAAAAQoDAACLAwAgCgAAvwMAIOsBAADJAwAw7AEAABMAEO0BAADJAwAw7gEBAIIDACHvAQEAggMAIfABAQCCAwAh8QFAAIMDACH-AQAAygP-ASIE8gEAAAD-AQLzAQAAAP4BCPQBAAAA_gEI-QEAAPIC_gEiGQYAAM4DACAJAADPAwAgCwAAsQMAIA4AALIDACAPAACzAwAgEAAAtAMAIOsBAADLAwAw7AEAAA0AEO0BAADLAwAw7gEBAIIDACHxAUAAgwMAIYECAADNA58CIoUCQACDAwAhlgIBAIIDACGXAgEAggMAIZgCAQCCAwAhmQIBAIIDACGaAgEAiQMAIZsCIACqAwAhnAIIAMwDACGdAiAAqgMAIZ8CAQCJAwAhoAIgAKoDACGhAgEAggMAIaICAQCCAwAhCPIBCAAAAAHzAQgAAAAF9AEIAAAABfUBCAAAAAH2AQgAAAAB9wEIAAAAAfgBCAAAAAH5AQgAlAMAIQTyAQAAAJ8CAvMBAAAAnwII9AEAAACfAgj5AQAAkgOfAiIRAwAAiwMAIAoAAIwDACDrAQAAiAMAMOwBAAALABDtAQAAiAMAMO4BAQCCAwAh7wEBAIIDACHxAUAAgwMAIYUCQACDAwAhjAIBAIIDACGNAgEAggMAIY4CAQCJAwAhjwIBAIkDACGQAgEAiQMAIZICAACKA5ICI7oCAAALACC7AgAACwAgCwMAAIsDACAHAACMAwAg6wEAALoDADDsAQAAMQAQ7QEAALoDADDuAQEAggMAIe8BAQCCAwAh8QFAAIMDACGNAgEAggMAIboCAAAxACC7AgAAMQAgEQMAAIsDACDrAQAA0AMAMOwBAAAHABDtAQAA0AMAMO4BAQCCAwAh7wEBAIIDACHxAUAAgwMAIYUCQACDAwAhqQIBAIIDACGqAgEAggMAIasCAQCJAwAhrAIBAIkDACGtAgEAiQMAIa4CQADRAwAhrwJAANEDACGwAgEAiQMAIbECAQCJAwAhCPIBQAAAAAHzAUAAAAAF9AFAAAAABfUBQAAAAAH2AUAAAAAB9wFAAAAAAfgBQAAAAAH5AUAAoAMAIQwDAACLAwAg6wEAANIDADDsAQAAAwAQ7QEAANIDADDuAQEAggMAIe8BAQCCAwAh8QFAAIMDACGFAkAAgwMAIagCQACDAwAhsgIBAIIDACGzAgEAiQMAIbQCAQCJAwAhAAAAAb8CAQAAAAEBvwJAAAAAAQUfAADUBgAgIAAA2gYAILwCAADVBgAgvQIAANkGACDCAgAAUgAgBR8AANIGACAgAADXBgAgvAIAANMGACC9AgAA1gYAIMICAAAPACADHwAA1AYAILwCAADVBgAgwgIAAFIAIAMfAADSBgAgvAIAANMGACDCAgAADwAgAAAAAb8CAAAA_gECBR8AAMoGACAgAADQBgAgvAIAAMsGACC9AgAAzwYAIMICAABSACAFHwAAyAYAICAAAM0GACC8AgAAyQYAIL0CAADMBgAgwgIAAA8AIAMfAADKBgAgvAIAAMsGACDCAgAAUgAgAx8AAMgGACC8AgAAyQYAIMICAAAPACAAAAAAAAAFvwIIAAAAAcUCCAAAAAHGAggAAAABxwIIAAAAAcgCCAAAAAEBvwIAAACBAgIBvwIBAAAAAQUfAADABgAgIAAAxgYAILwCAADBBgAgvQIAAMUGACDCAgAAUgAgBR8AAL4GACAgAADDBgAgvAIAAL8GACC9AgAAwgYAIMICAAAPACADHwAAwAYAILwCAADBBgAgwgIAAFIAIAMfAAC-BgAgvAIAAL8GACDCAgAADwAgAAAAAAAAAb8CAAAAkgIDBR8AAJ8GACAgAAC8BgAgvAIAAKAGACC9AgAAuwYAIMICAABSACALHwAA-gMAMCAAAP8DADC8AgAA-wMAML0CAAD8AwAwvgIAAP0DACC_AgAA_gMAMMACAAD-AwAwwQIAAP4DADDCAgAA_gMAMMMCAACABAAwxAIAAIEEADAUCQAA0AQAIAsAANEEACAOAADSBAAgDwAA0wQAIBAAANQEACDuAQEAAAAB8QFAAAAAAYECAAAAnwIChQJAAAAAAZYCAQAAAAGXAgEAAAABmAIBAAAAAZkCAQAAAAGaAgEAAAABmwIgAAAAAZwCCAAAAAGdAiAAAAABnwIBAAAAAaACIAAAAAGiAgEAAAABAgAAAA8AIB8AAM8EACADAAAADwAgHwAAzwQAICAAAIcEACABGAAAugYAMBkGAADOAwAgCQAAzwMAIAsAALEDACAOAACyAwAgDwAAswMAIBAAALQDACDrAQAAywMAMOwBAAANABDtAQAAywMAMO4BAQAAAAHxAUAAgwMAIYECAADNA58CIoUCQACDAwAhlgIBAIIDACGXAgEAggMAIZgCAQCCAwAhmQIBAIIDACGaAgEAiQMAIZsCIACqAwAhnAIIAMwDACGdAiAAqgMAIZ8CAQCJAwAhoAIgAKoDACGhAgEAggMAIaICAQCCAwAhAgAAAA8AIBgAAIcEACACAAAAggQAIBgAAIMEACAT6wEAAIEEADDsAQAAggQAEO0BAACBBAAw7gEBAIIDACHxAUAAgwMAIYECAADNA58CIoUCQACDAwAhlgIBAIIDACGXAgEAggMAIZgCAQCCAwAhmQIBAIIDACGaAgEAiQMAIZsCIACqAwAhnAIIAMwDACGdAiAAqgMAIZ8CAQCJAwAhoAIgAKoDACGhAgEAggMAIaICAQCCAwAhE-sBAACBBAAw7AEAAIIEABDtAQAAgQQAMO4BAQCCAwAh8QFAAIMDACGBAgAAzQOfAiKFAkAAgwMAIZYCAQCCAwAhlwIBAIIDACGYAgEAggMAIZkCAQCCAwAhmgIBAIkDACGbAiAAqgMAIZwCCADMAwAhnQIgAKoDACGfAgEAiQMAIaACIACqAwAhoQIBAIIDACGiAgEAggMAIQ_uAQEA1gMAIfEBQADXAwAhgQIAAIYEnwIihQJAANcDACGWAgEA1gMAIZcCAQDWAwAhmAIBANYDACGZAgEA1gMAIZoCAQDsAwAhmwIgAIQEACGcAggAhQQAIZ0CIACEBAAhnwIBAOwDACGgAiAAhAQAIaICAQDWAwAhAb8CIAAAAAEFvwIIAAAAAcUCCAAAAAHGAggAAAABxwIIAAAAAcgCCAAAAAEBvwIAAACfAgIUCQAAiAQAIAsAAIkEACAOAACKBAAgDwAAiwQAIBAAAIwEACDuAQEA1gMAIfEBQADXAwAhgQIAAIYEnwIihQJAANcDACGWAgEA1gMAIZcCAQDWAwAhmAIBANYDACGZAgEA1gMAIZoCAQDsAwAhmwIgAIQEACGcAggAhQQAIZ0CIACEBAAhnwIBAOwDACGgAiAAhAQAIaICAQDWAwAhBR8AAKEGACAgAAC4BgAgvAIAAKIGACC9AgAAtwYAIMICAAAzACALHwAAwwQAMCAAAMgEADC8AgAAxAQAML0CAADFBAAwvgIAAMYEACC_AgAAxwQAMMACAADHBAAwwQIAAMcEADDCAgAAxwQAMMMCAADJBAAwxAIAAMoEADALHwAApQQAMCAAAKoEADC8AgAApgQAML0CAACnBAAwvgIAAKgEACC_AgAAqQQAMMACAACpBAAwwQIAAKkEADDCAgAAqQQAMMMCAACrBAAwxAIAAKwEADALHwAAmQQAMCAAAJ4EADC8AgAAmgQAML0CAACbBAAwvgIAAJwEACC_AgAAnQQAMMACAACdBAAwwQIAAJ0EADDCAgAAnQQAMMMCAACfBAAwxAIAAKAEADALHwAAjQQAMCAAAJIEADC8AgAAjgQAML0CAACPBAAwvgIAAJAEACC_AgAAkQQAMMACAACRBAAwwQIAAJEEADDCAgAAkQQAMMMCAACTBAAwxAIAAJQEADAEAwAA2gMAIO4BAQAAAAHvAQEAAAAB8QFAAAAAAQIAAAAkACAfAACYBAAgAwAAACQAIB8AAJgEACAgAACXBAAgARgAALYGADAKAwAAiwMAIAoAAL8DACDrAQAAvgMAMOwBAAAiABDtAQAAvgMAMO4BAQAAAAHvAQEAggMAIfABAQCCAwAh8QFAAIMDACG5AgAAvQMAIAIAAAAkACAYAACXBAAgAgAAAJUEACAYAACWBAAgB-sBAACUBAAw7AEAAJUEABDtAQAAlAQAMO4BAQCCAwAh7wEBAIIDACHwAQEAggMAIfEBQACDAwAhB-sBAACUBAAw7AEAAJUEABDtAQAAlAQAMO4BAQCCAwAh7wEBAIIDACHwAQEAggMAIfEBQACDAwAhA-4BAQDWAwAh7wEBANYDACHxAUAA1wMAIQQDAADYAwAg7gEBANYDACHvAQEA1gMAIfEBQADXAwAhBAMAANoDACDuAQEAAAAB7wEBAAAAAfEBQAAAAAEKAwAA7wMAIO4BAQAAAAHvAQEAAAAB8QFAAAAAAf8BCAAAAAGBAgAAAIECAoICAQAAAAGDAgEAAAABhAKAAAAAAYUCQAAAAAECAAAAIAAgHwAApAQAIAMAAAAgACAfAACkBAAgIAAAowQAIAEYAAC1BgAwEAMAAIsDACAKAAC_AwAg6wEAAMEDADDsAQAAHgAQ7QEAAMEDADDuAQEAAAAB7wEBAIIDACHwAQEAggMAIfEBQACDAwAh_wEIAMIDACGBAgAAwwOBAiKCAgEAAAABgwIBAAAAAYQCAADEAwAghQJAAIMDACG5AgAAwAMAIAIAAAAgACAYAACjBAAgAgAAAKEEACAYAACiBAAgDesBAACgBAAw7AEAAKEEABDtAQAAoAQAMO4BAQCCAwAh7wEBAIIDACHwAQEAggMAIfEBQACDAwAh_wEIAMIDACGBAgAAwwOBAiKCAgEAggMAIYMCAQCJAwAhhAIAAMQDACCFAkAAgwMAIQ3rAQAAoAQAMOwBAAChBAAQ7QEAAKAEADDuAQEAggMAIe8BAQCCAwAh8AEBAIIDACHxAUAAgwMAIf8BCADCAwAhgQIAAMMDgQIiggIBAIIDACGDAgEAiQMAIYQCAADEAwAghQJAAIMDACEJ7gEBANYDACHvAQEA1gMAIfEBQADXAwAh_wEIAOoDACGBAgAA6wOBAiKCAgEA1gMAIYMCAQDsAwAhhAKAAAAAAYUCQADXAwAhCgMAAO0DACDuAQEA1gMAIe8BAQDWAwAh8QFAANcDACH_AQgA6gMAIYECAADrA4ECIoICAQDWAwAhgwIBAOwDACGEAoAAAAABhQJAANcDACEKAwAA7wMAIO4BAQAAAAHvAQEAAAAB8QFAAAAAAf8BCAAAAAGBAgAAAIECAoICAQAAAAGDAgEAAAABhAKAAAAAAYUCQAAAAAEKAwAAvgQAIAwAAMIEACANAADABAAg7gEBAAAAAe8BAQAAAAHxAUAAAAABhQJAAAAAAaMCAQAAAAGkAgIAAAABpQIBAAAAAQIAAAAZACAfAADBBAAgAwAAABkAIB8AAMEEACAgAACwBAAgARgAALQGADAPAwAAiwMAIAoAAL8DACAMAADHAwAgDQAAsgMAIOsBAADFAwAw7AEAABcAEO0BAADFAwAw7gEBAAAAAe8BAQCCAwAh8AEBAIIDACHxAUAAgwMAIYUCQACDAwAhowIBAIIDACGkAgIAxgMAIaUCAQCJAwAhAgAAABkAIBgAALAEACACAAAArQQAIBgAAK4EACAL6wEAAKwEADDsAQAArQQAEO0BAACsBAAw7gEBAIIDACHvAQEAggMAIfABAQCCAwAh8QFAAIMDACGFAkAAgwMAIaMCAQCCAwAhpAICAMYDACGlAgEAiQMAIQvrAQAArAQAMOwBAACtBAAQ7QEAAKwEADDuAQEAggMAIe8BAQCCAwAh8AEBAIIDACHxAUAAgwMAIYUCQACDAwAhowIBAIIDACGkAgIAxgMAIaUCAQCJAwAhB-4BAQDWAwAh7wEBANYDACHxAUAA1wMAIYUCQADXAwAhowIBANYDACGkAgIArwQAIaUCAQDsAwAhBb8CAgAAAAHFAgIAAAABxgICAAAAAccCAgAAAAHIAgIAAAABCgMAALEEACAMAACyBAAgDQAAswQAIO4BAQDWAwAh7wEBANYDACHxAUAA1wMAIYUCQADXAwAhowIBANYDACGkAgIArwQAIaUCAQDsAwAhBR8AAKgGACAgAACyBgAgvAIAAKkGACC9AgAAsQYAIMICAABSACAHHwAApAYAICAAAK8GACC8AgAApQYAIL0CAACuBgAgwAIAABcAIMECAAAXACDCAgAAGQAgCx8AALQEADAgAAC4BAAwvAIAALUEADC9AgAAtgQAML4CAAC3BAAgvwIAAKkEADDAAgAAqQQAMMECAACpBAAwwgIAAKkEADDDAgAAuQQAMMQCAACsBAAwCgMAAL4EACAKAAC_BAAgDQAAwAQAIO4BAQAAAAHvAQEAAAAB8AEBAAAAAfEBQAAAAAGFAkAAAAABowIBAAAAAaQCAgAAAAECAAAAGQAgHwAAvQQAIAMAAAAZACAfAAC9BAAgIAAAuwQAIAEYAACtBgAwAgAAABkAIBgAALsEACACAAAArQQAIBgAALoEACAH7gEBANYDACHvAQEA1gMAIfABAQDWAwAh8QFAANcDACGFAkAA1wMAIaMCAQDWAwAhpAICAK8EACEKAwAAsQQAIAoAALwEACANAACzBAAg7gEBANYDACHvAQEA1gMAIfABAQDWAwAh8QFAANcDACGFAkAA1wMAIaMCAQDWAwAhpAICAK8EACEFHwAApgYAICAAAKsGACC8AgAApwYAIL0CAACqBgAgwgIAAA8AIAoDAAC-BAAgCgAAvwQAIA0AAMAEACDuAQEAAAAB7wEBAAAAAfABAQAAAAHxAUAAAAABhQJAAAAAAaMCAQAAAAGkAgIAAAABAx8AAKgGACC8AgAAqQYAIMICAABSACADHwAApgYAILwCAACnBgAgwgIAAA8AIAQfAAC0BAAwvAIAALUEADC-AgAAtwQAIMICAACpBAAwCgMAAL4EACAMAADCBAAgDQAAwAQAIO4BAQAAAAHvAQEAAAAB8QFAAAAAAYUCQAAAAAGjAgEAAAABpAICAAAAAaUCAQAAAAEDHwAApAYAILwCAAClBgAgwgIAABkAIAUDAADiAwAg7gEBAAAAAe8BAQAAAAHxAUAAAAAB_gEAAAD-AQICAAAAFQAgHwAAzgQAIAMAAAAVACAfAADOBAAgIAAAzQQAIAEYAACjBgAwCwMAAIsDACAKAAC_AwAg6wEAAMkDADDsAQAAEwAQ7QEAAMkDADDuAQEAAAAB7wEBAIIDACHwAQEAggMAIfEBQACDAwAh_gEAAMoD_gEiuQIAAMgDACACAAAAFQAgGAAAzQQAIAIAAADLBAAgGAAAzAQAIAjrAQAAygQAMOwBAADLBAAQ7QEAAMoEADDuAQEAggMAIe8BAQCCAwAh8AEBAIIDACHxAUAAgwMAIf4BAADKA_4BIgjrAQAAygQAMOwBAADLBAAQ7QEAAMoEADDuAQEAggMAIe8BAQCCAwAh8AEBAIIDACHxAUAAgwMAIf4BAADKA_4BIgTuAQEA1gMAIe8BAQDWAwAh8QFAANcDACH-AQAA3wP-ASIFAwAA4AMAIO4BAQDWAwAh7wEBANYDACHxAUAA1wMAIf4BAADfA_4BIgUDAADiAwAg7gEBAAAAAe8BAQAAAAHxAUAAAAAB_gEAAAD-AQIUCQAA0AQAIAsAANEEACAOAADSBAAgDwAA0wQAIBAAANQEACDuAQEAAAAB8QFAAAAAAYECAAAAnwIChQJAAAAAAZYCAQAAAAGXAgEAAAABmAIBAAAAAZkCAQAAAAGaAgEAAAABmwIgAAAAAZwCCAAAAAGdAiAAAAABnwIBAAAAAaACIAAAAAGiAgEAAAABAx8AAKEGACC8AgAAogYAIMICAAAzACAEHwAAwwQAMLwCAADEBAAwvgIAAMYEACDCAgAAxwQAMAQfAAClBAAwvAIAAKYEADC-AgAAqAQAIMICAACpBAAwBB8AAJkEADC8AgAAmgQAML4CAACcBAAgwgIAAJ0EADAEHwAAjQQAMLwCAACOBAAwvgIAAJAEACDCAgAAkQQAMAMfAACfBgAgvAIAAKAGACDCAgAAUgAgBB8AAPoDADC8AgAA-wMAML4CAAD9AwAgwgIAAP4DADAKBAAA7QUAIAUAAO4FACAGAADvBQAgCwAA8QUAIA4AAPIFACAPAADzBQAgEAAA9AUAIBEAAPAFACASAAD1BQAgmgIAAOQDACAAAAAAAAAFHwAAmgYAICAAAJ0GACC8AgAAmwYAIL0CAACcBgAgwgIAAPQBACADHwAAmgYAILwCAACbBgAgwgIAAPQBACAAAAAAAAAAAAUfAACUBgAgIAAAmAYAILwCAACVBgAgvQIAAJcGACDCAgAAUgAgCx8AAOoEADAgAADuBAAwvAIAAOsEADC9AgAA7AQAML4CAADtBAAgvwIAAP4DADDAAgAA_gMAMMECAAD-AwAwwgIAAP4DADDDAgAA7wQAMMQCAACBBAAwFAYAAN8EACALAADRBAAgDgAA0gQAIA8AANMEACAQAADUBAAg7gEBAAAAAfEBQAAAAAGBAgAAAJ8CAoUCQAAAAAGWAgEAAAABlwIBAAAAAZgCAQAAAAGZAgEAAAABmgIBAAAAAZsCIAAAAAGcAggAAAABnQIgAAAAAZ8CAQAAAAGgAiAAAAABoQIBAAAAAQIAAAAPACAfAADyBAAgAwAAAA8AIB8AAPIEACAgAADxBAAgARgAAJYGADACAAAADwAgGAAA8QQAIAIAAACCBAAgGAAA8AQAIA_uAQEA1gMAIfEBQADXAwAhgQIAAIYEnwIihQJAANcDACGWAgEA1gMAIZcCAQDWAwAhmAIBANYDACGZAgEA1gMAIZoCAQDsAwAhmwIgAIQEACGcAggAhQQAIZ0CIACEBAAhnwIBAOwDACGgAiAAhAQAIaECAQDWAwAhFAYAAN4EACALAACJBAAgDgAAigQAIA8AAIsEACAQAACMBAAg7gEBANYDACHxAUAA1wMAIYECAACGBJ8CIoUCQADXAwAhlgIBANYDACGXAgEA1gMAIZgCAQDWAwAhmQIBANYDACGaAgEA7AMAIZsCIACEBAAhnAIIAIUEACGdAiAAhAQAIZ8CAQDsAwAhoAIgAIQEACGhAgEA1gMAIRQGAADfBAAgCwAA0QQAIA4AANIEACAPAADTBAAgEAAA1AQAIO4BAQAAAAHxAUAAAAABgQIAAACfAgKFAkAAAAABlgIBAAAAAZcCAQAAAAGYAgEAAAABmQIBAAAAAZoCAQAAAAGbAiAAAAABnAIIAAAAAZ0CIAAAAAGfAgEAAAABoAIgAAAAAaECAQAAAAEDHwAAlAYAILwCAACVBgAgwgIAAFIAIAQfAADqBAAwvAIAAOsEADC-AgAA7QQAIMICAAD-AwAwAAAAAAAAAb8CQAAAAAEFHwAAjwYAICAAAJIGACC8AgAAkAYAIL0CAACRBgAgwgIAAFIAIAMfAACPBgAgvAIAAJAGACDCAgAAUgAgAAAABR8AAIoGACAgAACNBgAgvAIAAIsGACC9AgAAjAYAIMICAABSACADHwAAigYAILwCAACLBgAgwgIAAFIAIAAAAAG_AgAAALcCAgG_AgAAALkCAgsfAADYBQAwIAAA3QUAMLwCAADZBQAwvQIAANoFADC-AgAA2wUAIL8CAADcBQAwwAIAANwFADDBAgAA3AUAMMICAADcBQAwwwIAAN4FADDEAgAA3wUAMAsfAADMBQAwIAAA0QUAMLwCAADNBQAwvQIAAM4FADC-AgAAzwUAIL8CAADQBQAwwAIAANAFADDBAgAA0AUAMMICAADQBQAwwwIAANIFADDEAgAA0wUAMAcfAADHBQAgIAAAygUAILwCAADIBQAgvQIAAMkFACDAAgAACwAgwQIAAAsAIMICAAD0AQAgBx8AAMEFACAgAADEBQAgvAIAAMIFACC9AgAAwwUAIMACAAArACDBAgAAKwAgwgIAAAEAIAsfAAC4BQAwIAAAvAUAMLwCAAC5BQAwvQIAALoFADC-AgAAuwUAIL8CAADHBAAwwAIAAMcEADDBAgAAxwQAMMICAADHBAAwwwIAAL0FADDEAgAAygQAMAsfAACvBQAwIAAAswUAMLwCAACwBQAwvQIAALEFADC-AgAAsgUAIL8CAACpBAAwwAIAAKkEADDBAgAAqQQAMMICAACpBAAwwwIAALQFADDEAgAArAQAMAsfAACmBQAwIAAAqgUAMLwCAACnBQAwvQIAAKgFADC-AgAAqQUAIL8CAACdBAAwwAIAAJ0EADDBAgAAnQQAMMICAACdBAAwwwIAAKsFADDEAgAAoAQAMAsfAACdBQAwIAAAoQUAMLwCAACeBQAwvQIAAJ8FADC-AgAAoAUAIL8CAACRBAAwwAIAAJEEADDBAgAAkQQAMMICAACRBAAwwwIAAKIFADDEAgAAlAQAMAsfAACRBQAwIAAAlgUAMLwCAACSBQAwvQIAAJMFADC-AgAAlAUAIL8CAACVBQAwwAIAAJUFADDBAgAAlQUAMMICAACVBQAwwwIAAJcFADDEAgAAmAUAMAQHAAD0BAAg7gEBAAAAAfEBQAAAAAGNAgEAAAABAgAAADMAIB8AAJwFACADAAAAMwAgHwAAnAUAICAAAJsFACABGAAAiQYAMAkDAACLAwAgBwAAjAMAIOsBAAC6AwAw7AEAADEAEO0BAAC6AwAw7gEBAAAAAe8BAQCCAwAh8QFAAIMDACGNAgEAAAABAgAAADMAIBgAAJsFACACAAAAmQUAIBgAAJoFACAH6wEAAJgFADDsAQAAmQUAEO0BAACYBQAw7gEBAIIDACHvAQEAggMAIfEBQACDAwAhjQIBAIIDACEH6wEAAJgFADDsAQAAmQUAEO0BAACYBQAw7gEBAIIDACHvAQEAggMAIfEBQACDAwAhjQIBAIIDACED7gEBANYDACHxAUAA1wMAIY0CAQDWAwAhBAcAAOkEACDuAQEA1gMAIfEBQADXAwAhjQIBANYDACEEBwAA9AQAIO4BAQAAAAHxAUAAAAABjQIBAAAAAQQKAADbAwAg7gEBAAAAAfABAQAAAAHxAUAAAAABAgAAACQAIB8AAKUFACADAAAAJAAgHwAApQUAICAAAKQFACABGAAAiAYAMAIAAAAkACAYAACkBQAgAgAAAJUEACAYAACjBQAgA-4BAQDWAwAh8AEBANYDACHxAUAA1wMAIQQKAADZAwAg7gEBANYDACHwAQEA1gMAIfEBQADXAwAhBAoAANsDACDuAQEAAAAB8AEBAAAAAfEBQAAAAAEKCgAA8AMAIO4BAQAAAAHwAQEAAAAB8QFAAAAAAf8BCAAAAAGBAgAAAIECAoICAQAAAAGDAgEAAAABhAKAAAAAAYUCQAAAAAECAAAAIAAgHwAArgUAIAMAAAAgACAfAACuBQAgIAAArQUAIAEYAACHBgAwAgAAACAAIBgAAK0FACACAAAAoQQAIBgAAKwFACAJ7gEBANYDACHwAQEA1gMAIfEBQADXAwAh_wEIAOoDACGBAgAA6wOBAiKCAgEA1gMAIYMCAQDsAwAhhAKAAAAAAYUCQADXAwAhCgoAAO4DACDuAQEA1gMAIfABAQDWAwAh8QFAANcDACH_AQgA6gMAIYECAADrA4ECIoICAQDWAwAhgwIBAOwDACGEAoAAAAABhQJAANcDACEKCgAA8AMAIO4BAQAAAAHwAQEAAAAB8QFAAAAAAf8BCAAAAAGBAgAAAIECAoICAQAAAAGDAgEAAAABhAKAAAAAAYUCQAAAAAEKCgAAvwQAIAwAAMIEACANAADABAAg7gEBAAAAAfABAQAAAAHxAUAAAAABhQJAAAAAAaMCAQAAAAGkAgIAAAABpQIBAAAAAQIAAAAZACAfAAC3BQAgAwAAABkAIB8AALcFACAgAAC2BQAgARgAAIYGADACAAAAGQAgGAAAtgUAIAIAAACtBAAgGAAAtQUAIAfuAQEA1gMAIfABAQDWAwAh8QFAANcDACGFAkAA1wMAIaMCAQDWAwAhpAICAK8EACGlAgEA7AMAIQoKAAC8BAAgDAAAsgQAIA0AALMEACDuAQEA1gMAIfABAQDWAwAh8QFAANcDACGFAkAA1wMAIaMCAQDWAwAhpAICAK8EACGlAgEA7AMAIQoKAAC_BAAgDAAAwgQAIA0AAMAEACDuAQEAAAAB8AEBAAAAAfEBQAAAAAGFAkAAAAABowIBAAAAAaQCAgAAAAGlAgEAAAABBQoAAOMDACDuAQEAAAAB8AEBAAAAAfEBQAAAAAH-AQAAAP4BAgIAAAAVACAfAADABQAgAwAAABUAIB8AAMAFACAgAAC_BQAgARgAAIUGADACAAAAFQAgGAAAvwUAIAIAAADLBAAgGAAAvgUAIATuAQEA1gMAIfABAQDWAwAh8QFAANcDACH-AQAA3wP-ASIFCgAA4QMAIO4BAQDWAwAh8AEBANYDACHxAUAA1wMAIf4BAADfA_4BIgUKAADjAwAg7gEBAAAAAfABAQAAAAHxAUAAAAAB_gEAAAD-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-BQAgIAAAgQYAILwCAAD_BQAgvQIAAIAGACDCAgAAUgAgAx8AAP4FACC8AgAA_wUAIMICAABSACAJBgAA7wUAIAkAAP0FACALAADxBQAgDgAA8gUAIA8AAPMFACAQAAD0BQAgmgIAAOQDACCcAgAA5AMAIJ8CAADkAwAgBgMAANcEACAKAAD7BQAgDAAA_AUAIA0AAPIFACCkAgAA5AMAIKUCAADkAwAgAgMAANcEACAHAADYBAAgEQQAAOQFACAFAADlBQAgBgAA5gUAIAsAAOgFACAOAADpBQAgDwAA6gUAIBAAAOsFACASAADsBQAg7gEBAAAAAfEBQAAAAAGBAgAAALkCAoUCQAAAAAGMAgEAAAABjQIBAAAAAZoCAQAAAAG1AiAAAAABtwIAAAC3AgICAAAAUgAgHwAA_gUAIAMAAABVACAfAAD-BQAgIAAAggYAIBMAAABVACAEAACIBQAgBQAAiQUAIAYAAIoFACALAACMBQAgDgAAjQUAIA8AAI4FACAQAACPBQAgEgAAkAUAIBgAAIIGACDuAQEA1gMAIfEBQADXAwAhgQIAAIcFuQIihQJAANcDACGMAgEA1gMAIY0CAQDWAwAhmgIBAOwDACG1AiAAhAQAIbcCAACGBbcCIhEEAACIBQAgBQAAiQUAIAYAAIoFACALAACMBQAgDgAAjQUAIA8AAI4FACAQAACPBQAgEgAAkAUAIO4BAQDWAwAh8QFAANcDACGBAgAAhwW5AiKFAkAA1wMAIYwCAQDWAwAhjQIBANYDACGaAgEA7AMAIbUCIACEBAAhtwIAAIYFtwIiB-4BAQAAAAHxAUAAAAABhQJAAAAAAagCQAAAAAGyAgEAAAABswIBAAAAAbQCAQAAAAEM7gEBAAAAAfEBQAAAAAGFAkAAAAABqQIBAAAAAaoCAQAAAAGrAgEAAAABrAIBAAAAAa0CAQAAAAGuAkAAAAABrwJAAAAAAbACAQAAAAGxAgEAAAABBO4BAQAAAAHwAQEAAAAB8QFAAAAAAf4BAAAA_gECB-4BAQAAAAHwAQEAAAAB8QFAAAAAAYUCQAAAAAGjAgEAAAABpAICAAAAAaUCAQAAAAEJ7gEBAAAAAfABAQAAAAHxAUAAAAAB_wEIAAAAAYECAAAAgQICggIBAAAAAYMCAQAAAAGEAoAAAAABhQJAAAAAAQPuAQEAAAAB8AEBAAAAAfEBQAAAAAED7gEBAAAAAfEBQAAAAAGNAgEAAAABEQUAAOUFACAGAADmBQAgCwAA6AUAIA4AAOkFACAPAADqBQAgEAAA6wUAIBEAAOcFACASAADsBQAg7gEBAAAAAfEBQAAAAAGBAgAAALkCAoUCQAAAAAGMAgEAAAABjQIBAAAAAZoCAQAAAAG1AiAAAAABtwIAAAC3AgICAAAAUgAgHwAAigYAIAMAAABVACAfAACKBgAgIAAAjgYAIBMAAABVACAFAACJBQAgBgAAigUAIAsAAIwFACAOAACNBQAgDwAAjgUAIBAAAI8FACARAACLBQAgEgAAkAUAIBgAAI4GACDuAQEA1gMAIfEBQADXAwAhgQIAAIcFuQIihQJAANcDACGMAgEA1gMAIY0CAQDWAwAhmgIBAOwDACG1AiAAhAQAIbcCAACGBbcCIhEFAACJBQAgBgAAigUAIAsAAIwFACAOAACNBQAgDwAAjgUAIBAAAI8FACARAACLBQAgEgAAkAUAIO4BAQDWAwAh8QFAANcDACGBAgAAhwW5AiKFAkAA1wMAIYwCAQDWAwAhjQIBANYDACGaAgEA7AMAIbUCIACEBAAhtwIAAIYFtwIiEQQAAOQFACAGAADmBQAgCwAA6AUAIA4AAOkFACAPAADqBQAgEAAA6wUAIBEAAOcFACASAADsBQAg7gEBAAAAAfEBQAAAAAGBAgAAALkCAoUCQAAAAAGMAgEAAAABjQIBAAAAAZoCAQAAAAG1AiAAAAABtwIAAAC3AgICAAAAUgAgHwAAjwYAIAMAAABVACAfAACPBgAgIAAAkwYAIBMAAABVACAEAACIBQAgBgAAigUAIAsAAIwFACAOAACNBQAgDwAAjgUAIBAAAI8FACARAACLBQAgEgAAkAUAIBgAAJMGACDuAQEA1gMAIfEBQADXAwAhgQIAAIcFuQIihQJAANcDACGMAgEA1gMAIY0CAQDWAwAhmgIBAOwDACG1AiAAhAQAIbcCAACGBbcCIhEEAACIBQAgBgAAigUAIAsAAIwFACAOAACNBQAgDwAAjgUAIBAAAI8FACARAACLBQAgEgAAkAUAIO4BAQDWAwAh8QFAANcDACGBAgAAhwW5AiKFAkAA1wMAIYwCAQDWAwAhjQIBANYDACGaAgEA7AMAIbUCIACEBAAhtwIAAIYFtwIiEQQAAOQFACAFAADlBQAgBgAA5gUAIAsAAOgFACAOAADpBQAgDwAA6gUAIBAAAOsFACARAADnBQAg7gEBAAAAAfEBQAAAAAGBAgAAALkCAoUCQAAAAAGMAgEAAAABjQIBAAAAAZoCAQAAAAG1AiAAAAABtwIAAAC3AgICAAAAUgAgHwAAlAYAIA_uAQEAAAAB8QFAAAAAAYECAAAAnwIChQJAAAAAAZYCAQAAAAGXAgEAAAABmAIBAAAAAZkCAQAAAAGaAgEAAAABmwIgAAAAAZwCCAAAAAGdAiAAAAABnwIBAAAAAaACIAAAAAGhAgEAAAABAwAAAFUAIB8AAJQGACAgAACZBgAgEwAAAFUAIAQAAIgFACAFAACJBQAgBgAAigUAIAsAAIwFACAOAACNBQAgDwAAjgUAIBAAAI8FACARAACLBQAgGAAAmQYAIO4BAQDWAwAh8QFAANcDACGBAgAAhwW5AiKFAkAA1wMAIYwCAQDWAwAhjQIBANYDACGaAgEA7AMAIbUCIACEBAAhtwIAAIYFtwIiEQQAAIgFACAFAACJBQAgBgAAigUAIAsAAIwFACAOAACNBQAgDwAAjgUAIBAAAI8FACARAACLBQAg7gEBANYDACHxAUAA1wMAIYECAACHBbkCIoUCQADXAwAhjAIBANYDACGNAgEA1gMAIZoCAQDsAwAhtQIgAIQEACG3AgAAhgW3AiILAwAA1QQAIO4BAQAAAAHvAQEAAAAB8QFAAAAAAYUCQAAAAAGMAgEAAAABjQIBAAAAAY4CAQAAAAGPAgEAAAABkAIBAAAAAZICAAAAkgIDAgAAAPQBACAfAACaBgAgAwAAAAsAIB8AAJoGACAgAACeBgAgDQAAAAsAIAMAAPgDACAYAACeBgAg7gEBANYDACHvAQEA1gMAIfEBQADXAwAhhQJAANcDACGMAgEA1gMAIY0CAQDWAwAhjgIBAOwDACGPAgEA7AMAIZACAQDsAwAhkgIAAPcDkgIjCwMAAPgDACDuAQEA1gMAIe8BAQDWAwAh8QFAANcDACGFAkAA1wMAIYwCAQDWAwAhjQIBANYDACGOAgEA7AMAIY8CAQDsAwAhkAIBAOwDACGSAgAA9wOSAiMRBAAA5AUAIAUAAOUFACALAADoBQAgDgAA6QUAIA8AAOoFACAQAADrBQAgEQAA5wUAIBIAAOwFACDuAQEAAAAB8QFAAAAAAYECAAAAuQIChQJAAAAAAYwCAQAAAAGNAgEAAAABmgIBAAAAAbUCIAAAAAG3AgAAALcCAgIAAABSACAfAACfBgAgBQMAAPMEACDuAQEAAAAB7wEBAAAAAfEBQAAAAAGNAgEAAAABAgAAADMAIB8AAKEGACAE7gEBAAAAAe8BAQAAAAHxAUAAAAAB_gEAAAD-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-cQM_cxFAdCBBdgNCeBFDeSFEegNFewNGfBFHfyJIgAEmSYEBBEqCAQRLgwEETIQBBE2FAQROhwEET4kBEVCKASdRjAEEUo4BEVOPAShUkAEEVZEBBFaSARFXlQEpWJYBLVmYAS5amQEuW5wBLlydAS5dngEuXqABLl-iARFgowEvYaUBLmKnARFjqAEwZKkBLmWqAS5mqwERZ64BMWivATVpsAEHarEBB2uyAQdsswEHbbQBB262AQdvuAERcLkBNnG7AQdyvQERc74BN3S_AQd1wAEHdsEBEXfEATh4xQE8ecYBCnrHAQp7yAEKfMkBCn3KAQp-zAEKf84BEYABzwE9gQHSAQqCAdQBEYMB1QE-hAHXAQqFAdgBCoYB2QERiQHcAT-KAd0BRYsB3gEGjAHfAQaNAeABBo4B4QEGjwHiAQaQAeQBBpEB5gERkgHnAUaTAekBBpQB6wERlQHsAUeWAe0BBpcB7gEGmAHvARGZAfIBSJoB8wFOmwH1AQWcAfYBBZ0B-AEFngH5AQWfAfoBBaAB_AEFoQH-ARGiAf8BT6MBgQIFpAGDAhGlAYQCUKYBhQIFpwGGAgWoAYcCEakBigJRqgGLAlWrAY0CVqwBjgJWrQGRAlauAZICVq8BkwJWsAGVAlaxAZcCEbIBmAJXswGaAla0AZwCEbUBnQJYtgGeAla3AZ8CVrgBoAIRuQGjAlm6AaQCXbsBpQIMvAGmAgy9AacCDL4BqAIMvwGpAgzAAasCDMEBrQIRwgGuAl7DAbACDMQBsgIRxQGzAl_GAbQCDMcBtQIMyAG2AhHJAbkCYMoBugJmywG7AgnMAbwCCc0BvQIJzgG-AgnPAb8CCdABwQIJ0QHDAhHSAcQCZ9MBxgIJ1AHIAhHVAckCaNYBygIJ1wHLAgnYAcwCEdkBzwJp2gHQAm3bAdECDdwB0gIN3QHTAg3eAdQCDd8B1QIN4AHXAg3hAdkCEeIB2gJu4wHcAg3kAd4CEeUB3wJv5gHgAg3nAeECDegB4gIR6QHlAnDqAeYCdA"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var Role = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED"
};
var IdeaStatus = {
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  DRAFT: "DRAFT"
};
var PaymentStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = envFile.DATABASE_URL;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/utils/email.ts
import ejs from "ejs";
import status4 from "http-status";
import nodemailer from "nodemailer";
import path2 from "path";
var transporter = nodemailer.createTransport({
  host: envFile.EMAIL_SENDER.SMTP_HOST,
  secure: false,
  auth: {
    user: envFile.EMAIL_SENDER.SMTP_USER,
    pass: envFile.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envFile.EMAIL_SENDER.SMTP_PORT)
});
var sendEmail = async ({ subject, templateData, templateName, to, attachments }) => {
  try {
    const templatePath = path2.resolve(process.cwd(), `src/templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envFile.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });
    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Email Sending Error", error.message);
    throw new AppError_default(status4.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};

// src/lib/auth.ts
var auth = betterAuth({
  baseURL: envFile.BETTER_AUTH_URL,
  secret: envFile.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.MEMBER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email: email2, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email: email2
            }
          });
          if (!user) {
            console.error(`User with email ${email2} not found. Cannot send verification OTP.`);
            return;
          }
          if (user && user.role === Role.ADMIN) {
            console.log(`User with email ${email2} is a admin. Skipping sending verification OTP.`);
            return;
          }
          if (user && !user.emailVerified) {
            sendEmail({
              to: email2,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email: email2
            }
          });
          if (user) {
            sendEmail({
              to: email2,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        }
      },
      expiresIn: 2 * 60,
      // 2 minutes in seconds
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000", envFile.FRONTEND_URL],
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/modules/Auth/auth.service.ts
var registerMember = async (payload) => {
  const { name, email: email2, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email: email2,
      password
    }
  });
  if (!data.user) {
    throw new AppError_default(status5.BAD_REQUEST, "Failed to register member");
  }
  try {
    const member = await prisma.$transaction(async (tx) => {
      const memberTx = await tx.member.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email
        }
      });
      return memberTx;
    });
    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      emailVerified: data.user.emailVerified
    });
    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      emailVerified: data.user.emailVerified
    });
    return {
      ...data,
      accessToken,
      refreshToken,
      member
    };
  } catch (error) {
    console.log("Transaction error : ", error);
    await prisma.user.delete({
      where: {
        id: data.user.id
      }
    });
    throw error;
  }
};
var loginUser = async (payload) => {
  const { email: email2, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email: email2,
      password
    }
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status5.FORBIDDEN, "User is blocked");
  }
  if (data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status5.NOT_FOUND, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var verifyEmail = async (email2, otp) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email: email2,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email: email2
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var getMe = async (user) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    include: {
      member: true,
      admin: true
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status5.NOT_FOUND, "User not found");
  }
  return isUserExists;
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new AppError_default(status5.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var getNewToken = async (refreshToken, sessionToken) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken
    },
    include: {
      user: true
    }
  });
  if (!isSessionTokenExists) {
    throw new AppError_default(status5.UNAUTHORIZED, "Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envFile.REFRESH_TOKEN_SECRET);
  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError_default(status5.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  };
};
var AuthService = {
  registerMember,
  loginUser,
  verifyEmail,
  getMe,
  logoutUser,
  changePassword,
  getNewToken
};

// src/modules/Auth/auth.controller.ts
var registerMember2 = nextRes(
  async (req, res) => {
    const maxAge = ms(envFile.ACCESS_TOKEN_EXPIRES_IN);
    const payload = req.body;
    const result = await AuthService.registerMember(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status6.CREATED,
      success: true,
      message: "Member registered successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest
      }
    });
  }
);
var loginUser2 = nextRes(
  async (req, res) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest
      }
    });
  }
);
var verifyEmail2 = nextRes(
  async (req, res) => {
    const { email: email2, otp } = req.body;
    await AuthService.verifyEmail(email2, otp);
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "Email verified successfully"
    });
  }
);
var getMe2 = nextRes(
  async (req, res) => {
    const user = req.user;
    const result = await AuthService.getMe(user);
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "User profile fetched successfully",
      data: result
    });
  }
);
var changePassword2 = nextRes(
  async (req, res) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.changePassword(payload, betterAuthSessionToken);
    const { accessToken, refreshToken, token } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "Password changed successfully",
      data: result
    });
  }
);
var logoutUser2 = nextRes(
  async (req, res) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.logoutUser(betterAuthSessionToken);
    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    CookieUtils.clearCookie(res, "refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    CookieUtils.clearCookie(res, "better-auth.session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "User logged out successfully",
      data: result
    });
  }
);
var getNewToken2 = nextRes(
  async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      throw new AppError_default(status6.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);
    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
    sendResponse(res, {
      httpStatusCode: status6.OK,
      success: true,
      message: "New tokens generated successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken
      }
    });
  }
);
var AuthController = {
  registerMember: registerMember2,
  loginUser: loginUser2,
  verifyEmail: verifyEmail2,
  getMe: getMe2,
  changePassword: changePassword2,
  logoutUser: logoutUser2,
  getNewToken: getNewToken2
};

// src/middlewares/validateRequest.ts
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    const parsedResult = zodSchema.safeParse(req.body);
    if (!parsedResult.success) {
      next(parsedResult.error);
    }
    req.body = parsedResult.data;
    next();
  };
};

// src/modules/Auth/auth.validation.ts
import { z } from "zod";
var strongPassword = z.string().min(8, "Password must be at least 8 characters long").regex(/[A-Z]/, "Must contain at least one uppercase letter").regex(/[a-z]/, "Must contain at least one lowercase letter").regex(/[0-9]/, "Must contain at least one number").regex(/[^A-Za-z0-9]/, "Must contain at least one special character");
var createUser = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: strongPassword
});
var loginUser3 = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
var Authvalidate = {
  createUser,
  loginUser: loginUser3
};

// src/middlewares/authVerify.ts
import status7 from "http-status";
var verifyAuthToken = (...authRoles) => async (req, res, next) => {
  try {
    const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
    if (!sessionToken) {
      throw new Error("Unauthorized access! No session token provided.");
    }
    if (sessionToken) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: /* @__PURE__ */ new Date()
          }
        },
        include: {
          user: true
        }
      });
      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        const now = /* @__PURE__ */ new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);
        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = timeRemaining / sessionLifeTime * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());
          console.log("Session Expiring Soon!!");
        }
        if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
          throw new AppError_default(status7.UNAUTHORIZED, "Unauthorized access! User is not active.");
        }
        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError_default(status7.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
        }
        req.user = {
          userId: user.id,
          role: user.role,
          email: user.email
        };
      }
      const accessToken2 = CookieUtils.getCookie(req, "accessToken");
      if (!accessToken2) {
        throw new AppError_default(status7.UNAUTHORIZED, "Unauthorized access! No access token provided.");
      }
    }
    const accessToken = CookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      throw new AppError_default(status7.UNAUTHORIZED, "Unauthorized access! No access token provided.");
    }
    const verifiedToken = jwtUtils.verifyToken(accessToken, envFile.ACCESS_TOKEN_SECRET);
    if (!verifiedToken.success) {
      throw new AppError_default(status7.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
    }
    if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data.role)) {
      throw new AppError_default(status7.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/modules/Auth/auth.route.ts
var router = Router();
router.post("/register", validateRequest(Authvalidate.createUser), AuthController.registerMember);
router.post("/login", AuthController.loginUser);
router.post("/verify-email", AuthController.verifyEmail);
router.get("/me", verifyAuthToken(Role.ADMIN, Role.MEMBER), AuthController.getMe);
router.post("/change-password", verifyAuthToken(Role.ADMIN, Role.MEMBER), AuthController.changePassword);
router.post("/logout", verifyAuthToken(Role.ADMIN, Role.MEMBER), AuthController.logoutUser);
router.post("/refresh-token", AuthController.getNewToken);
var AuthRoutes = router;

// src/modules/Catagory/catagory.route.ts
import express from "express";

// src/modules/Catagory/catagory.controller.ts
import status9 from "http-status";

// src/modules/Catagory/catagory.service.ts
import status8 from "http-status";

// src/utils/QueryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config2 = {}) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config2;
    this.page = 1;
    this.limit = 10;
    this.skip = 0;
    this.sortBy = "createdAt";
    this.sortOrder = "desc";
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            if (parts.length === 2) {
              const [relation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  [nestedField]: stringFilter2
                }
              };
            } else if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter2
                    }
                  }
                }
              };
            }
          }
          const stringFilter = {
            contains: searchTerm,
            mode: "insensitive"
          };
          return {
            [field]: stringFilter
          };
        }
      );
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  filter() {
    const { filterableFields } = this.config;
    const excludedField = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "include"
    ];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          if (!querySome[nestedRelation]) {
            querySome[nestedRelation] = {};
          }
          if (!countSome[nestedRelation]) {
            countSome[nestedRelation] = {};
          }
          const queryNestedRelation = querySome[nestedRelation];
          const countNestedRelation = countSome[nestedRelation];
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(
          value
        );
        countQueryWhere[key] = this.parseRangeFilter(
          value
        );
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [relation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const [relation, nestedRelation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedRelation]: {
              [nestedField]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder
      };
    }
    return this;
  }
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam?.split(",").map((field) => field.trim());
      this.selectFields = {};
      fieldsArray?.forEach((field) => {
        if (this.selectFields) {
          this.selectFields[field] = true;
        }
      });
      this.query.select = this.selectFields;
      delete this.query.include;
    }
    return this;
  }
  include(relation) {
    if (this.selectFields) {
      return this;
    }
    this.query.include = {
      ...this.query.include,
      ...relation
    };
    return this;
  }
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.include;
    if (includeParam && typeof includeParam === "string") {
      const requestedRelations = includeParam.split(",").map((relation) => relation.trim());
      requestedRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    this.query.include = {
      ...this.query.include,
      ...result
    };
    return this;
  }
  where(condition) {
    this.query.where = this.deepMerge(
      this.query.where,
      condition
    );
    this.countQuery.where = this.deepMerge(
      this.countQuery.where,
      condition
    );
    return this;
  }
  async execute() {
    const [total, data] = await Promise.all([
      this.model.count(
        this.countQuery
      ),
      this.model.findMany(
        this.query
      )
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  async count() {
    return await this.model.count(
      this.countQuery
    );
  }
  getQuery() {
    return this.query;
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(
            result[key],
            source[key]
          );
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/modules/Catagory/category.constant.ts
var categorySearchableFields = ["name"];
var categoryFilterableFields = ["searchTerm"];

// src/modules/Catagory/catagory.service.ts
var createCategory = async (payload, userId) => {
  const isExist = await prisma.category.findUnique({
    where: { name: payload.name }
  });
  if (isExist) {
    throw new AppError_default(
      status8.UNPROCESSABLE_ENTITY,
      "Category already exists"
    );
  }
  const result = await prisma.category.create({
    data: {
      name: payload.name,
      userId
    }
  });
  return result;
};
var getAllCategories = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.category, query, {
    searchableFields: categorySearchableFields,
    filterableFields: categoryFilterableFields
  });
  const result = await queryBuilder.search().filter().include({
    ideas: true
  }).paginate().sort().fields().execute();
  return result;
};
var getSingleCategory = async (id) => {
  const result = await prisma.category.findUnique({
    where: { id },
    include: {
      ideas: true
    }
  });
  if (!result) {
    throw new AppError_default(status8.NOT_FOUND, "Category not found");
  }
  return result;
};
var updateCategory = async (id, payload) => {
  const isExist = await prisma.category.findUnique({
    where: { id }
  });
  if (!isExist) {
    throw new AppError_default(status8.NOT_FOUND, "Category not found");
  }
  if (payload.name) {
    const duplicate = await prisma.category.findFirst({
      where: {
        name: payload.name,
        NOT: { id }
      }
    });
    if (duplicate) {
      throw new AppError_default(
        status8.UNPROCESSABLE_ENTITY,
        "Category name already exists"
      );
    }
  }
  const result = await prisma.category.update({
    where: { id },
    data: payload
  });
  return result;
};
var deleteCategory = async (id) => {
  const isExist = await prisma.category.findUnique({
    where: { id }
  });
  if (!isExist) {
    throw new AppError_default(status8.NOT_FOUND, "Category not found");
  }
  const hasIdeas = await prisma.idea.findFirst({
    where: { categoryId: id }
  });
  if (hasIdeas) {
    throw new AppError_default(
      status8.BAD_REQUEST,
      "Cannot delete category with existing ideas"
    );
  }
  await prisma.category.delete({
    where: { id }
  });
  return { message: "Category deleted successfully" };
};
var CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory
};

// src/modules/Catagory/catagory.controller.ts
var createCategory2 = nextRes(
  async (req, res) => {
    const user = req.user;
    const payload = req.body;
    const result = await CategoryService.createCategory(
      payload,
      user.userId
    );
    sendResponse(res, {
      httpStatusCode: status9.CREATED,
      success: true,
      message: "Category created successfully",
      data: result
    });
  }
);
var getAllCategories2 = nextRes(
  async (req, res) => {
    const result = await CategoryService.getAllCategories(req.query);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Categories fetched successfully",
      data: result
    });
  }
);
var getSingleCategory2 = nextRes(
  async (req, res) => {
    const { id } = req.params;
    const result = await CategoryService.getSingleCategory(id);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Category fetched successfully",
      data: result
    });
  }
);
var updateCategory2 = nextRes(
  async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await CategoryService.updateCategory(
      id,
      payload
    );
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Category updated successfully",
      data: result
    });
  }
);
var deleteCategory2 = nextRes(
  async (req, res) => {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Category deleted successfully",
      data: result
    });
  }
);
var CategoryController = {
  createCategory: createCategory2,
  getAllCategories: getAllCategories2,
  getSingleCategory: getSingleCategory2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2
};

// src/modules/Catagory/catagory.validation.ts
import { z as z2 } from "zod";
var createCategoryValidation = z2.object({
  name: z2.string("Category name is required").min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters")
});
var updateCategoryValidation = z2.object({
  name: z2.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").optional()
});

// src/modules/Catagory/catagory.route.ts
var router2 = express.Router();
router2.use(verifyAuthToken(Role.MEMBER));
router2.post(
  "/create",
  validateRequest(createCategoryValidation),
  CategoryController.createCategory
);
router2.get("/", CategoryController.getAllCategories);
router2.get("/:id", CategoryController.getSingleCategory);
router2.patch(
  "/:id",
  validateRequest(updateCategoryValidation),
  CategoryController.updateCategory
);
router2.delete("/:id", CategoryController.deleteCategory);
var CategoryRoutes = router2;

// src/modules/Idea/idea.route.ts
import express2 from "express";

// src/modules/Idea/idea.controller.ts
import status11 from "http-status";

// src/modules/Idea/idea.service.ts
import status10 from "http-status";

// src/modules/Idea/idea.constant.ts
var ideaSearchableFields = [
  "title",
  "description",
  "problemStatement",
  "solution"
];
var ideaFilterableFields = [
  "searchTerm",
  "categoryId",
  "isPaid",
  "status"
];

// src/modules/Idea/idea.service.ts
var getAllIdeas = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.idea, query, {
    searchableFields: ideaSearchableFields,
    filterableFields: ideaFilterableFields
  });
  const ideas = await queryBuilder.search().filter().where({
    status: IdeaStatus.APPROVED
  }).include({
    category: {
      select: {
        name: true
      }
    },
    member: {
      select: {
        id: true,
        name: true,
        profilePhoto: true,
        userId: true
      }
    },
    votes: {
      select: {
        type: true
      }
    },
    _count: {
      select: {
        comments: true
      }
    }
  }).paginate().sort().fields().execute();
  const result = ideas.data.map((idea) => {
    let upvotes = 0;
    let downvotes = 0;
    idea.votes.forEach((v) => {
      if (v.type === "UP") upvotes++;
      if (v.type === "DOWN") downvotes++;
    });
    return {
      ...idea,
      voteSummary: {
        upvotes,
        downvotes
      },
      votes: void 0
      // remove raw votes
    };
  });
  return {
    ...ideas,
    data: result
  };
};
var getIdeaById = async (id, user) => {
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      category: true,
      member: true,
      comments: {
        where: {
          parentId: null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
  if (!idea) {
    throw new AppError_default(status10.NOT_FOUND, "Idea not found");
  }
  let hasAccess = true;
  if (idea.isPaid) {
    const currentMember = await prisma.member.findUnique({
      where: {
        id: idea.memberId
      }
    });
    const isOwner = currentMember?.userId === user.userId;
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner || !isAdmin) {
      const payment = await prisma.payment.findFirst({
        where: {
          ideaId: id,
          userId: user?.userId,
          status: PaymentStatus.SUCCESS
        }
      });
      hasAccess = !!payment;
    }
  }
  if (idea.isPaid && !hasAccess) {
    return {
      id: idea.id,
      title: idea.title,
      image: idea.image,
      price: idea.price,
      isPaid: idea.isPaid,
      message: "This is a paid idea. Please purchase to access full content.",
      locked: true
    };
  }
  const upvotes = await prisma.vote.count({
    where: { ideaId: id, type: "UP" }
  });
  const downvotes = await prisma.vote.count({
    where: { ideaId: id, type: "DOWN" }
  });
  return {
    ...idea,
    locked: false,
    voteSummary: {
      upvotes,
      downvotes
    }
  };
};
var createIdea = async (payload, userId) => {
  const member = await prisma.member.findUnique({
    where: { userId }
  });
  if (!member) {
    throw new AppError_default(status10.NOT_FOUND, "You are not a Member yet!");
  }
  const result = await prisma.idea.create({
    data: {
      ...payload,
      memberId: member.id,
      status: IdeaStatus.UNDER_REVIEW
    }
  });
  return result;
};
var updateIdea = async (id, payload, user) => {
  const isIdeaExist = await prisma.idea.findUnique({
    where: { id }
  });
  if (!isIdeaExist) {
    throw new AppError_default(status10.NOT_FOUND, "Idea not found");
  }
  const member = await prisma.member.findUnique({
    where: {
      id: isIdeaExist?.memberId
    }
  });
  const isOwner = member?.userId === user.userId;
  const isAdmin = user.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new AppError_default(
      status10.FORBIDDEN,
      "You are not allowed to delete this idea"
    );
  }
  const result = await prisma.idea.update({
    where: { id },
    data: payload
  });
  return result;
};
var deleteIdea = async (id, user) => {
  const isIdeaExist = await prisma.idea.findUnique({
    where: { id }
  });
  const member = await prisma.member.findUnique({
    where: {
      id: isIdeaExist?.memberId
    }
  });
  if (!isIdeaExist) {
    throw new AppError_default(status10.NOT_FOUND, "Idea not found");
  }
  const isOwner = member?.userId === user.userId;
  const isAdmin = user.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new AppError_default(
      status10.FORBIDDEN,
      "You are not allowed to delete this idea"
    );
  }
  await prisma.idea.update({
    where: { id },
    data: { isDeleted: true }
  });
  return { message: "Idea deleted successfully" };
};
var IdeaService = {
  getAllIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea
};

// src/modules/Idea/idea.controller.ts
var createIdea2 = nextRes(async (req, res) => {
  const user = req.user;
  const payload = { ...req.body, image: req?.file?.path };
  const result = await IdeaService.createIdea(payload, user.userId);
  sendResponse(res, {
    httpStatusCode: status11.CREATED,
    success: true,
    message: "Idea created successfully",
    data: result
  });
});
var getAllIdeas2 = nextRes(async (req, res) => {
  const result = await IdeaService.getAllIdeas(req.query);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Ideas fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getSingleIdea = nextRes(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await IdeaService.getIdeaById(id, user);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Idea fetched successfully",
    data: result
  });
});
var updateIdea2 = nextRes(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const user = req.user;
  const result = await IdeaService.updateIdea(id, payload, user);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Idea updated successfully",
    data: result
  });
});
var deleteIdea2 = nextRes(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await IdeaService.deleteIdea(id, user);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Idea deleted successfully",
    data: result
  });
});
var IdeaController = {
  createIdea: createIdea2,
  getAllIdeas: getAllIdeas2,
  getSingleIdea,
  updateIdea: updateIdea2,
  deleteIdea: deleteIdea2
};

// src/modules/Idea/idea.validation.ts
import { z as z3 } from "zod";
var createIdeaValidation = z3.object({
  title: z3.string("Title must be provided"),
  problemStatement: z3.string("problemStatement must be provided"),
  solution: z3.string("solution must be provided"),
  description: z3.string("description must be provided"),
  image: z3.string().optional(),
  isPaid: z3.boolean().optional(),
  price: z3.number().optional(),
  categoryId: z3.string("category must be provided"),
  status: z3.enum([IdeaStatus.UNDER_REVIEW, IdeaStatus.DRAFT])
});
var updateIdeaValidation = z3.object({
  title: z3.string().optional(),
  problemStatement: z3.string().optional(),
  solution: z3.string().optional(),
  description: z3.string().optional(),
  image: z3.string().optional(),
  isPaid: z3.boolean().optional(),
  price: z3.number().optional(),
  status: z3.enum([IdeaStatus.UNDER_REVIEW, IdeaStatus.DRAFT]).optional(),
  feedback: z3.string().optional()
});

// src/config/multer.config.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
var storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLocaleLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
    const folder = extension === "pdf" ? "pdfs" : "images";
    return {
      folder: `greenforge/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var multerUpload = multer({ storage });

// src/modules/Idea/idea.route.ts
var router3 = express2.Router();
router3.post(
  "/",
  verifyAuthToken(Role.MEMBER),
  multerUpload.single("file"),
  validateRequest(createIdeaValidation),
  IdeaController.createIdea
);
router3.get("/", IdeaController.getAllIdeas);
router3.get(
  "/:id",
  verifyAuthToken(Role.MEMBER, Role.ADMIN),
  IdeaController.getSingleIdea
);
router3.patch(
  "/:id",
  verifyAuthToken(Role.MEMBER, Role.ADMIN),
  validateRequest(updateIdeaValidation),
  IdeaController.updateIdea
);
router3.delete(
  "/:id",
  verifyAuthToken(Role.MEMBER, Role.ADMIN),
  IdeaController.deleteIdea
);
var IdeaRoutes = router3;

// src/modules/Comments/comments.route.ts
import express3 from "express";

// src/modules/Comments/comments.validation.ts
import { z as z4 } from "zod";
var createCommentValidation = z4.object({
  content: z4.string().min(1),
  ideaId: z4.string(),
  parentId: z4.string().optional(),
  rating: z4.number().min(1).max(10).optional()
});
var updateCommentValidation = z4.object({
  content: z4.string().optional(),
  rating: z4.number().min(1).max(10).optional()
});

// src/modules/Comments/comments.controller.ts
import status13 from "http-status";

// src/modules/Comments/comments.service.ts
import status12 from "http-status";
var createComment = async (payload, userId) => {
  const idea = await prisma.idea.findUnique({
    where: { id: payload.ideaId }
  });
  if (!idea) {
    throw new AppError_default(status12.NOT_FOUND, "Idea not found");
  }
  if (payload.rating && (payload.rating < 1 || payload.rating > 10)) {
    throw new AppError_default(status12.BAD_REQUEST, "Rating must be between 1\u201310");
  }
  const result = await prisma.comment.create({
    data: {
      content: payload.content,
      ideaId: payload.ideaId,
      parentId: payload.parentId || null,
      rating: payload.rating,
      userId
    }
  });
  return result;
};
var getReplies = async (parentId) => {
  const replies = await prisma.comment.findMany({
    where: { parentId },
    include: {
      user: true,
      _count: {
        select: {
          replies: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });
  return replies;
};
var updateComment = async (id, payload, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id }
  });
  if (!comment) {
    throw new AppError_default(status12.NOT_FOUND, "Comment not found");
  }
  if (comment.userId !== userId) {
    throw new AppError_default(status12.FORBIDDEN, "Not allowed");
  }
  return prisma.comment.update({
    where: { id },
    data: payload
  });
};
var deleteComment = async (id, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id }
  });
  if (!comment) {
    throw new AppError_default(status12.NOT_FOUND, "Comment not found");
  }
  if (comment.userId !== userId) {
    throw new AppError_default(status12.FORBIDDEN, "Not allowed");
  }
  await prisma.comment.delete({
    where: { id }
  });
  return { message: "Comment deleted successfully" };
};
var CommentService = {
  createComment,
  getReplies,
  updateComment,
  deleteComment
};

// src/modules/Comments/comments.controller.ts
var createComment2 = nextRes(async (req, res) => {
  const user = req.user;
  const result = await CommentService.createComment(
    req.body,
    user.userId
  );
  sendResponse(res, {
    httpStatusCode: status13.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result
  });
});
var getReplies2 = nextRes(async (req, res) => {
  const { parentId } = req.params;
  const result = await CommentService.getReplies(parentId);
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Replies fetched successfully",
    data: result
  });
});
var updateComment2 = nextRes(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const result = await CommentService.updateComment(
    id,
    req.body,
    user.userId
  );
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Comment updated successfully",
    data: result
  });
});
var deleteComment2 = nextRes(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const result = await CommentService.deleteComment(id, user.userId);
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result
  });
});
var CommentController = {
  createComment: createComment2,
  getReplies: getReplies2,
  updateComment: updateComment2,
  deleteComment: deleteComment2
};

// src/modules/Comments/comments.route.ts
var router4 = express3.Router();
router4.post(
  "/",
  verifyAuthToken(Role.MEMBER),
  validateRequest(createCommentValidation),
  CommentController.createComment
);
router4.get("/replies/:parentId", CommentController.getReplies);
router4.patch(
  "/:id",
  verifyAuthToken(Role.MEMBER),
  validateRequest(updateCommentValidation),
  CommentController.updateComment
);
router4.delete(
  "/:id",
  verifyAuthToken(Role.MEMBER),
  CommentController.deleteComment
);
var CommentsRoutes = router4;

// src/modules/payment/payment.route.ts
import { Router as Router2 } from "express";

// src/modules/payment/payment.controller.ts
import status15 from "http-status";

// src/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envFile.STRIPE.STRIPE_SECRET_KEY);

// src/modules/payment/payment.service.ts
import { v7 as uuidv7 } from "uuid";
import status14 from "http-status";
var createCheckoutSession = async (userId, ideaId) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId }
  });
  if (!idea || !idea.isPaid || !idea.price) {
    throw new AppError_default(status14.NOT_FOUND, "Paid idea not found or invalid");
  }
  const existing = await prisma.payment.findFirst({
    where: {
      userId,
      ideaId,
      status: PaymentStatus.SUCCESS
    }
  });
  if (existing) {
    throw new AppError_default(status14.BAD_REQUEST, "Already purchased");
  }
  const transactionId = String(uuidv7());
  const session = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        userId,
        ideaId,
        amount: idea.price,
        transactionId,
        status: PaymentStatus.PENDING
      }
    });
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(idea.price * 120),
            product_data: {
              name: idea.title
            }
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      /**
       * 🔗 VERY IMPORTANT
       */
      metadata: {
        userId,
        ideaId,
        paymentId: payment.id,
        transactionId
      },
      payment_intent_data: {
        metadata: {
          userId,
          ideaId,
          paymentId: payment.id,
          transactionId
        }
      }
    });
    return stripeSession;
  });
  return session;
};
var getMyPayments = async (userId) => {
  const payments = await prisma.payment.findMany({
    where: {
      userId,
      status: "SUCCESS"
      // only successful purchases (you can remove if you want all)
    },
    include: {
      idea: {
        select: {
          id: true,
          title: true,
          image: true,
          price: true,
          isPaid: true,
          category: {
            select: {
              name: true
            }
          },
          member: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return payments;
};
var PaymentService = {
  createCheckoutSession,
  getMyPayments
};

// src/modules/payment/payment.controller.ts
var createCheckoutSession2 = nextRes(async (req, res) => {
  const userId = req.user.id;
  const { ideaId } = req.body;
  const result = await PaymentService.createCheckoutSession(
    userId,
    ideaId
  );
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Payment done successfully",
    data: result
  });
});
var getMyPayments2 = nextRes(async (req, res) => {
  const userId = req.user.id;
  const result = await PaymentService.getMyPayments(
    userId
  );
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Payment done successfully",
    data: result
  });
});
var PaymentController = {
  createCheckoutSession: createCheckoutSession2,
  getMyPayments: getMyPayments2
};

// src/modules/payment/payment.route.ts
var router5 = Router2();
router5.post(
  "/checkout",
  verifyAuthToken(Role.MEMBER),
  PaymentController.createCheckoutSession
);
router5.get(
  "/my-payments",
  verifyAuthToken(Role.MEMBER),
  PaymentController.getMyPayments
);
var PaymentRoutes = router5;

// src/modules/Admin/admin.route.ts
import express4 from "express";

// src/modules/Admin/admin.controller.ts
import status17 from "http-status";

// src/modules/Admin/admin.service.ts
import status16 from "http-status";

// src/modules/Admin/admin.constant.ts
var adminUserSearchableFields = ["email", "name"];
var adminUserFilterableFields = ["role", "status"];
var adminIdeaSearchableFields = [
  "title",
  "description",
  "problemStatement"
];
var adminIdeaFilterableFields = [
  "status",
  "isPaid",
  "categoryId"
];

// src/modules/Admin/admin.service.ts
var getAllUsers = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.user, query, {
    searchableFields: adminUserSearchableFields,
    filterableFields: adminUserFilterableFields
  });
  const result = await queryBuilder.search().filter().include({
    member: true,
    admin: true
  }).paginate().sort().fields().execute();
  return result;
};
var updateUser = async (id, payload) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });
  if (!user) {
    throw new AppError_default(status16.NOT_FOUND, "User not found");
  }
  const result = await prisma.user.update({
    where: { id },
    data: payload
  });
  return result;
};
var getAllIdeasAdmin = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.idea, query, {
    searchableFields: adminIdeaSearchableFields,
    filterableFields: adminIdeaFilterableFields
  });
  const ideas = await queryBuilder.search().filter().include({
    category: true,
    member: true,
    votes: {
      select: {
        type: true
      }
    },
    _count: {
      select: {
        comments: true
      }
    }
  }).paginate().sort().fields().execute();
  const result = ideas.data.map((idea) => {
    let upvotes = 0;
    let downvotes = 0;
    idea.votes.forEach((v) => {
      if (v.type === "UP") upvotes++;
      if (v.type === "DOWN") downvotes++;
    });
    return {
      ...idea,
      voteSummary: {
        upvotes,
        downvotes,
        score: upvotes - downvotes
      },
      votes: void 0
    };
  });
  return {
    ...ideas,
    data: result
  };
};
var updateIdeaStatus = async (id, payload) => {
  const idea = await prisma.idea.findUnique({
    where: { id }
  });
  if (!idea) {
    throw new AppError_default(status16.NOT_FOUND, "Idea not found");
  }
  return prisma.idea.update({
    where: { id },
    data: {
      status: payload.status,
      feedback: payload.feedback
    }
  });
};
var featureIdea = async (id, payload) => {
  const idea = await prisma.idea.findUnique({
    where: { id }
  });
  if (!idea) {
    throw new AppError_default(status16.NOT_FOUND, "Idea not found");
  }
  return prisma.idea.update({
    where: { id },
    data: {
      isfeatures: payload.isfeatures
    }
  });
};
var deleteIdea3 = async (id) => {
  const idea = await prisma.idea.findUnique({
    where: { id }
  });
  if (!idea) {
    throw new AppError_default(status16.NOT_FOUND, "Idea not found");
  }
  await prisma.idea.delete({
    where: { id }
  });
  return { message: "Idea deleted successfully" };
};
var deleteComment3 = async (id) => {
  const comment = await prisma.comment.findUnique({
    where: { id }
  });
  if (!comment) {
    throw new AppError_default(status16.NOT_FOUND, "Comment not found");
  }
  await prisma.comment.delete({
    where: { id }
  });
  return { message: "Comment deleted successfully" };
};
var getDashboardOverview = async () => {
  const totalUsers = await prisma.user.count();
  const totalIdeas = await prisma.idea.count();
  const approvedIdeas = await prisma.idea.count({
    where: { status: "APPROVED" }
  });
  const pendingIdeas = await prisma.idea.count({
    where: { status: "UNDER_REVIEW" }
  });
  const rejectedIdeas = await prisma.idea.count({
    where: { status: "REJECTED" }
  });
  const totalComments = await prisma.comment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true
    }
  });
  return {
    totalUsers,
    totalIdeas,
    approvedIdeas,
    pendingIdeas,
    rejectedIdeas,
    totalComments,
    totalRevenue: totalRevenue._sum.amount || 0
  };
};
var getIdeaChart = async () => {
  const ideas = await prisma.idea.findMany({
    select: {
      createdAt: true
    }
  });
  const monthlyData = {};
  ideas.forEach((idea) => {
    const month = new Date(idea.createdAt).toLocaleString("default", {
      month: "short"
    });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  return Object.keys(monthlyData).map((month) => ({
    month,
    ideas: monthlyData[month]
  }));
};
var getPaymentChart = async () => {
  const payments = await prisma.payment.findMany({
    select: {
      createdAt: true,
      amount: true
    }
  });
  const monthlyRevenue = {};
  payments.forEach((p) => {
    const month = new Date(p.createdAt).toLocaleString("default", {
      month: "short"
    });
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
  });
  return Object.keys(monthlyRevenue).map((month) => ({
    month,
    revenue: monthlyRevenue[month]
  }));
};
var getVoteComparison = async () => {
  const upvotes = await prisma.vote.count({
    where: { type: "UP" }
  });
  const downvotes = await prisma.vote.count({
    where: { type: "DOWN" }
  });
  return [
    { name: "Upvotes", value: upvotes },
    { name: "Downvotes", value: downvotes }
  ];
};
var getLatestIdeas = async (limit) => {
  const ideas = await prisma.idea.findMany({
    where: {
      status: "APPROVED"
    },
    take: limit,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      category: true,
      member: true,
      votes: {
        select: {
          type: true
        }
      },
      _count: {
        select: {
          comments: true
        }
      }
    }
  });
  const result = ideas.map((idea) => {
    let upvotes = 0;
    let downvotes = 0;
    idea.votes.forEach((v) => {
      if (v.type === "UP") upvotes++;
      if (v.type === "DOWN") downvotes++;
    });
    return {
      ...idea,
      voteSummary: {
        upvotes,
        downvotes,
        score: upvotes - downvotes
      },
      votes: void 0
    };
  });
  return result;
};
var AdminService = {
  getAllUsers,
  updateUser,
  getAllIdeasAdmin,
  updateIdeaStatus,
  featureIdea,
  deleteIdea: deleteIdea3,
  deleteComment: deleteComment3,
  getDashboardOverview,
  getIdeaChart,
  getPaymentChart,
  getVoteComparison,
  getLatestIdeas
};

// src/modules/Admin/admin.controller.ts
var getAllUsers2 = nextRes(async (req, res) => {
  const result = await AdminService.getAllUsers(req.query);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Users fetched successfully",
    data: result
  });
});
var updateUser2 = nextRes(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.updateUser(id, req.body);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "User updated successfully",
    data: result
  });
});
var getAllIdeasAdmin2 = nextRes(async (req, res) => {
  const result = await AdminService.getAllIdeasAdmin(req.query);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Ideas fetched successfully",
    data: result
  });
});
var updateIdeaStatus2 = nextRes(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.updateIdeaStatus(id, req.body);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Idea status updated",
    data: result
  });
});
var featureIdea2 = nextRes(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.featureIdea(id, req.body);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Idea feature updated",
    data: result
  });
});
var deleteIdea4 = nextRes(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.deleteIdea(id);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: result.message
  });
});
var deleteComment4 = nextRes(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.deleteComment(id);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: result.message
  });
});
var getDashboardOverview2 = nextRes(async (req, res) => {
  const result = await AdminService.getDashboardOverview();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Dashboard overview fetched",
    data: result
  });
});
var getIdeaChart2 = nextRes(async (req, res) => {
  const result = await AdminService.getIdeaChart();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Idea chart data",
    data: result
  });
});
var getPaymentChart2 = nextRes(async (req, res) => {
  const result = await AdminService.getPaymentChart();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Payment chart data",
    data: result
  });
});
var getVoteComparison2 = nextRes(async (req, res) => {
  const result = await AdminService.getVoteComparison();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Vote comparison fetched",
    data: result
  });
});
var getLatestIdeas2 = nextRes(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const result = await AdminService.getLatestIdeas(limit);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Latest ideas fetched",
    data: result
  });
});
var AdminController = {
  getAllUsers: getAllUsers2,
  updateUser: updateUser2,
  getAllIdeasAdmin: getAllIdeasAdmin2,
  updateIdeaStatus: updateIdeaStatus2,
  featureIdea: featureIdea2,
  deleteIdea: deleteIdea4,
  deleteComment: deleteComment4,
  getDashboardOverview: getDashboardOverview2,
  getIdeaChart: getIdeaChart2,
  getPaymentChart: getPaymentChart2,
  getVoteComparison: getVoteComparison2,
  getLatestIdeas: getLatestIdeas2
};

// src/modules/Admin/admin.validation.ts
import { z as z5 } from "zod";
var updateUserValidation = z5.object({
  status: z5.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED])
});
var updateIdeaStatusValidation = z5.object({
  status: z5.enum([IdeaStatus.APPROVED, IdeaStatus.DRAFT, IdeaStatus.REJECTED, IdeaStatus.UNDER_REVIEW]),
  feedback: z5.string().optional()
});
var featureIdeaValidation = z5.object({
  isfeatures: z5.boolean()
});

// src/modules/Admin/admin.route.ts
var router6 = express4.Router();
router6.use(verifyAuthToken(Role.ADMIN));
router6.get("/users", AdminController.getAllUsers);
router6.patch(
  "/users/:id",
  validateRequest(updateUserValidation),
  AdminController.updateUser
);
router6.get("/ideas", AdminController.getAllIdeasAdmin);
router6.patch(
  "/ideas/:id/status",
  validateRequest(updateIdeaStatusValidation),
  AdminController.updateIdeaStatus
);
router6.patch(
  "/ideas/:id/feature",
  validateRequest(featureIdeaValidation),
  AdminController.featureIdea
);
router6.delete("/ideas/:id", AdminController.deleteIdea);
router6.delete("/comments/:id", AdminController.deleteComment);
router6.get("/overview", AdminController.getDashboardOverview);
router6.get("/chart/ideas", AdminController.getIdeaChart);
router6.get("/chart/payments", AdminController.getPaymentChart);
router6.get("/chart/votes", AdminController.getVoteComparison);
router6.get("/ideas/latest", AdminController.getLatestIdeas);
var AdminRoutes = router6;

// src/modules/Vote/vote.route.ts
import express5 from "express";

// src/modules/Vote/vote.controller.ts
import status19 from "http-status";

// src/modules/Vote/vote.service.ts
import status18 from "http-status";
var voteIdea = async (payload, userId) => {
  const { ideaId, type } = payload;
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId }
  });
  if (!idea) {
    throw new AppError_default(status18.NOT_FOUND, "Idea not found");
  }
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId
      }
    }
  });
  if (existingVote && existingVote.type === type) {
    await prisma.vote.delete({
      where: {
        userId_ideaId: {
          userId,
          ideaId
        }
      }
    });
    return { message: "Vote removed" };
  }
  if (existingVote) {
    const updated = await prisma.vote.update({
      where: {
        userId_ideaId: {
          userId,
          ideaId
        }
      },
      data: { type }
    });
    return { message: "Vote updated", data: updated };
  }
  const created = await prisma.vote.create({
    data: {
      userId,
      ideaId,
      type
    }
  });
  return { message: "Vote added", data: created };
};
var getUserVote = async (ideaId, userId) => {
  const vote = await prisma.vote.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId
      }
    }
  });
  return vote;
};
var VoteService = {
  voteIdea,
  getUserVote
};

// src/modules/Vote/vote.controller.ts
var voteIdea2 = nextRes(async (req, res) => {
  const user = req.user;
  const result = await VoteService.voteIdea(
    req.body,
    user.userId
  );
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: result.message,
    data: result.data || null
  });
});
var getUserVote2 = nextRes(async (req, res) => {
  const user = req.user;
  const { ideaId } = req.params;
  const result = await VoteService.getUserVote(
    ideaId,
    user.userId
  );
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: "User vote fetched successfully",
    data: result
  });
});
var VoteController = {
  voteIdea: voteIdea2,
  getUserVote: getUserVote2
};

// src/modules/Vote/vote.validation.ts
import { z as z6 } from "zod";

// src/modules/Vote/vote.constant.ts
var voteTypes = ["UP", "DOWN"];

// src/modules/Vote/vote.validation.ts
var voteValidation = z6.object({
  ideaId: z6.string(),
  type: z6.enum(voteTypes)
});

// src/modules/Vote/vote.route.ts
var router7 = express5.Router();
router7.post(
  "/",
  verifyAuthToken(Role.MEMBER),
  validateRequest(voteValidation),
  VoteController.voteIdea
);
router7.get(
  "/:ideaId",
  verifyAuthToken(Role.MEMBER),
  VoteController.getUserVote
);
var VoteRoutes = router7;

// src/modules/Watchlist/watchlist.route.ts
import express6 from "express";

// src/modules/Watchlist/watchlist.controller.ts
import status21 from "http-status";

// src/modules/Watchlist/watchlist.service.ts
import status20 from "http-status";

// src/modules/Watchlist/watchlist.constant.ts
var WatchlistMessage = {
  ADDED: "Added to watchlist",
  REMOVED: "Removed from watchlist",
  FETCHED: "Watchlist fetched",
  CHECKED: "Watchlist status fetched",
  ALREADY_EXISTS: "Already in watchlist",
  NOT_FOUND: "Not found in watchlist"
};

// src/modules/Watchlist/watchlist.service.ts
var addToWatchlist = async (userId, ideaId) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId }
  });
  if (!idea) {
    throw new AppError_default(status20.NOT_FOUND, "Idea not found");
  }
  try {
    const result = await prisma.watchlist.create({
      data: { userId, ideaId }
    });
    return result;
  } catch (error) {
    throw new AppError_default(status20.BAD_REQUEST, WatchlistMessage.ALREADY_EXISTS);
  }
};
var removeFromWatchlist = async (userId, ideaId) => {
  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId
      }
    }
  });
  if (!existing) {
    throw new AppError_default(status20.NOT_FOUND, WatchlistMessage.NOT_FOUND);
  }
  await prisma.watchlist.delete({
    where: {
      userId_ideaId: {
        userId,
        ideaId
      }
    }
  });
  return null;
};
var getMyWatchlist = async (userId) => {
  return prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      idea: {
        include: {
          category: true,
          member: false
        }
      }
    }
  });
};
var checkWatchlist = async (userId, ideaId) => {
  const item = await prisma.watchlist.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId
      }
    }
  });
  return { isSaved: !!item };
};
var WatchlistService = {
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
  checkWatchlist
};

// src/modules/Watchlist/watchlist.controller.ts
var addToWatchlist2 = nextRes(async (req, res) => {
  const user = req.user;
  const { ideaId } = req.body;
  const result = await WatchlistService.addToWatchlist(
    user.userId,
    ideaId
  );
  sendResponse(res, {
    httpStatusCode: status21.OK,
    success: true,
    message: WatchlistMessage.ADDED,
    data: result
  });
});
var removeFromWatchlist2 = nextRes(async (req, res) => {
  const user = req.user;
  const { ideaId } = req.params;
  await WatchlistService.removeFromWatchlist(user.userId, ideaId);
  sendResponse(res, {
    httpStatusCode: status21.OK,
    success: true,
    message: WatchlistMessage.REMOVED
  });
});
var getMyWatchlist2 = nextRes(async (req, res) => {
  const user = req.user;
  const result = await WatchlistService.getMyWatchlist(user.userId);
  sendResponse(res, {
    httpStatusCode: status21.OK,
    success: true,
    message: WatchlistMessage.FETCHED,
    data: result
  });
});
var checkWatchlist2 = nextRes(async (req, res) => {
  const user = req.user;
  const { ideaId } = req.params;
  const result = await WatchlistService.checkWatchlist(
    user.userId,
    ideaId
  );
  sendResponse(res, {
    httpStatusCode: status21.OK,
    success: true,
    message: WatchlistMessage.CHECKED,
    data: result
  });
});
var WatchlistController = {
  addToWatchlist: addToWatchlist2,
  removeFromWatchlist: removeFromWatchlist2,
  getMyWatchlist: getMyWatchlist2,
  checkWatchlist: checkWatchlist2
};

// src/modules/Watchlist/watchlist.validation.ts
import { z as z7 } from "zod";
var addToWatchlistValidation = z7.object({
  ideaId: z7.string("Idea ID is required")
});

// src/modules/Watchlist/watchlist.route.ts
var router8 = express6.Router();
router8.post(
  "/",
  verifyAuthToken(Role.MEMBER),
  validateRequest(addToWatchlistValidation),
  WatchlistController.addToWatchlist
);
router8.delete(
  "/:ideaId",
  verifyAuthToken(Role.MEMBER),
  WatchlistController.removeFromWatchlist
);
router8.get(
  "/my",
  verifyAuthToken(Role.MEMBER),
  WatchlistController.getMyWatchlist
);
router8.get(
  "/check/:ideaId",
  verifyAuthToken(Role.MEMBER),
  WatchlistController.checkWatchlist
);
var WatchlistRoutes = router8;

// src/routes/index.ts
var router9 = Router3();
router9.use("/auth", AuthRoutes);
router9.use("/catagory", CategoryRoutes);
router9.use("/idea", IdeaRoutes);
router9.use("/comments", CommentsRoutes);
router9.use("/vote", VoteRoutes);
router9.use("/payment", PaymentRoutes);
router9.use("/admin", AdminRoutes);
router9.use("/watchlist", WatchlistRoutes);
var IndexRoutes = router9;

// src/middlewares/notFound.ts
import status22 from "http-status";
var notFound = (req, res) => {
  res.status(status22.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app.ts
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";

// src/modules/strip-webhook/WEbhookPayment.controller.ts
import status23 from "http-status";

// src/modules/strip-webhook/webhookPayment.service.ts
var handlerStripeWebhookEvent = async (event) => {
  const existingEvent = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  });
  if (existingEvent) {
    console.log(`Event ${event.id} already processed`);
    return { message: "Event already processed" };
  }
  switch (event.type) {
    /**
     * =========================
     * SUCCESS PAYMENT
     * =========================
     */
    case "checkout.session.completed": {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      const transactionId = session.metadata?.transactionId;
      if (!paymentId || !transactionId) {
        console.error("Missing paymentId or transactionId");
        return { message: "Missing metadata" };
      }
      await prisma.payment.update({
        where: {
          id: paymentId
        },
        data: {
          status: session.payment_status === "paid" ? PaymentStatus.SUCCESS : PaymentStatus.PENDING,
          stripeEventId: event.id,
          paymentGatewayData: session
        }
      });
      console.log(`Payment SUCCESS updated: ${paymentId}`);
      break;
    }
    /**
     * =========================
     * PAYMENT FAILED
     * =========================
     */
    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      const transactionId = intent.metadata?.transactionId;
      if (!transactionId) {
        console.error("Missing transactionId in intent metadata");
        break;
      }
      await prisma.payment.update({
        where: {
          transactionId
        },
        data: {
          status: PaymentStatus.FAILED,
          stripeEventId: event.id,
          paymentGatewayData: intent
        }
      });
      console.log(`Payment FAILED: ${transactionId}`);
      break;
    }
    /**
     * =========================
     * SESSION EXPIRED
     * =========================
     */
    case "checkout.session.expired": {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      if (!paymentId) {
        console.error("Missing paymentId in session metadata");
        break;
      }
      await prisma.payment.update({
        where: {
          id: paymentId
        },
        data: {
          status: PaymentStatus.FAILED,
          stripeEventId: event.id
        }
      });
      console.log(`Session expired: ${paymentId}`);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
      break;
  }
  return { message: `Processed event ${event.id}` };
};
var WebhookPaymentService = {
  handlerStripeWebhookEvent
};

// src/modules/strip-webhook/WEbhookPayment.controller.ts
var handleStripeWebhookEvent = nextRes(
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const webhookSecret = envFile.STRIPE.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webhookSecret) {
      console.error("Missing Stripe signature or webhook secret");
      return res.status(status23.BAD_REQUEST).json({
        message: "Missing Stripe signature or webhook secret"
      });
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error("Error processing Stripe webhook:", error.message);
      return res.status(status23.BAD_REQUEST).json({
        message: "Invalid Stripe webhook signature"
      });
    }
    try {
      const result = await WebhookPaymentService.handlerStripeWebhookEvent(event);
      return res.status(status23.OK).json({
        success: true,
        message: "Stripe webhook event processed successfully",
        data: result
      });
    } catch (error) {
      console.error("Webhook handling error:", error.message);
      return res.status(status23.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error handling Stripe webhook event"
      });
    }
  }
);
var WebhookPaymentController = {
  handleStripeWebhookEvent
};

// src/app.ts
var app = express7();
app.use(cors());
app.use("/api/auth", toNodeHandler(auth));
app.use(express7.json());
app.use(cookieParser());
app.use(express7.urlencoded({ extended: true }));
app.post("/webhook", express7.raw({ type: "application/json" }), WebhookPaymentController.handleStripeWebhookEvent);
app.use("/api/v1", IndexRoutes);
app.get("/", (req, res) => {
  res.send("Hello from green forge World.....");
});
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/config/index.ts
import dotenv2 from "dotenv";
import path3 from "path";
dotenv2.config({ path: path3.join(process.cwd(), ".env") });
var config_default = {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL
};

// src/server.ts
async function main() {
  try {
    app_default.listen(config_default.port, () => {
      console.log(`green Forge app listening on port ${config_default.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}
main();
