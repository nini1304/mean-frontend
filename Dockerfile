# ----------- BUILD (Angular) -----------
FROM node:20-alpine AS build
WORKDIR /app

# Dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Código fuente
COPY . .

# Build Angular (producción)
RUN npm run build

# ----------- RUNTIME (Nginx) -----------
FROM nginx:1.27-alpine

# Config Nginx para SPA (Angular routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefactos del build
COPY --from=build /app/dist/mean-frontend/browser /usr/share/nginx/html


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
