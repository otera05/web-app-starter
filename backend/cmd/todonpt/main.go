package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/otera05/web-app-starter/backend/pkg/controller/handler"
	"github.com/otera05/web-app-starter/backend/pkg/controller/router"
	"github.com/otera05/web-app-starter/backend/pkg/infra/system"
)

func main() {
	handlers := handler.NewHandlers()
	systemConfig := system.NewConf()

	r := gin.Default()
	router.NewRouter(r, handlers, systemConfig)
	if err := r.Run(); err != nil {
		log.Fatalln(err)
	}
}
