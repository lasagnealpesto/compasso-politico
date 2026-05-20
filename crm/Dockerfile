FROM node:20-slim

RUN apt-get update && apt-get install -y git ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia tutto il repo (serve per data/, public/carousels/, data/newsletters/)
COPY . .

# Installa dipendenze CRM
WORKDIR /app/crm
RUN npm install --omit=dev

WORKDIR /app

ENV PORT=8080
EXPOSE 8080

CMD ["node", "crm/server.mjs"]
