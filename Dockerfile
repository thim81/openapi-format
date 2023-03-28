FROM node:lts-alpine
RUN npm install -g openapi-format

LABEL org.opencontainers.image.source https://github.com/thim81/openapi-format

ENTRYPOINT ["openapi-format"]
