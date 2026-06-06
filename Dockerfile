FROM node:20-alpine AS base

RUN apk add --no-cache dumb-init

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci

FROM base AS development

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

EXPOSE 9229

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--inspect=0.0.0.0:9229", "-e", "require('./dist/cjs/i18next.js'); console.log('i18next loaded successfully');"]