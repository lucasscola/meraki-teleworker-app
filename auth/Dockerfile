FROM node:lts

ARG NPM_TOKEN
WORKDIR /app
COPY ./package.json ./
RUN npm install --only=prod

COPY . .

CMD ["npm", "start"]