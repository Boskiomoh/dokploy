#!/bin/bash
# Nobus Cloud PaaS - 100% SILENT Bootstrap Script
# Target: Ubuntu 24.04 LTS
set -e

# --- THE "NUCLEAR OPTION" FOR SILENCE ---
# 1. Tell the OS we are a script, not a human
export DEBIAN_FRONTEND=noninteractive
# 2. Tell 'needrestart' to just do it automatically without asking
export NEEDRESTART_MODE=a
# 3. Create a config file to force silence for the duration of the script
sudo mkdir -p /etc/needrestart/conf.d
echo '$nrconf{restart} = "a";' | sudo tee /etc/needrestart/conf.d/nobus-automate.conf > /dev/null

echo "🚀 Starting 100% Automated Nobus Cloud Installation..."

# 1. System Prep (Force old config to stay to prevent prompts)
echo "🛠️ Updating system..."
sudo apt-get update
sudo apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade
sudo apt-get install -y build-essential curl git debconf-utils

# 2. Setup 4GB Swap
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 3. Install Docker
if ! [ -x "$(command -v docker)" ]; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
fi

# 4. FIX DOCKER PERMISSIONS
sudo usermod -aG docker $USER
sudo chmod 666 /var/run/docker.sock

# 5. Initialize Docker Swarm
if [ "$(docker info --format '{{.Swarm.LocalNodeState}}')" != "active" ]; then
    sudo docker swarm init --advertise-addr $(hostname -I | awk '{print $1}')
fi

# 6. Install Node.js v22 & PNPM
if ! [ -x "$(command -v node)" ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo npm install -g pnpm
fi

# 7. Start the Databases
docker run -d --name dev-postgres -p 5432:5432 -e POSTGRES_USER=dokploy -e POSTGRES_DB=dokploy -e POSTGRES_HOST_AUTH_METHOD=trust --restart always postgres:16 || true
docker run -d --name dev-redis -p 6379:6379 --restart always redis:7 || true

# 8. PNPM SECURITY BYPASS
echo "🔑 Pre-authorizing build scripts..."
pnpm config set only-built-dependencies --json '["@prisma/client", "@prisma/engines", "prisma", "node-pty", "bcrypt", "better-sqlite3", "sharp"]'

# 9. Clean Build Nobus Dashboard
echo "🏗️ Building Nobus Cloud UI..."
# Use --frozen-lockfile for production consistency
pnpm install --frozen-lockfile
pnpm run build

echo "✅ Nobus Cloud is live at http://$(hostname -I | awk '{print $1}'):3000"

# 10. Launch in Background
cd apps/dokploy
nohup pnpm run start > nobus.log 2>&1 &