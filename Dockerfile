# build environment
FROM node:18.19.0-alpine as builder

RUN apk update
RUN apk add git

# we first copy just the package.json and run npm ci
# to take advantage of layer caching
ENV NPM_CONFIG_LOGLEVEL=warn
COPY package*.json ./
COPY .npmrc ./
RUN npm install --legacy-peer-deps

# then copy the rest of the files
COPY . ./

# Set some standard ENV
ENV PORT=3000 \	
    NODE_ENV=production	
EXPOSE $PORT

# CMD will set the default command that
# is run when running the docker container.
# In this case, we run build-and-start to 
# build the app with our env vars, delete
# unnecessary files, and start the app.
CMD npm run build-and-start
