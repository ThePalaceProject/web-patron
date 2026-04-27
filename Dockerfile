FROM node:20.18.1-alpine AS deps
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci

FROM node:20.18.1-alpine AS builder
# git is used by read-version.js as a fallback when _version.json is absent
RUN apk add --no-cache git
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:20.18.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000
# CONFIG_FILE must be supplied at container runtime as an environment variable.
# Set it to the path or URL of your YAML config file, e.g.:
#   docker run -e CONFIG_FILE=/run/secrets/config.yml ...
# The server throws AppSetupError on the first request if this is not set.
# standalone bundle contains server.js and a pruned node_modules;
# static and public must be copied alongside it
COPY --from=builder /app/_next/standalone ./
COPY --from=builder /app/_next/static ./_next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
