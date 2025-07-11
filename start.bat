@echo off

:: Start MariaDB server
start "" "C:\Program Files\MariaDB 11.8\bin\mysqld.exe"

:: Start frontend (React/Node)
start cmd /k "cd interface && set NODE_OPTIONS=--openssl-legacy-provider && npm start"

:: Start PHP backend
start cmd /k "cd backend && php -S localhost:8080"