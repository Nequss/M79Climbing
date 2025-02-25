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

# Create data directory
RUN mkdir -p /app/data

# Create a script to handle the database file permissions
RUN echo '#!/bin/bash\n\
# Ensure the data directory is writable\n\
chmod 777 /app/data\n\
\n\
# Ensure the database files have proper permissions\n\
if [ -f /app/data/app.db ]; then\n\
  echo "Setting permissions for main database file"\n\
  chmod 666 /app/data/app.db\n\
fi\n\
\n\
# Handle WAL file if it exists\n\
if [ -f /app/data/app.db-wal ]; then\n\
  echo "Setting permissions for WAL file"\n\
  chmod 666 /app/data/app.db-wal\n\
fi\n\
\n\
# Handle SHM file if it exists\n\
if [ -f /app/data/app.db-shm ]; then\n\
  echo "Setting permissions for SHM file"\n\
  chmod 666 /app/data/app.db-shm\n\
fi\n\
\n\
echo "All database files have proper permissions"\n\
\n\
# Start the application\n\
echo "Starting application..."\n\
exec dotnet M79Climbing.dll\n\
' > /app/entrypoint.sh && \
chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]