FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Install security tools
RUN npm install -g npq lockfile-lint

# Set secure npm configuration globally
RUN npm config set ignore-scripts true && \
    npm config set audit true && \
    npm config set audit-level moderate

# Create non-root user workspace
RUN mkdir -p /workspace && chown -R node:node /workspace

USER node
WORKDIR /workspace

# Set environment variables
ENV NODE_OPTIONS="--disable-proto=delete"
ENV NPM_CONFIG_IGNORE_SCRIPTS=true
