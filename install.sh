#!/bin/bash
# Nobus Cloud PaaS - Automation Bootstrap Script
# Target: Ubuntu 24.04 LTS
set -e

echo "🚀 Starting Nobus Cloud Installation..."

# 1. Create 4GB Swap (Safety net for the build process)
if [ ! -f /swapfile ]; then
    echo "💾 Creating Swap file..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 2. Install Docker
if ! [ -x "$(command -v docker)" ]; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
fi

# 3. Initialize Docker Swarm (The Orchestrator)
if [ "$(docker info --format '{{.Swarm.LocalNodeState}}')" != "active" ]; then
    echo "🐝 Initializing Cluster Orchestrator..."
    sudo docker swarm init --advertise-addr $(hostname -I | awk '{print $1}')
fi

# 4. Install Node.js & PNPM
if ! [ -x "$(command -v node)" ]; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo npm install -g pnpm
fi

# 5. Start the Databases (Batteries)
echo "🔋 Starting Postgres and Redis..."
docker run -d --name dev-postgres -p 5432:5432 -e POSTGRES_USER=dokploy -e POSTGRES_DB=dokploy -e POSTGRES_HOST_AUTH_METHOD=trust --restart always postgres:16 || true
docker run -d --name dev-redis -p 6379:6379 --restart always redis:7 || true

# 6. Build and Start Nobus Dashboard
echo "🏗️ Building Nobus Cloud UI..."
pnpm install
pnpm approve-builds
pnpm run build

echo "✅ Nobus Cloud is now live on http://$(hostname -I | awk '{print $1}'):3000"
cd apps/dokploy
pnpm run start