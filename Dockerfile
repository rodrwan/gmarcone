# ---- Base Node ----
FROM node:carbon AS base
# Create app directory
WORKDIR /app
# ---- Dependencies ----
FROM base AS dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json yarn.lock ./
# install app dependencies including 'devDependencies'
RUN yarn

# ---- Copy Files/Build ----
FROM dependencies AS build
WORKDIR /app

# --- Release with Alpine ----
FROM node:alpine AS release
# Create app directory
WORKDIR /app
COPY darksky/ /app/darksky
COPY geocode/ /app/geocode
COPY restcountries/ /app/restcountries
COPY routes/ /app/routes
COPY server.js /app
# optional
# RUN npm -g install serve
COPY --from=dependencies /app/package.json ./
# Install app dependencies
RUN yarn install --production
COPY --from=build /app ./
EXPOSE 3001

CMD ["node", "server.js"]
