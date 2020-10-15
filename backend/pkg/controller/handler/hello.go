package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Hello ...
type Hello interface {
	Get(ctx *gin.Context)
}

type helloImpl struct{}

// NewHello ...
func NewHello() Hello {
	return &helloImpl{}
}

// Get ...
func (h *helloImpl) Get(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, "Hello world")
}
