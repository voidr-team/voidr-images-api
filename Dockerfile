# Dockerfile
FROM node:20

# Crie um diretório para guardar o app
WORKDIR /usr/src/app

COPY src ./src
COPY .env ./
COPY package.json package-lock.json ./
COPY .eslintrc.json .prettierignore .prettierrc jsconfig.json ./
RUN npm install
RUN npm run lint

# Expõe a porta que o app usa
EXPOSE 3000

# Comando para rodar o app
CMD [ "npm", "run", "start" ]
