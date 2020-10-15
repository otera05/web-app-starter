# Task
#===============================================================

## DOCKER: イメージをビルドします
.PHONY: docker-build
docker-build: .build-image-tag
	docker build -t $(IMAGE_REPO):$(tag) .
	docker tag $(IMAGE_REPO):$(tag) $(IMAGE_REPO):latest

## DOCKER: イメージをPUSHします
.PHONY: docker-push
docker-push: .image-tag .cdk-set-profile
	$$(aws ecr get-login --no-include-email --region ap-northeast-1 $(PROFILE_OPTION))
	docker push $(IMAGE_REPO):$(tag)
	docker push $(IMAGE_REPO):latest

## DOCKER: 古いイメージを削除します
.PHONY: docker-clean
docker-clean:
	docker images --format "{{.Repository}}\t{{.CreatedAt}}\t{{.Tag}}" $(IMAGE_REPO) | \
		sort -r -k2,3 | \
		awk -F"\t" '$$3 != "latest" && NR > 3 {print $$1":"$$3}' | \
		xargs -n 1 docker rmi -f

# Internal Task
#===============================================================
.build-image-tag:
ifeq ($(TAG_OPTION),)
	$(eval tag := $(shell date +'%Y-%m-%dT%H%M%S'))
else
	$(eval tag := $(TAG_OPTION))
endif

.image-tag:
ifeq ($(IMAGE_REPO),)
	$(error IMAGE_REPO not set correctly.)
endif

ifeq ($(TAG_OPTION),)
	$(eval tag := $(shell docker images --format "{{.ID}}\t{{.CreatedAt}}\t{{.Tag}}" $(IMAGE_REPO) | \
		sort -r -k2,3 | \
		awk -F"\t" '$$3 != "latest" {print $$3}' | \
		head -n 1 ))
	$(eval tag := $(tag))
else
	$(eval tag := $(TAG_OPTION))
endif
