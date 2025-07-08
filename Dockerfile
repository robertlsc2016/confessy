# Use a imagem oficial do Node.js com a versão mais recente
FROM node:20-bullseye

# Configure o diretório de trabalho
WORKDIR /app

# Copiar o package.json e o pnpm-lock.yaml (se houver)
COPY package.json package-lock.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos do projeto
COPY . .

# Defina o comando padrão para iniciar a aplicação
CMD ["npm", "start"]
