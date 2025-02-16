FROM alpine:latest

RUN apk add --no-cache curl bash

WORKDIR /usr/src/test
COPY test.sh .

RUN chmod +x test.sh

CMD ["bash", "test.sh"]
