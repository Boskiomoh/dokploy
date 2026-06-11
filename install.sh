#!/bin/bash
# Nobus Cloud PaaS - 100% Automated Bootstrap Script
# Target: Ubuntu 24.04 LTS
set -e

echo "🚀 Starting Nobus Cloud Installation..."

# 1. Install Build Essentials (REQUIRED for node-pty and native modules)
echo "🛠️ Installing build tools and compilers..."
sudo apt-get update
sudo apt-get install -y build-essential curl git

# 2. Setup 4GB Swap (Safety net for the build process)
if [ ! -f /swapfile ]; then
    echo "💾 Creating 4GB Swap file..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 3. Install Docker
if ! [ -x "$(command -v docker)" ]; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
fi

# 4. FIX DOCKER PERMISSIONS (Crucial for the script to continue)
echo "🔑 Adjusting Docker permissions..."
sudo usermod -aG docker $USER
sudo chmod 666 /var/run/docker.sock

# 5. Initialize Docker Swarm (The Orchestrator)
if [ "$(docker info --format '{{.Swarm.LocalNodeState}}')" != "active" ]; then
    echo "🐝 Initializing Cluster Orchestrator..."
    sudo docker swarm init --advertise-addr $(hostname -I | awk '{print $1}')
fi

# 6. Install Node.js v22 & PNPM
if ! [ -x "$(command -v node)" ]; then
    echo "📦 Installing Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo npm install -g pnpm
fi

# 7. Start the Databases (Batteries)
echo "🔋 Starting Postgres and Redis..."
# We use || true so the script doesn't stop if they are already running
docker run -d --name dev-postgres -p 5432:5432 -e POSTGRES_USER=dokploy -e POSTGRES_DB=dokploy -e POSTGRES_HOST_AUTH_METHOD=trust --restart always postgres:16 || true
docker run -d --name dev-redis -p 6379:6379 --restart always redis:7 || true

# 8. Clean Install & Build Nobus Dashboard
echo "🏗️ Building Nobus Cloud UI..."
# We remove any failed node_modules to start fresh
rm -rf node_modules
pnpm install
pnpm approve-builds
pnpm run build

echo "✅ Nobus Cloud is now live on http://$(hostname -I | awk '{print $1}'):3000"

# 9. Launch in Background
cd apps/dokploy
nohup pnpm run start > nobus.log 2>&1 &