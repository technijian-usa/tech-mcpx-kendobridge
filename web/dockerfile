# -----------------------------------------------------------------------------
# Dockerfile (API)
# Technijian MCPX Admin API — ASP.NET Core 8 container image
#
# Notes
#  - Multi-stage build: compile/publish in SDK image, run on smaller ASP.NET.
#  - No secrets are baked into the image. Provide SQL_CONN_STRING at runtime.
#  - Exposes HTTP on :5000; reverse proxy (nginx) fronts the service in prod.
# -----------------------------------------------------------------------------

# ---------- Build stage -------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore & cache dependencies first (faster incremental builds)
COPY Technijian.MCPX.AdminApi.csproj ./
RUN dotnet restore

# Copy the remaining sources and publish
COPY . ./
RUN dotnet publish -c Release -o /app --no-restore

# ---------- Runtime stage -----------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine

# Set Kestrel binding (HTTP only; TLS terminated by reverse proxy)
ENV ASPNETCORE_URLS=http://+:5000

# Health hints for orchestrators (optional)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
#   CMD wget -qO- http://127.0.0.1:5000/health || exit 1

WORKDIR /app
COPY --from=build /app ./

# API listens on 5000 inside the container
EXPOSE 5000

# IMPORTANT: provide SQL_CONN_STRING as an environment variable at runtime.
# Example (docker compose .env):
#   SQL_CONN_STRING=Server=...;Database=...;User Id=...;Password=...;TrustServerCertificate=True;

ENTRYPOINT ["dotnet", "Technijian.MCPX.AdminApi.dll"]
