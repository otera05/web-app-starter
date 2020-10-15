package router

import (
	"github.com/gin-gonic/gin"
	"github.com/otera05/web-app-starter/backend/pkg/controller/handler"
	"github.com/otera05/web-app-starter/backend/pkg/controller/middleware"
	"github.com/otera05/web-app-starter/backend/pkg/infra/system"
)

// NewRouter ...
func NewRouter(r *gin.Engine, handlers *handler.Handlers, config *system.Config) {
	r.Use(middleware.SetCors(config.FrontendURLs))
	r.GET("/", handlers.Hello.Get)
}
