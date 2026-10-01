FROM node:22-alpine
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY index.js build-info.sh ./
# Build-time check. Add variables named BUILD_TOKEN, BUILD_FLAG or NPM_TOKEN with "Build only" (or
# "Build and running app") and /build will report that they reached the build. They are mounted as
# build secrets — not build args — and only their presence/length is recorded, never the value.
RUN --mount=type=secret,id=BUILD_TOKEN \
    --mount=type=secret,id=BUILD_FLAG \
    --mount=type=secret,id=NPM_TOKEN \
    sh build-info.sh BUILD_TOKEN BUILD_FLAG NPM_TOKEN > build-info.json
CMD ["node", "index.js"]
