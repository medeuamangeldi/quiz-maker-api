FROM node:24.4-alpine

WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install global prisma CLI (optional, can also use npx)
RUN npm install -g prisma

# Install dependencies
RUN npm install

# Copy Prisma schema and other source files AFTER installing dependencies
COPY prisma ./prisma/
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build your NestJS app
RUN npm run build

# Use the proper start command (adjust if needed)
CMD ["npm", "run", "start:migrate:prod"]
