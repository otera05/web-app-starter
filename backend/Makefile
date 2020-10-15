# Option
#===============================================================
APP_ENV              :=
TAG_OPTION           :=
PROFILE_OPTION       :=

# Const
#===============================================================
PRODUCT_NAME         := TodonParty
STACK_NAME           := Backend
ENTRY_POINT          := todonpt
IMAGE_REPO           := $(CDK_DEFAULT_ACCOUNT).dkr.ecr.ap-northeast-1.amazonaws.com/todon-party

# include build-go.mk deploy-ecs.mk docker-ecr.mk
include .make/*.mk

## デプロイします
.PHONY: deploy
deploy:
	$(eval TAG_OPTION := $(shell date +'%Y-%m-%dT%H%M%S'))
	@$(MAKE) docker-build TAG_OPTION=$(TAG_OPTION)
	@$(MAKE) docker-push TAG_OPTION=$(TAG_OPTION)
	@$(MAKE) cdk-build APP_ENV=$(APP_ENV)
	@$(MAKE) cdk-deploy APP_ENV=$(APP_ENV) TAG_OPTION=$(TAG_OPTION)

## タグを指定してデプロイします
.PHONY: deploy-by-tag
deploy-by-tag:
ifeq ($(TAG_OPTION),)
	$(error "invalid TAG_OPTION=$(TAG_OPTION)")
endif
	@$(MAKE) cdk-build APP_ENV=$(APP_ENV)
	@$(MAKE) cdk-deploy APP_ENV=$(APP_ENV) TAG_OPTION=$(TAG_OPTION)

## デプロイした環境を破棄します
.PHONY: destroy
destroy:
	@$(MAKE) cdk-build APP_ENV=$(APP_ENV)
	@$(MAKE) cdk-destroy APP_ENV=$(APP_ENV)

# internal task
#===============================================================

## aws cliのprofile設定
.set-profile:
ifneq ($(PROFILE),)
	$(eval PROFILE_OPTION := --profile $(PROFILE))
endif
