# Option
#===============================================================
APP_ENV                         :=
PROFILE                         :=
BUCKET_NAME                     := front.otera05.xyz
CLOUDFRONT_DISTRIBUTION_ID      := E15WBDXQY3V1UA

# Const
#===============================================================
PRODUCT_NAME         := TodonParty
STACK_NAME           := Frontend
ENTRY_POINT          := frontend
APP_ENVS             := Demo

# include build-npm.mk
include .make/*.mk

.PHONY: deploy
deploy:
	@$(MAKE) build
	@$(MAKE) cf-deploy \
	BUCKET_NAME="$(BUCKET_NAME)" \
	DISTRIBUTION_ID="$(CLOUDFRONT_DISTRIBUTION_ID)" \
	PROFILE="$(PROFILE)"

# internal task
#===============================================================

