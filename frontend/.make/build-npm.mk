# Const
#===============================================================
OS                   := $(shell uname | tr A-Z a-z )

# Task
#===============================================================

# include environment variables
# ifneq ($(APP_ENV),)
# include $(ENV_FILE)
# export $(shell sed 's/=.*//' $(ENV_FILE))
# endif

# npm:必要なツール類をセットアップします
.PHONY: setup
setup:
	npm ci

ifeq ($(OS),darwin)
	git secrets --register-aws
endif

## npm:全てのソースの整形を行います
.PHONY: fmt
fmt:
	npm run fmt

## npm:全てのソースのLINTを実行します
.PHONY: lint
lint:
	npm run lint

## npm:ユニットテストを実行します
.PHONY: test
test:
	npm test

## npm:ビルドを実行します
.PHONY: build
build:
	npm run build

## npm:リリースビルドを実行します
.PHONY: release
release: fmt lint test build

.DEFAULT_GOAL := release

