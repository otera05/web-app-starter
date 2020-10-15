# Option
#===============================================================
REVISION             := no-git
APPROVED_OPTION      := --require-approval never
ROLE_OPTION          :=


# Const
#===============================================================
APP_ENVS             := Demo Dev Stg Prd
CDK_DIR              := deployments
CDK_BIN              := $$(npm bin)/cdk

## CDK: cdkのテンプレートを作成します
.PHONY: cdk-init
cdk-init:
ifeq ($(shell command -v cdk 2> /dev/null),)
	@npm install -g aws-cdk
endif
ifeq ($(wildcard $(CDK_DIR)/.*),)
	@mkdir -p $(CDK_DIR)
	@cd $(CDK_DIR) && cdk init app --language typescript
	@echo "$$_cdk_entry_ts" > deployments/cdk/bin/cdk.ts
	@cat $(CDK_DIR)/package.json |  jq  '.scripts.fmt|="" | .scripts.lint|="" | .scripts.updateSnapshot="jest --updateSnapshot"' > $(CDK_DIR)/_package.json
	@rm $(CDK_DIR)/package.json && mv $(CDK_DIR)/_package.json $(CDK_DIR)/package.json
	@echo "cdk.context.json" >> $(CDK_DIR)/.gitignore
endif

## CDK: 必要なツール類をセットアップします
.PHONY: cdk-setup
cdk-setup:
	@cd $(CDK_DIR) && npm install

## CDK: 全てのソースの整形を行います
.PHONY: cdk-fmt
cdk-fmt:
	@cd $(CDK_DIR) && npm run fmt

## CDK: 全てのソースのLINTを実行します
.PHONY: cdk-lint
cdk-lint:
	@cd $(CDK_DIR) && npm run lint

## CDK: ユニットテストを実行します
.PHONY: cdk-test
cdk-test:
	@cd $(CDK_DIR) && npm test

## CDK: Cfnのスナップショットテストを更新します
.PHONY: cdk-update-snapshot
cdk-update-snapshot:
	@cd $(CDK_DIR) && npm run updateSnapshot

## CDK: ビルドを実行します
.PHONY: cdk-build
cdk-build:
	@cd $(CDK_DIR) && npm run build

## CDK: リリースビルドを実行します
.PHONY: cdk-release
cdk-release: cdk-fmt cdk-lint cdk-build cdk-test

## CDK: デプロイします
.PHONY: cdk-deploy
cdk-deploy: .cdk-check-env .cdk-set-revision .cdk-set-role-arn .cdk-set-profile
	cd $(CDK_DIR) && $(CDK_BIN) deploy -v $(PROFILE_OPTION) $(APPROVED_OPTION) $(ROLE_OPTION) \
		--context env=$(APP_ENV) \
		--context tag=$(TAG_OPTION) \
		--context revision=$(REVISION) \
		"$(PRODUCT_NAME)-$(APP_ENV)-$(STACK_NAME)"

## CDK: デプロイした環境を破棄します
.PHONY: cdk-destroy
cdk-destroy: .cdk-check-env .cdk-set-revision .cdk-set-role-arn .cdk-set-profile
	@cd $(CDK_DIR) && $(CDK_BIN) destroy $(PROFILE_OPTION) $(ROLE_OPTION) \
		--context env=$(APP_ENV) \
		--context tag=$(TAG_OPTION) \
		--context revision=$(REVISION) \
		"$(PRODUCT_NAME)-$(APP_ENV)-$(STACK_NAME)"

## CDK: ローカルのtemplateとデプロイしたもののDiffを表示します
.PHONY: cdk-diff
cdk-diff: .cdk-check-env .cdk-set-revision .cdk-set-role-arn cdk-build .cdk-set-profile
	@cd $(CDK_DIR) && $(CDK_BIN) diff $(PROFILE_OPTION) $(ROLE_OPTION) \
		--context env=$(APP_ENV) \
		--context tag=$(TAG_OPTION) \
		--context revision=$(REVISION) \
		"$(PRODUCT_NAME)-$(APP_ENV)-$(STACK_NAME)"

## CDK: CloudFormationのテンプレートを出力します
.PHONY: cdk-synth
cdk-synth: .cdk-check-env .cdk-set-revision  .cdk-set-role-arn cdk-build .cdk-set-profile
	@cd $(CDK_DIR) && $(CDK_BIN) synth $(PROFILE_OPTION) $(ROLE_OPTION) \
		--context env=$(APP_ENV) \
		--context tag=$(TAG_OPTION) \
		--context revision=$(REVISION) \
		"$(PRODUCT_NAME)-$(APP_ENV)-$(STACK_NAME)"

# internal task
#===============================================================
.cdk-check-env:
ifeq ($(filter $(APP_ENVS),$(APP_ENV)),)
	$(error "invalid APP_ENV=$(APP_ENV)")
endif
ifeq ($(STACK_NAME),)
	$(error "invalid STACK_NAME=$(STACK_NAME)")
endif
ifeq ($(CDK_DEFAULT_ACCOUNT),)
	$(error "invalid CDK_DEFAULT_ACCOUNT=$(CDK_DEFAULT_ACCOUNT)")
endif
ifeq ($(CDK_DEFAULT_REGION),)
	$(error "invalid CDK_DEFAULT_REGION=$(CDK_DEFAULT_REGION)")
endif

.cdk-set-revision:
	$(eval REVISION := $(shell if [[ $$REV = "" ]]; then git rev-parse --short HEAD; else echo $$REV;fi;))

.cdk-set-role-arn:
ifneq ($(ROLE_ARN),)
	$(eval ROLE_OPTION := --role-arn $(ROLE_ARN))
endif

.cdk-set-profile:
ifneq ($(PROFILE),)
	$(eval PROFILE_OPTION := --profile $(PROFILE))
endif

export _cdk_entry_ts
override define _cdk_entry_ts
#!/usr/bin/env node
import "source-map-support/register";
import cdk = require("@aws-cdk/core");
import { CdkStack } from "../lib/cdk-stack";

const app: cdk.App = new cdk.App();
const stackName: string = `$(PRODUCT_NAME)-$${app.node.tryGetContext(
  "env"
) || "Demo"}-$(STACK_NAME)`;

new CdkStack(app, stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
endef
