# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# Ubuntu docker file for M79Climbing

# Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0-noble AS base
WORKDIR /app
EXPOSE 80

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0-noble AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["M79Climbing.csproj", "."]
RUN dotnet restore "./M79Climbing.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "./M79Climbing.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./M79Climbing.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create SQLite database directory and setup database
RUN mkdir -p /app/data
COPY ["app.db", "/app/data/"] 2>/dev/null || true
RUN ln -s /app/data/app.db /app/app.db && \
    chown -R $APP_UID:$APP_UID /app/data /app/app.db

# Switch to non-root user after setting up permissions
USER $APP_UID

ENTRYPOINT ["dotnet", "M79Climbing.dll"]