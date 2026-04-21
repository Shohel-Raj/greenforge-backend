# GreenForge - Backend API

**Live API:** https://green-forge-gilt.vercel.app

GreenForge is a community-driven sustainability platform where users can share eco-friendly ideas, vote, comment, and collaborate to promote environmental solutions. This repository contains the backend REST API built with Node.js, Express, Prisma, and PostgreSQL.

---

## Overview

The backend provides secure, scalable APIs to support idea management, authentication, payments, and administrative controls. It follows a modular architecture and RESTful design principles.

---

## Features

### Authentication
- JWT-based authentication
- Secure password hashing
- Role-based authorization (Admin, Member)
- Access token and refresh token system

### Member Capabilities
- Create, update, and delete ideas
- Submit ideas for admin review
- Vote (upvote, downvote, remove vote)
- Manage personal watchlist
- Comment and reply (nested comments)
- Access paid ideas through Stripe integration

### Admin Capabilities
- Manage users and roles
- Approve or reject ideas with feedback
- Feature high-impact ideas
- Remove inappropriate comments
- Access dashboard analytics (ideas, payments, votes)

### Idea Management
- Image upload support
- Category-based classification
- Paid and free idea support
- Workflow: Under Review → Approved → Rejected

### Comment System
- Nested comments (reply system)
- Update and delete functionality

### Voting System
- Reddit-style voting logic
- Single vote per user
- Toggle voting support

### Payment Integration
- Stripe checkout session
- Webhook-based payment verification
- Access control for paid content

### Newsletter
- Email subscription support
- Admin management of subscribers

### Dashboard APIs
- Admin analytics endpoints
- Member dashboard overview and statistics

---

## Technology Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Stripe
- JWT / BetterAuth
- Zod (validation)
- Multer (file uploads)

---

## Project Structure

```
src/
 ┣ config/
 ┣ errors/
 ┣ interfaces/
 ┣ lib/
 ┣ middlewares/
 ┣ modules/
 ┃ ┣ Admin/
 ┃ ┣ Auth/
 ┃ ┣ Catagory/
 ┃ ┣ Comments/
 ┃ ┣ Idea/
 ┃ ┣ Member/
 ┃ ┣ Newsletter/
 ┃ ┣ payment/
 ┃ ┣ strip-webhook/
 ┃ ┣ Vote/
 ┃ ┗ Watchlist/
 ┣ routes/
 ┣ shared/
 ┣ templates/
 ┣ utils/
 ┣ app.ts
 ┗ server.ts
```

---

## Installation and Setup

### Clone the repository
```bash
git clone https://github.com/Shohel-Raj/greenforge-backend
cd greenforge-backend
```

### Install dependencies
```bash
pnpm install
```

### Configure environment variables

Create a `.env` file:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:12345@localhost:5432/mydb?schema=public"
NODE_ENV=development

BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:5000

FRONTEND_URL=http://localhost:3000
PROD_APP_URL=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRES_IN=7d

REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

EMAIL_SENDER_SMTP_USER=your_email
EMAIL_SENDER_SMTP_PASS=your_password
EMAIL_SENDER_SMTP_HOST=smtp.gmail.com
EMAIL_SENDER_SMTP_PORT=587
EMAIL_SENDER_SMTP_FROM=Green Forge

ADMIN_EMAIL=admin_email
ADMIN_PASSWORD=admin_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Run Prisma
```bash
npx prisma generate
npx prisma migrate dev
```

### Start the server
```bash
pnpm run dev
```

---

## API Base URL

```
https://green-forge-gilt.vercel.app/api/v1
```

---

## API Endpoints

### Authentication
```
POST   /auth/register
POST   /auth/login
GET    /auth/me
POST   /auth/change-password
POST   /auth/logout
POST   /auth/refresh-token
```

### Member
```
GET /member/dashboard/overview
GET /member/dashboard/chart/ideas
GET /member/dashboard/chart/votes
GET /member/dashboard/recent/ideas
```

### Idea
```
POST   /idea
GET    /idea
GET    /idea/:id
PATCH  /idea/:id
DELETE /idea/:id
```

### Comments
```
POST   /comments
GET    /comments/replies/:parentId
PATCH  /comments/:id
DELETE /comments/:id
```

### Vote
```
POST /vote
GET  /vote/:ideaId
```

### Watchlist
```
POST   /watchlist
DELETE /watchlist/:ideaId
GET    /watchlist/my
GET    /watchlist/check/:ideaId
```

### Payment
```
POST /payment/checkout
GET  /payment/my-payments
```

### Newsletter
```
POST   /newsletter/subscribe
GET    /newsletter
DELETE /newsletter/:id
```

### Admin
```
GET    /admin/users
PATCH  /admin/users/:id

GET    /admin/ideas
PATCH  /admin/ideas/:id/status
PATCH  /admin/ideas/:id/feature
DELETE /admin/ideas/:id

DELETE /admin/comments/:id

GET    /admin/overview
GET    /admin/chart/ideas
GET    /admin/chart/payments
GET    /admin/chart/votes
GET    /admin/ideas/latest
```

---

## Webhook

```
POST /webhook
```

Used for handling Stripe payment events.

---

## Error Handling

- Centralized global error handler
- Zod-based request validation
- Proper HTTP status codes
- Structured error responses

---

## Deployment

- Deployed on Vercel
- Serverless architecture
- Stripe webhook integration enabled

---

## Future Improvements

- Notification system
- Extended analytics
- Email automation services

---

## Author

Mohammed Shohel Raj

---

## License

This project is licensed for educational and portfolio purposes.

---

## Support

For feedback or contributions, please open an issue or submit a pull request.