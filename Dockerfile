# -------- Base image --------
FROM node:18-slim

# -------- Install system deps for Puppeteer --------
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# -------- Set workdir --------
WORKDIR /app

# -------- Copy package files --------
COPY package*.json ./

# -------- Install dependencies --------
RUN npm install --production=false

# -------- Copy source --------
COPY . .

# -------- Build NestJS --------
RUN npm run build

# -------- Expose port --------
EXPOSE 3000

# -------- Puppeteer env --------
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

# -------- Start app --------
CMD ["node", "dist/main.js"]
