package handler

// Handlers ...
type Handlers struct {
	Hello Hello
}

// NewHandlers ...
func NewHandlers() *Handlers {
	return &Handlers{
		Hello: NewHello(),
	}
}
