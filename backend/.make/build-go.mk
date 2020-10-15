# Const
#===============================================================
OS                   := $(shell uname | tr A-Z a-z )
SHELL                := /bin/bash
BUILD_OPTIONS        := -tags netgo -installsuffix netgo
PREFIX               := /usr/local
BIN_DIR              := bin

# Task
#===============================================================
# GO:必要なツール類をセットアップします
setup:
ifeq ($(shell command -v make2help 2> /dev/null),)
	go get -u github.com/Songmu/make2help/cmd/make2help
endif
ifeq ($(shell command -v golint 2> /dev/null),)
	go get -u golang.org/x/lint/golint
endif
ifeq ($(shell command -v goreturns 2> /dev/null),)
	go get -u github.com/sqs/goreturns
endif
ifeq ($(shell command -v make2help 2> /dev/null),)
	go get -u github.com/Songmu/make2help/cmd/make2help
endif
ifeq ($(shell command -v mockery 2> /dev/null),)
	go get -u github.com/vektra/mockery/.../
endif

ifeq ($(OS),darwin)
	git secrets --register-aws
endif

## GO:全てのソースの整形を行います
.PHONY: fmt
fmt:
	goreturns -w cmd/$(ENTRY_POINT)/main.go
	for pkg in $$(go list -f {{.Dir}} ./... | grep -v "$(ENTRY_POINT)$$"); do \
		goreturns -w $$pkg; \
	done

## GO:全てのソースのLINTを実行します
.PHONY: lint
lint:
	for pkg in $$(go list ./...); do \
		golint -set_exit_status $$pkg || exit $$?; \
	done

## GO:ユニットテストを実行します
.PHONY: test
test:
	go test $$(go list ./... | grep -v /test/ | tr '\n' ' ')

## GO:mockを更新します
.PHONY: mock
mock:
	if [ -d "pkg/controller/handler" ]; then \
		cd pkg/controller/handler && mockery -case underscore -all -keeptree; \
	fi
	if [ -d "pkg/controller/middleware" ]; then \
		cd pkg/controller/middleware && mockery -case underscore -all -keeptree; \
	fi
	if [ -d "pkg/usecase/repository" ]; then \
		cd pkg/usecase/repository && mockery -case underscore -all -keeptree; \
	fi
	if [ -d "pkg/usecase/service" ]; then \
		cd pkg/usecase/service && mockery -case underscore -all -keeptree; \
	fi
	$(MAKE) fmt

## GO:アダプターのテストを実行します(mockなし)
.PHONY: adapter-test
adapter-test:
	if [ -d "test/adapter" ]; then \
		go test -v ./test/adapter/...; \
	fi

## GO:サービスのテストを実行します(mockなし)
.PHONY: service-test
service-test:
	if [ -d "test/service" ]; then \
			go test -v ./test/service/...; \
	fi

## GO:ビルドを実行します
.PHONY: build
build: .go-set-revision
	$(eval ldflags  := -X 'main.revision=$(REVISION)' -extldflags '-static')
	GOOS=$(OS) GOARCH=amd64 CGO_ENABLED=0 go build -ldflags "$(ldflags)" -o $(BIN_DIR)/$(ENTRY_POINT) $(BUILD_OPTIONS) cmd/$(ENTRY_POINT)/main.go

## GO:PREFIX/bin/$INSTALL_BINにインストールします
.PHONY: install
install:
ifeq ($(INSTALL_BIN),)
	$(eval bin := $(ENTRY_POINT)_$(OS)_amd64)
else
	$(eval bin := $(INSTALL_BIN))
endif
	chmod +x $(BIN_DIR)/$(ENTRY_POINT)
	if [ ! -d $(PREFIX)/bin ]; then mkdir -p $(PREFIX)/bin; fi
	cp -a $(BIN_DIR)/$(ENTRY_POINT) $(PREFIX)/bin/$(bin)

## GO:リリースビルドを実行します
.PHONY: release
release: fmt lint test build

## REPO:ヘルプ
.PHONY: help
help:
	@make2help $(MAKEFILE_LIST)

.DEFAULT_GOAL := release

.go-set-revision:
	$(eval REVISION := $(shell if [[ $$REV = "" ]]; then git rev-parse --short HEAD; else echo $$REV;fi;))
