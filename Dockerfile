FROM node:20.5.1-alpine AS builder
ENV NODE_ENV production
WORKDIR /app

# copy package.json first to avoid unnecessary npm install
COPY package.json package-lock.json /app/
RUN npm install

# Copy app files
COPY src /app/src
COPY public /app/public
COPY tsconfig.json tailwind.config.js index.html /app/

ARG VITE_VERSION=0.0.0

# Build the app
RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.25.2-alpine
ENV NODE_ENV production

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
