SRV=gmarcone
VERSION=latest
USER=rodrwan

docker:
	@echo "[build docker image] building...."
	@docker build -t $(USER)/$(SRV):$(VERSION) .
	@docker push $(USER)/$(SRV):$(VERSION)