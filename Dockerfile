# Dockerfile
FROM node:16

# Crie um diretório para guardar o app
WORKDIR /usr/src/app

# Expõe a porta que o app usa
EXPOSE 3000

# Comando para rodar o app
CMD [ "npm", "run", "dev" ]
