# Option
#===============================================================
REVISION             := no-git
APPROVED             :=
PROFILE_OPTION       :=

# Const
#===============================================================
APP_ENVS             := Demo Dev Stg Prd
CDK_DIR              := .
CDK_BIN              := $$(npm bin)/cdk

APP_ENV              := Demo
PREFIX               := TodonParty
STACK_NAME           := VPC

# CDK: 必要なツール類をセットアップします
cdk-setup:
	@cd $(CDK_DIR) && npm install

# CDK: 全てのソースの整形を行います
cdk-fmt:
	@cd $(CDK_DIR) && npm run fmt

# CDK: 全てのソースのLINTを実行します
cdk-lint:
	@cd $(CDK_DIR) && npm run lint

# CDK: ユニットテストを実行します
cdk-test:
	@cd $(CDK_DIR) && npm test

# CDK: Cfnのスナップショットテストを更新します
cdk-update-snapshot:
	@cd $(CDK_DIR) && npm run updateSnapshot

# CDK: ビルドを実行します
cdk-build:
	@cd $(CDK_DIR) && npm run build

# CDK: リリースビルドを実行します
cdk-release: cdk-fmt cdk-lint cdk-test cdk-build

# CDK: デプロイします
cdk-deploy: .cdk-check-env .cdk-set-revision .cdk-set-profile cdk-build
ifneq ($(APP_ENV),Prd)
	$(eval APPROVED := --require-approval never)
endif
	cd $(CDK_DIR) && $(CDK_BIN) deploy $(PROFILE_OPTION) $(APPROVED) \
		--context env=$(APP_ENV) \
		--context repository=$(STACK_NAME) \
		--context revision=$(REVISION) \
		"$(PREFIX)-$(APP_ENV)-$(STACK_NAME)"

# CDK: デプロイした環境を破棄します
cdk-destroy: .cdk-check-env .cdk-set-revision .cdk-set-profile
ifeq ($(APP_ENV),Prd)
	$(eval APPROVED := --force)
endif
	cd $(CDK_DIR) && $(CDK_BIN) destroy $(PROFILE_OPTION) $(APPROVED) \
		--context env=$(APP_ENV) \
		--context repository=$(STACK_NAME) \
		--context revision=$(REVISION) \
		"$(PREFIX)-$(APP_ENV)-$(STACK_NAME)"

# CDK: ローカルのtemplateとデプロイしたもののDiffを表示します
cdk-diff:.cdk-check-env .cdk-set-revision .cdk-set-profile cdk-build
	cd $(CDK_DIR) && $(CDK_BIN) diff $(PROFILE_OPTION) \
		--context env=$(APP_ENV) \
		--context repository=$(STACK_NAME) \
		--context revision=$(REVISION) \
		"$(PREFIX)-$(APP_ENV)-$(STACK_NAME)"

# CDK: CloudFormationのテンプレートを出力します
cdk-synth: .cdk-check-env .cdk-set-revision .cdk-set-profile cdk-build
	cd $(CDK_DIR) && $(CDK_BIN) synth $(PROFILE_OPTION) \
		--context env=$(APP_ENV) \
		--context repository=$(STACK_NAME) \
		--context revision=$(REVISION) \
		"$(PREFIX)-$(APP_ENV)-$(STACK_NAME)"

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

.cdk-set-profile:
ifneq ($(PROFILE),)
	$(eval PROFILE_OPTION := --profile $(PROFILE))
endif
