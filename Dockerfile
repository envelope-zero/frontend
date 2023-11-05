FROM node:20.9.0-alpine AS builder
ENV NODE_ENV production
WORKDIR /app

# copy package.json first to avoid unnecessary npm install when other files change
# Unless packages change, this layer will be cached
COPY package.json package-lock.json /app/
COPY patches /app/patches

ARG GITHUB_TOKEN
RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc && \
    npm install --production

# Copy app files
COPY src /app/src
COPY public /app/public
COPY vite.config.ts tsconfig.json tailwind.config.js index.html .eslintrc.js postcss.config.js /app/

ARG VITE_VERSION=0.0.0

# Build the app
RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.25.3-alpine
ENV NODE_ENV production

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
