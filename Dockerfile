FROM node:lts-alpine
RUN npm install -g openapi-format

ENTRYPOINT ["openapi-format"]
