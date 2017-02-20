FROM node:boron-alpine
MAINTAINER "NativeCode Development (support@nativecode.com)"

RUN set -ex \
    && mkdir -p /etc/livestreamer/src \
;
ADD gulpfile.* /opt/livestreamer/
ADD package.json /opt/livestreamer/
ADD src /opt/livestreamer/src/

RUN set -ex \
    && apk update \
    && apk add livestreamer \
    && cd /opt/livestreamer \
    && npm install \
    && npm run build \
;

CMD ["node", "/opt/livestreamer/lib/"]
