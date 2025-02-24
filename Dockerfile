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

# Set a non-root user
ENV APP_UID=1000
ENV APP_GID=1000

# Create database placeholder and set permissions
RUN touch /app/app.db && \
    chmod 664 /app/app.db && \
    chown $APP_UID:$APP_GID /app/app.db

# Switch to non-root user after setting up permissions
USER $APP_UID

ENTRYPOINT ["dotnet", "M79Climbing.dll"]