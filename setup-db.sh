#!/bin/bash

# Create the database directory if it doesn't exist
mkdir -p db-data

# If you want to use an existing database, copy it to the db-data directory
if [ -f app.db ]; then
  echo "Copying existing database to db-data directory"
  cp app.db db-data/
  
  # Copy WAL and SHM files if they exist
  if [ -f app.db-wal ]; then
    cp app.db-wal db-data/
  fi
  
  if [ -f app.db-shm ]; then
    cp app.db-shm db-data/
  fi
fi

# Set proper permissions
chmod -R 777 db-data

echo "Database directory setup complete. You can now run docker-compose up -d" 