# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install necessary build dependencies 
RUN apk add --no-cache libc6-compat

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# NEXT_PUBLIC_* values are inlined at build time, so they must be present in
# the BUILD stage, not just the runtime stage.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GITHUB_URL=https://github.com/ErBishalBudhathoki
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_GITHUB_URL=${NEXT_PUBLIC_GITHUB_URL}

# Build the Next.js application with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install curl for health check
RUN apk --no-cache add curl

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_API_URL is consumed at build time above; keep it here too so the
# standalone server has it at runtime.
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set proper ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Set the start command
CMD ["node", "server.js"] 