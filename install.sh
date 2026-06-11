#!/bin/bash
# Nobus Cloud PaaS - 100% HANDS-OFF Bootstrap Script
# Target: Ubuntu 24.04 LTS
set -e

# --- 0. FORCE NON-INTERACTIVE MODE ---
# This stops the purple screen from appearing
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a

echo "🚀 Starting 100% Automated Nobus Cloud Installation..."

# 1. System Prep (Auto-confirm all prompts)
echo "🛠️ Updating system and installing build tools..."
sudo apt-get update
sudo apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade
sudo apt-get install -y build-essential curl git

# 2. Setup 4GB Swap
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

# 4. FIX DOCKER PERMISSIONS
sudo usermod -aG docker $USER
sudo chmod 666 /var/run/docker.sock

# 5. Initialize Docker Swarm
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
docker run -d --name dev-postgres -p 5432:5432 -e POSTGRES_USER=dokploy -e POSTGRES_DB=dokploy -e POSTGRES_HOST_AUTH_METHOD=trust --restart always postgres:16 || true
docker run -d --name dev-redis -p 6379:6379 --restart always redis:7 || true

# 8. THE PNPM SECURITY BYPASS (Full Automation)
echo "🔑 Pre-authorizing build scripts..."
pnpm config set only-built-dependencies --json '["@prisma/client", "@prisma/engines", "prisma", "node-pty", "bcrypt", "better-sqlite3", "sharp"]'

# 9. Clean Build Nobus Dashboard
echo "🏗️ Building Nobus Cloud UI..."
rm -rf node_modules
pnpm install
pnpm run build

echo "✅ Nobus Cloud is now live on http://$(hostname -I | awk '{print $1}'):3000"

# 10. Launch in Background using Screen or Nohup
cd apps/dokploy
nohup pnpm run start > nobus.log 2>&1 &