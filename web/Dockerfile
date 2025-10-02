# =============================================================================
# Dockerfile (Web)
# MCPX Admin Web — React 18 (Vite) built and served via nginx
#
# REQUIREMENT: Build context must be the REPO ROOT (.)
#   so we can access both /web and /design/themebuilder/export/mcpx-kendobridge
#   because package.json depends on the theme via:
#     "mcpx-kendobridge": "file:../design/themebuilder/export/mcpx-kendobridge"
#
# If you *must* keep context=./web, vendor the theme package into /web first,
# or publish it to a registry and depend on it that way.
# =============================================================================

# ---------- Build stage -------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Copy the ThemeBuilder package first (improves layer caching if web code changes frequently)
# The path below must exist in the build context (repo root).
COPY design/themebuilder/export/mcpx-kendobridge /app/design/themebuilder/export/mcpx-kendobridge

# Copy only manifests first for better dependency caching
COPY web/package.json web/package-lock.json* /app/web/

# Install deps (needs the theme package to exist at ../design/...)
WORKDIR /app/web
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the web sources and build the static site to /app/web/dist
COPY web /app/web
RUN npm run build

# ---------- Runtime stage -----------------------------------------------------
FROM nginx:alpine

# Replace default server config with our SPA + proxy config
# (Make sure web/nginx.conf exists in repo)
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the build stage
COPY --from=build /app/web/dist /usr/share/nginx/html

# Basic hardening headers for static assets (optional)
# You can also do this in nginx.conf; keeping image simple is fine.

# Expose HTTP (nginx)
EXPOSE 80

# nginx is the default entrypoint/cmd in this image
