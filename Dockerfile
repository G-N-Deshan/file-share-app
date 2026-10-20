FROM node:20-alpine
WORKDIR /app

# Copy root and backend packages
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy application code (including pre-built frontend)
COPY . .

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "backend/server.js"]
