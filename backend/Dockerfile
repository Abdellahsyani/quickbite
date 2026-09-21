FROM node:22-bookworm-slim

# We added python3, make, and g++ so node-gyp can compile bcrypt instantly
RUN apt update -y && apt install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# --no-audit --no-fund skips the annoying security/funding checks to speed up the build
RUN npm install --no-audit --no-fund
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx nodemon src/app.js"]
