# Deployment Guide

## Prerequisites

- Ubuntu 22.04 LTS server (AWS EC2, DigitalOcean, etc.)
- Domain name configured
- Supabase project created
- Telegram Bot Token
- TRON wallet address

---

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm nginx certbot python3-certbot-nginx git

# Install Docker (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Create Application User

```bash
sudo adduser fxgalpha
sudo usermod -aG sudo fxgalpha
su - fxgalpha
```

---

## Application Deployment

### 1. Clone Repository

```bash
cd /home/fxgalpha
git clone https://github.com/yourusername/alphamasterdashboard.git
cd alphamasterdashboard
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
nano .env
```

**Backend .env Configuration:**
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=15
REFRESH_TOKEN_EXPIRY_DAYS=7

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# TRON
TRON_API_KEY=your-tronscan-api-key
ADMIN_WALLET_ADDRESS=your-tron-wallet-address

# Encryption
ENCRYPTION_KEY=your-fernet-encryption-key

# Environment
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
nano .env.local
```

**Frontend .env.local Configuration:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Build Frontend

```bash
npm run build
```

---

## Database Setup

### 1. Run Supabase Migrations

```bash
cd backend

# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 2. Seed Initial Data

```bash
# Run seed script
python scripts/seed_database.py
```

---

## Systemd Services

### 1. Backend Service

Create `/etc/systemd/system/fxgalpha-backend.service`:

```ini
[Unit]
Description=FXG Alpha Backend API
After=network.target

[Service]
Type=simple
User=fxgalpha
WorkingDirectory=/home/fxgalpha/alphamasterdashboard/backend
Environment="PATH=/home/fxgalpha/alphamasterdashboard/backend/venv/bin"
ExecStart=/home/fxgalpha/alphamasterdashboard/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2. Background Worker Service

Create `/etc/systemd/system/fxgalpha-worker.service`:

```ini
[Unit]
Description=FXG Alpha Background Worker
After=network.target

[Service]
Type=simple
User=fxgalpha
WorkingDirectory=/home/fxgalpha/alphamasterdashboard/backend
Environment="PATH=/home/fxgalpha/alphamasterdashboard/backend/venv/bin"
ExecStart=/home/fxgalpha/alphamasterdashboard/backend/venv/bin/python worker.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3. Frontend Service (if not using static export)

Create `/etc/systemd/system/fxgalpha-frontend.service`:

```ini
[Unit]
Description=FXG Alpha Frontend
After=network.target

[Service]
Type=simple
User=fxgalpha
WorkingDirectory=/home/fxgalpha/alphamasterdashboard/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 4. Enable and Start Services

```bash
sudo systemctl daemon-reload
sudo systemctl enable fxgalpha-backend
sudo systemctl enable fxgalpha-worker
sudo systemctl enable fxgalpha-frontend
sudo systemctl start fxgalpha-backend
sudo systemctl start fxgalpha-worker
sudo systemctl start fxgalpha-frontend

# Check status
sudo systemctl status fxgalpha-backend
sudo systemctl status fxgalpha-worker
sudo systemctl status fxgalpha-frontend
```

---

## Nginx Configuration

### 1. Backend Configuration

Create `/etc/nginx/sites-available/api.yourdomain.com`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;

    client_max_body_size 10M;
}
```

### 2. Frontend Configuration

Create `/etc/nginx/sites-available/yourdomain.com`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (if using static export)
    # root /home/fxgalpha/alphamasterdashboard/frontend/out;
    # index index.html;
    # 
    # location / {
    #     try_files $uri $uri/ /index.html;
    # }

    client_max_body_size 10M;
}
```

### 3. Enable Sites

```bash
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 2. Obtain Certificates

```bash
# For API
sudo certbot --nginx -d api.yourdomain.com

# For Frontend
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
```

---

## Docker Deployment (Alternative)

### 1. Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
    restart: always
    depends_on:
      - worker

  worker:
    build: ./backend
    command: python worker.py
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env.local
    restart: always
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: always
```

### 2. Deploy with Docker

```bash
docker-compose up -d

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down
```

---

## Monitoring & Logging

### 1. Application Logs

```bash
# Backend logs
sudo journalctl -u fxgalpha-backend -f

# Worker logs
sudo journalctl -u fxgalpha-worker -f

# Frontend logs
sudo journalctl -u fxgalpha-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Log Rotation

Create `/etc/logrotate.d/fxgalpha`:

```
/var/log/fxgalpha/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 fxgalpha fxgalpha
    sharedscripts
    postrotate
        systemctl reload fxgalpha-backend
    endscript
}
```

### 3. Monitoring Setup

Install monitoring tools:

```bash
# Install htop for system monitoring
sudo apt install htop

# Install netdata for real-time monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

---

## Backup Strategy

### 1. Database Backup

Supabase provides automatic backups. For additional safety:

```bash
# Create backup script
nano /home/fxgalpha/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/fxgalpha/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup using Supabase CLI (if self-hosted)
# pg_dump -h your-db-host -U postgres -d fxgalpha > $BACKUP_DIR/db_$DATE.sql

# Upload to S3 or other storage
# aws s3 cp $BACKUP_DIR/db_$DATE.sql s3://your-bucket/backups/

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql" -mtime +30 -delete
```

```bash
chmod +x /home/fxgalpha/backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /home/fxgalpha/backup.sh
```

### 2. Application Backup

```bash
# Backup application files
tar -czf /home/fxgalpha/backups/app_$(date +%Y%m%d).tar.gz /home/fxgalpha/alphamasterdashboard
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Fail2Ban

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. SSH Hardening

Edit `/etc/ssh/sshd_config`:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart sshd
```

---

## Performance Optimization

### 1. Nginx Caching

Add to Nginx configuration:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    add_header X-Cache-Status $upstream_cache_status;
}
```

### 2. Enable Gzip Compression

Add to Nginx configuration:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 3. Database Connection Pooling

Already configured in SQLAlchemy settings in backend.

---

## Troubleshooting

### Common Issues

**1. Backend not starting:**
```bash
# Check logs
sudo journalctl -u fxgalpha-backend -n 50

# Check if port is in use
sudo netstat -tulpn | grep 8000

# Test manually
cd /home/fxgalpha/alphamasterdashboard/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**2. Database connection errors:**
```bash
# Verify Supabase credentials
# Check .env file
# Test connection
python -c "from supabase import create_client; print('OK')"
```

**3. Nginx errors:**
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

**4. SSL certificate issues:**
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor application logs
- Check system resources (CPU, RAM, disk)
- Verify background jobs are running

**Weekly:**
- Review error logs
- Check database performance
- Update dependencies (if needed)

**Monthly:**
- Security updates
- Database optimization
- Backup verification
- Performance review

### Update Procedure

```bash
# Pull latest code
cd /home/fxgalpha/alphamasterdashboard
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart fxgalpha-backend
sudo systemctl restart fxgalpha-worker

# Update frontend
cd ../frontend
npm install
npm run build
sudo systemctl restart fxgalpha-frontend

# Reload Nginx
sudo systemctl reload nginx
```

---

## Scaling Considerations

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Add caching layer (Redis)

### Horizontal Scaling
- Load balancer (Nginx, HAProxy)
- Multiple backend instances
- Database read replicas
- CDN for static assets

---

## Support & Monitoring

### Health Checks

Create `/backend/health.py`:

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

Configure alerts for:
- API downtime
- High response times
- SSL certificate expiry
- Disk space

---

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous version
git checkout <previous-commit-hash>

# Restart services
sudo systemctl restart fxgalpha-backend
sudo systemctl restart fxgalpha-worker
sudo systemctl restart fxgalpha-frontend

# Restore database (if needed)
# Use Supabase dashboard to restore from backup
```

---

## Contact & Support

For issues or questions:
- Email: support@fxgalpha.com
- Documentation: https://docs.fxgalpha.com
- GitHub Issues: https://github.com/yourusername/alphamasterdashboard/issues
