FROM node:20.18.1-alpine

RUN apk update && apk add git

WORKDIR /app

# Copy package files and install Node dependencies.
ENV NPM_CONFIG_LOGLEVEL=warn
COPY package*.json .npmrc ./
RUN npm ci

# Copy the entire directory.
COPY . ./

RUN rm -rf .git

ENV PORT=3000 \
    NODE_ENV=production
EXPOSE $PORT

# We need to build at container startup to get the latest libraries from the registry.
CMD ["npm", "run", "build-and-start"]
