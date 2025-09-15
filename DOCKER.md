# 🐳 Docker Guide - HappyRow Frontend

## Overview

This project is fully dockerized with support for both development and production environments. The Docker setup uses multi-stage builds for optimal performance and includes nginx for production serving.

## 🏗️ Docker Architecture

### Multi-Stage Dockerfile

The project uses a multi-stage Dockerfile with three targets:

1. **Builder Stage**: Builds the React application
2. **Production Stage**: Serves the built app with nginx
3. **Development Stage**: Runs the Vite dev server with hot reload

### Files Structure

```
├── Dockerfile              # Multi-stage Docker configuration
├── docker-compose.yml      # Orchestration for dev/prod environments
├── .dockerignore          # Optimizes build context
└── nginx.conf             # Production nginx configuration
```

## 🚀 Quick Start

### Development Environment

Start the development server with hot reload:

```bash
# Using npm scripts (recommended)
npm run docker:dev

# Or using docker-compose directly
docker-compose --profile dev up --build
```

The application will be available at `http://localhost:5173`

### Production Environment

Build and run the production version:

```bash
# Using npm scripts (recommended)
npm run docker:prod

# Or using docker-compose directly
docker-compose --profile prod up --build
```

The application will be available at `http://localhost:80`

## 📋 Available Docker Scripts

### Development Scripts

```bash
npm run docker:dev          # Start development environment
npm run docker:build:dev    # Build development image only
npm run docker:run:dev      # Run development container
```

### Production Scripts

```bash
npm run docker:prod         # Start production environment
npm run docker:build:prod   # Build production image only
npm run docker:run:prod     # Run production container
```

### Utility Scripts

```bash
npm run docker:build        # Build default (production) image
npm run docker:stop         # Stop all containers
npm run docker:clean        # Clean up Docker system
```

## 🔧 Manual Docker Commands

### Building Images

```bash
# Build production image
docker build -t happyrow-front .

# Build development image
docker build --target development -t happyrow-front:dev .

# Build production image specifically
docker build --target production -t happyrow-front:prod .
```

### Running Containers

```bash
# Development with volume mounting
docker run -p 5173:5173 \
  -v $(pwd):/app \
  -v /app/node_modules \
  happyrow-front:dev

# Production
docker run -p 80:80 happyrow-front:prod
```

## 🌐 Environment Configuration

### Development Environment

- **Port**: 5173
- **Hot Reload**: Enabled via volume mounting
- **API Proxy**: Configured through Vite
- **Node Environment**: development

### Production Environment

- **Port**: 80
- **Web Server**: nginx with optimizations
- **API Proxy**: Configured through nginx
- **Compression**: Gzip enabled
- **Caching**: Static assets cached for 1 year
- **Security Headers**: Comprehensive security headers

## 🔒 Security Features (Production)

The production nginx configuration includes:

- **Security Headers**: X-Frame-Options, X-XSS-Protection, CSP
- **HTTPS Ready**: Easy SSL/TLS integration
- **API Proxy**: Secure backend communication
- **Health Checks**: Built-in health endpoint

## 📊 Performance Optimizations

### Build Optimizations

- **Multi-stage builds**: Minimal production image size
- **Layer caching**: Optimized Docker layer structure
- **Alpine Linux**: Lightweight base images
- **.dockerignore**: Excludes unnecessary files

### Runtime Optimizations

- **Gzip compression**: Reduces payload size
- **Static asset caching**: Browser caching for static files
- **nginx optimizations**: Sendfile, TCP optimizations
- **Health checks**: Container health monitoring

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
lsof -i :5173  # or :80 for production

# Stop existing containers
npm run docker:stop
```

**Build failures:**
```bash
# Clean Docker system
npm run docker:clean

# Rebuild without cache
docker-compose build --no-cache
```

**Volume mounting issues (Development):**
```bash
# Ensure proper permissions
chmod -R 755 .

# Rebuild with fresh volumes
docker-compose down -v
docker-compose --profile dev up --build
```

### Logs and Debugging

```bash
# View container logs
docker-compose logs -f

# Access running container
docker exec -it <container_name> sh

# Check nginx status (production)
docker exec -it <container_name> nginx -t
```

## 🚢 Deployment

### Production Deployment

1. **Build the production image:**
   ```bash
   docker build --target production -t happyrow-front:latest .
   ```

2. **Tag for registry:**
   ```bash
   docker tag happyrow-front:latest your-registry/happyrow-front:latest
   ```

3. **Push to registry:**
   ```bash
   docker push your-registry/happyrow-front:latest
   ```

### Docker Registry Integration

```bash
# Build and tag for different environments
docker build -t happyrow-front:dev --target development .
docker build -t happyrow-front:prod --target production .

# Tag for registry
docker tag happyrow-front:prod registry.example.com/happyrow-front:latest
docker tag happyrow-front:prod registry.example.com/happyrow-front:v1.0.0
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build --target production -t happyrow-front .
      
      - name: Run tests in Docker
        run: docker run --rm happyrow-front npm test
```

## 📝 Best Practices

### Development

- Use volume mounting for live code changes
- Keep development dependencies in dev stage only
- Use `.dockerignore` to optimize build context

### Production

- Use multi-stage builds to minimize image size
- Implement health checks for container orchestration
- Use nginx for serving static files efficiently
- Enable gzip compression for better performance

### Security

- Run containers as non-root user when possible
- Keep base images updated
- Use specific image tags, avoid `latest` in production
- Implement proper secrets management

## 🔍 Monitoring

### Health Checks

The production container includes health checks:

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost/health
```

### Resource Monitoring

```bash
# Monitor container resources
docker stats

# View container processes
docker exec -it <container_name> ps aux
```

---

**Last Updated**: September 15, 2025  
**Docker Version**: 20+  
**Docker Compose Version**: 3.8+
