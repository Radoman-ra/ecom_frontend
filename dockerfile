FROM node:20.17.0

WORKDIR /app

COPY . .

RUN rm -rf package-lock.json node_modules && npm install

RUN npm run build

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
