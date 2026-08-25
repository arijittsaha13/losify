# Losify

An iOS-inspired AI campus Lost & Found prototype built with Next.js, TypeScript, Prisma, MongoDB, and a server-side Groq integration.

## Run locally

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `HOD_EMAIL`, and (optionally) `GROQ_API_KEY`.
2. Create a MongoDB Atlas deployment and database named `losify`. Replace the `DATABASE_URL` placeholder in `.env` with its MongoDB connection string. Allow your local IP address in Atlas Network Access.
3. Run `npx prisma generate` and `npx prisma db push` to generate the client and create the collections/indexes.
4. Run `npm install` and `npm run dev`.
5. Visit `http://localhost:3000`.

## Groq

Create an API key in the Groq console and put it in `GROQ_API_KEY`. Calls are made only by `app/api/analyze/route.ts`; no key reaches the browser. With no key configured, the app returns safe `Unknown` fields and lets the student complete the form manually.

## Production wiring assumptions

- Authentication should provide the authenticated user id/role to report and HOD routes; the demo UI uses populated mock student data.
- Use an object store such as S3/Cloudinary for submitted images and pass its secure URL to the analysis endpoint.
- Connect an email provider (Resend/SMTP) to send the notification template after a confirmed match. The HOD recipient is read from `HOD_EMAIL`.
- Strong match threshold is 70 by default, aligning with the brief's “Strong” band.
- MongoDB uses ObjectId-backed document ids. MongoDB does not enforce foreign keys, so application authorization must always verify that a report belongs to the signed-in user.

## Main workflow

The demo flow is Report Lost → Report Found (upload) → AI animation/review → strong 92% match → private collection notification → HOD marks collected. The deterministic matcher in `services/itemMatching.ts` supports safe fallback; `services/itemAnalysis.ts` validates structured Groq output with Zod.
