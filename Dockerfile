FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend assets
COPY client/dist/ ../client/dist/

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/server.js"]
