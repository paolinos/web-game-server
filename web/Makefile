# Web Project - Makefile
# Usage: make [target]

.PHONY: all web test clean build help

# Default target
all: help

# Run Web server
web:
	@echo ">>> Starting Web server..."
	@go run ./cmd/web.go

# Run tests
test:
	@echo ">>> Running Web project tests..."
	@go test ./... -v

# Build web binary
build:
	@echo ">>> Building Web binary..."
	@go build -o build/web ./cmd/web.go

# Clean build artifacts
clean:
	@echo ">>> Cleaning build artifacts..."
	@rm -f build/web 2>/dev/null || true
	@echo ">>> Cleanup complete."

# Help
help:
	@echo "Web Project - Available Targets:"
	@echo ""
	@echo "  web    Run Web server (localhost:8000)"
	@echo "  test   Run all tests"
	@echo "  build  Build web binary to ../web-bin/web"
	@echo "  clean  Remove build artifacts"
	@echo "  help   Show this help message"
