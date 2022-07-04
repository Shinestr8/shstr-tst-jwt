FROM node:16.15.0-slim
ENV NODE_ENV=production

# WORKDIR /app
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 5000

CMD ["npm", "run", "server"]