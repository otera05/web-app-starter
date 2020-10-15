FROM golang:1.13-alpine as builder
RUN apk add git gcc libc-dev make bash
RUN mkdir -p /src
WORKDIR /src
ADD go.mod .
VOLUME /go/pkg/mod
COPY . .
RUN make setup && make build
RUN make install PREFIX=/usr/local INSTALL_BIN=app

FROM alpine:3.10.3
RUN apk --no-cache upgrade && apk --no-cache add tzdata
WORKDIR /bin
COPY --from=builder /usr/local/bin/app /bin/app
CMD [ "./app" ]