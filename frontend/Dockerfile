# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Environment variables
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=https://portfolio-backend-824962762241.us-central1.run.app

# Copy built app from previous stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Next.js listens on port 3000 by default
EXPOSE 3000

# Set the start command - directly use server.js
CMD ["node", "server.js"] 