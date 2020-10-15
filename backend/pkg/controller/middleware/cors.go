package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetCors CORSの設定
func SetCors(frontendURLs []string) gin.HandlerFunc {
	config := cors.DefaultConfig()
	config.AllowHeaders = []string{"Authorization", "Origin", "Content-Length", "Content-Type"}
	config.AllowOrigins = frontendURLs
	config.ExposeHeaders = []string{"Content-Disposition"}
	return cors.New(config)
}
