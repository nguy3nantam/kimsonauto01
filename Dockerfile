FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm test && npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/server ./server
RUN cp -R server/data server/seeds \
    && mkdir -p server/uploads/images server/uploads/documents \
    && chown -R node:node server/uploads server/seeds
USER node
EXPOSE 3000
CMD ["node", "server/index.js"]
