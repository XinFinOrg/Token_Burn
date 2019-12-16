FROM node:10

WORKDIR /home/rudresh/docker-images/payment-intermediary/web

COPY ./package.json ./package.json

RUN npm install

COPY . . 


EXPOSE 3000

CMD ["npm", "run", "start"]