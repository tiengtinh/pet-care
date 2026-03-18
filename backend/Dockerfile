FROM node:21-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# npx prisma generate will be run inside the container later or manually, 
# for now just install
EXPOSE 3000
