FROM node:20-alpine
WORKDIR /app

# Copy dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy application files
COPY . .

# Set permissions for non-root environments (Hugging Face Spaces, etc.)
RUN chown -R 1000:1000 /app
USER 1000

# Default port (7860 for Hugging Face, or overridden by PORT environment variable)
ENV PORT=7860
EXPOSE 7860
ENV NODE_ENV=production

CMD ["node", "backend/server.js"]
