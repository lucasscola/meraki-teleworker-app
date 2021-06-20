FROM node:alpine AS builder

ENV CI=true
ENV NEXT_PUBLIC_APP_DOMAIN=https://meraki-selfservice-cloud.dev
ENV NEXT_PUBLIC_AZURE_CLIENT_ID=0bb9dd14-d2ed-473e-a643-030470c2e39b
ENV NEXT_PUBLIC_AZURE_BACKEND_CLIENT_ID=d88b8a7d-c31b-4e2e-ba3a-c3dff83e18db
ENV NEXT_PUBLIC_AZURE_TENANT_ID=b9723ca4-9bde-4447-97b2-504bd5d8c381
WORKDIR /app

COPY package.json ./
RUN npm install 

COPY ./ ./
RUN npm run build

FROM node:alpine AS runner

WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs


CMD ["npm", "run", "start"]