FROM node:12-alpine

LABEL "com.github.actions.name"="Publish to npm"
LABEL "com.github.actions.description"="Automatically publish new versions to npm"
LABEL "com.github.actions.icon"="package"
LABEL "com.github.actions.color"="blue"

RUN apk add --no-cache git openssl

COPY . /tmp/src/

RUN yarn global add --production true "file:/tmp/src" && rm -rf /tmp/src

ENTRYPOINT [ "tag-gh-publish-action" ]
