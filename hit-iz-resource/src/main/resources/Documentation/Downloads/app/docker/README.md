# Docker IZ Tool Deployment Guide

## Table of Contents
- Introduction
- Installation
- Configuration
- Launching the Application
- User Registration
- Troubleshooting
- Additional Resources

## Introduction

This guide provides comprehensive instructions for deploying our application using Docker. The containerized approach ensures consistent deployment across different environments while minimizing configuration issues.

## Installation

### Step 1: Download Required Files

Download the following configuration files:
- `docker-compose.yml` - Contains the Docker container configuration
- `app-config.properties` - Contains application-specific settings

### Step 2: Create Project Directory

Create a dedicated directory for the application and place the downloaded files inside:

```bash
mkdir -p ~/docker-app
cd ~/docker-app
# Copy or move the downloaded files to this directory
```

### Step 3: Install Docker

If you don't have Docker installed on your system, follow the official installation guide:

1. Visit the Docker documentation: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
2. Select your operating system and follow the installation instructions
3. Verify installation by running:
   ```bash
   docker --version
   docker-compose --version
   ```

#### Docker Installation Quick Links:
- [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- [Docker Engine for Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Docker Engine for Debian](https://docs.docker.com/engine/install/debian/)
- [Docker Engine for CentOS](https://docs.docker.com/engine/install/centos/)

## Configuration

### Configuring Application Settings

#### Selecting a version
By default, the docker compose file will use the latest version. To configure the version:
1. Open the `docker-compose.yml` file in a text editor
2. Locate the `iz-himss-tomcat:image` property
3. Change the image link from `nist775hit/hit-iz-himss-tool:latest` to `nist775hit/hit-iz-himss-tool:TOOLVERSION`
4. Save the file


#### Administration configuration
Before launching the application, you need to configure the administrator email:

1. Open the `app-config.properties` file in a text editor
2. Locate the `admin.emails` property
3. Add your email address to this property
   ```properties
   # Example configuration
   admin.emails=your.email@example.com
   ```
   
   For multiple administrators, separate email addresses with commas:
   ```properties
   admin.emails=admin1@example.com,admin2@example.com
   ```

4. Save the file

> **Note**: The email address specified here will have administrative privileges in the application. Make sure to use a secure, accessible email account.

## Launching the Application

Once you've completed the configuration, follow these steps to launch the application:

1. Open a terminal or command prompt
2. Navigate to the directory containing your configuration files:
   ```bash
   cd ~/docker-app  # Or the path where you placed the files
   ```
3. Start the application using Docker Compose:
   ```bash
   docker compose up
   ```
   
   To run the application in the background (detached mode):
   ```bash
   docker compose up -d
   ```

4. Docker will download the necessary images (if not already present) and start the containers
5. Wait for the initialization process to complete

> **Note**: The first launch may take several minutes as Docker downloads the required images.

## User Registration

After the application is running, follow these steps to register an administrative user:

1. Open your web browser
2. Navigate to [http://localhost:13102/iztool](http://localhost:13102/iztool)
3. Click on the "Register" option
4. Enter your details, using the same email address configured in the `admin.emails` property
5. Complete the registration process

Once registered, you will have administrative privileges, allowing you to:
- Push and manage profiles
- Configure system settings
- Manage other users
- Access administrative features

## Troubleshooting

### Common Issues and Solutions

#### Application Not Accessible

If you cannot access the application at http://localhost:13102/iztool:

1. Verify that Docker containers are running:
   ```bash
   docker ps
   ```
2. Check container logs for errors:
   ```bash
   docker compose logs
   ```
3. Ensure no other application is using port 13101

#### Changing the Port

If port 13101 is already in use or you need to use a different port:

1. Open the `docker-compose.yml` file
2. Locate the port mapping section (typically formatted as `13102:8080`)
3. Change the first number to your desired port:
   ```yaml
   ports:
     - "13103:8080"  # This maps port 13103 on your host to 8080 in the container
   ```
4. Save the file and restart the application:
   ```bash
   docker compose down
   docker compose up -d
   ```

#### Administrator Email Not Working

If you're unable to gain administrative privileges:

1. Verify the email in `app-config.properties` matches exactly with the one used for registration
2. Check for typos or formatting issues in the configuration
3. Restart the application after making changes:
   ```bash
   docker compose restart
   ```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Container Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---
