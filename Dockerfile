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

# Create a script to initialize the database with proper permissions
RUN echo '#!/bin/bash\n\
if [ ! -f /app/app.db ]; then\n\
  touch /app/app.db\n\
fi\n\
chmod 666 /app/app.db\n\
exec dotnet M79Climbing.dll\n\
' > /app/entrypoint.sh && \
chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]