FROM node:20.18.1-alpine

RUN apk update && apk add git

WORKDIR /app

# Copy package files and install Node dependencies.
ENV NPM_CONFIG_LOGLEVEL=warn
COPY package*.json .npmrc ./
RUN npm ci

# Copy the entire directory.
COPY . ./

# Calculate git build info, so we don't have to keep .git directory around.
RUN GIT_COMMIT_SHA=$(git rev-parse HEAD) && \
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD) && \
    echo "GIT_COMMIT_SHA=${GIT_COMMIT_SHA}" > /app/.env.git && \
    echo "GIT_BRANCH=${GIT_BRANCH}" >> /app/.env.git && \
    rm -rf .git

ENV PORT=3000 \
    NODE_ENV=production
EXPOSE $PORT

# We need to build at container startup to get the latest libraries from the registry.
CMD ["sh", "-c", "export $(cat /app/.env.git | xargs) && npm run build-and-start"]
