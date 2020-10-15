# Option
#===============================================================
PROFILE_OPTION       :=

# Task
#===============================================================

## デプロイします
.PHONY: cf-deploy
cf-deploy: .cf-check-env .set-profile
	aws $(PROFILE_OPTION) s3 sync ./dist s3://$(BUCKET_NAME) --delete
	aws $(PROFILE_OPTION) cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths '/*'

# internal task
#===============================================================
## aws cliのprofile設定
.set-profile:
ifneq ($(PROFILE),)
	$(eval PROFILE_OPTION := --profile $(PROFILE))
endif

## 環境変数の存在チェック
.cf-check-env:
ifeq ($(BUCKET_NAME),)
	$(error "invalid BUCKET_NAME=$(BUCKET_NAME)")
endif
ifeq ($(DISTRIBUTION_ID),)
	$(error "invalid DISTRIBUTION_ID=$(DISTRIBUTION_ID)")
endif
