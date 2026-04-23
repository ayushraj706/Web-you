# Deployment Guide

## 🚀 Production Deployment Checklist

### Pre-Deployment Steps

1. **Environment Variables**
   - [ ] All environment variables configured
   - [ ] Firebase service account key is valid
   - [ ] Cloudinary credentials are correct
   - [ ] Meta access token is permanent (never expires)
   - [ ] Webhook verify token is secure (32+ characters)

2. **Security**
   - [ ] HTTPS enabled (required by Meta)
   - [ ] Rate limiting configured
   - [ ] Input validation implemented
   - [ ] Error messages don't expose sensitive data
   - [ ] `.env.local` is in `.gitignore`

3. **Testing**
   - [ ] Webhook verification works
   - [ ] WhatsApp text messages send successfully
   - [ ] Instagram messages send successfully
   - [ ] Media upload to Cloudinary works
   - [ ] Firestore saves messages correctly
   - [ ] Deduplication prevents duplicate processing

## Vercel Deployment (Recommended)

### Why Vercel?
- ✅ Built for Next.js
- ✅ Automatic HTTPS
- ✅ Zero configuration
- ✅ Global CDN
- ✅ Serverless functions

### Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Add Environment Variables**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add all variables from `.env.example`
   - Redeploy after adding variables

5. **Update Meta Webhook URL**
   - Go to Meta App Dashboard > Webhooks
   - Update callback URL to: `https://your-domain.vercel.app/api/webhook`
   - Click "Verify and Save"

## Railway Deployment

### Steps

1. **Create Railway Account**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Environment Variables**
   - Go to project > Variables
   - Add all variables from `.env.example`

4. **Deploy**
   - Railway auto-deploys on git push
   - Get deployment URL from Railway dashboard

5. **Update Meta Webhook**
   - Update webhook URL in Meta Dashboard

## Render Deployment

### Steps

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Dashboard > New > Web Service
   - Connect GitHub repository

3. **Configure Service**
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Add Environment Variables**
   - Environment > Environment Variables
   - Add all variables

5. **Deploy & Update Webhook**
   - Deploy service
   - Copy URL and update Meta webhook

## AWS Lambda + API Gateway

### Prerequisites
- AWS Account
- AWS CLI installed
- Serverless Framework

### Steps

1. **Install Serverless**
```bash
npm install -g serverless
```

2. **Configure AWS Credentials**
```bash
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET
```

3. **Create serverless.yml**
```yaml
service: omnichannel-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    META_ACCESS_TOKEN: ${env:META_ACCESS_TOKEN}
    # Add all environment variables

functions:
  webhook:
    handler: app/api/webhook/route.handler
    events:
      - http:
          path: webhook
          method: get
      - http:
          path: webhook
          method: post
```

4. **Deploy**
```bash
serverless deploy
```

## Google Cloud Run

### Steps

1. **Install gcloud CLI**
```bash
# Follow: https://cloud.google.com/sdk/docs/install
```

2. **Build Container**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

3. **Deploy to Cloud Run**
```bash
gcloud run deploy omnichannel-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

4. **Set Environment Variables**
```bash
gcloud run services update omnichannel-backend \
  --set-env-vars META_ACCESS_TOKEN=xxx,CLOUDINARY_CLOUD_NAME=xxx
```

## Post-Deployment

### 1. Verify Webhook
```bash
curl "https://your-domain.com/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"
```

Should return: `test`

### 2. Test Message Sending
```bash
curl -X POST https://your-domain.com/api/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_PHONE",
    "type": "text",
    "text": "Deployment test!"
  }'
```

### 3. Monitor Logs
- Vercel: Dashboard > Deployments > View Function Logs
- Railway: Dashboard > Deployments > View Logs
- Render: Dashboard > Logs

### 4. Set Up Monitoring
- **Sentry** for error tracking
- **LogDNA** for log aggregation
- **Datadog** for APM

### 5. Configure Firestore Indexes
If queries are slow, create indexes:
```bash
firebase deploy --only firestore:indexes
```

## Performance Optimization

### 1. Caching
Add Redis for caching frequently accessed data:

```bash
npm install ioredis
```

```javascript
// lib/cache.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function cacheGet(key) {
  return await redis.get(key);
}

export async function cacheSet(key, value, ttl = 3600) {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
}
```

### 2. Database Optimization
- Create Firestore indexes for common queries
- Use batch writes for multiple operations
- Implement pagination for large datasets

### 3. Rate Limiting
Add rate limiting middleware:

```bash
npm install express-rate-limit
```

## Scaling

### Horizontal Scaling
- Vercel/Railway/Render: Automatically scales
- AWS Lambda: Scales to zero, then up based on traffic
- Manual: Use load balancer with multiple instances

### Database Scaling
- Firestore scales automatically
- Use Firestore in Datastore mode for 10M+ operations/sec

### Media Storage Scaling
- Cloudinary Pro plan for higher limits
- Consider CDN caching

## Backup & Recovery

### Database Backups
```bash
# Export Firestore
gcloud firestore export gs://YOUR_BUCKET/backups/$(date +%Y%m%d)
```

### Automated Backups
Set up daily cron job:
```javascript
// app/api/cron/backup/route.js
export async function GET(request) {
  // Trigger Firestore export
  // Send notification
  return new Response('Backup initiated');
}
```

## Monitoring & Alerts

### Set Up Alerts
1. **Failed webhooks** - Alert if >5% fail
2. **High latency** - Alert if response time >2s
3. **Error rate** - Alert if errors >1%
4. **Disk usage** - Alert if >80%

### Health Check Endpoint
```javascript
// app/api/health/route.js
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
```

## Troubleshooting

### Common Issues

**Webhook not receiving events**
- Check webhook URL is HTTPS
- Verify token matches
- Check Meta App is in production mode
- Verify webhook subscriptions are active

**Messages not sending**
- Verify Meta access token is valid
- Check phone number format (no + or spaces)
- Ensure template is approved (for template messages)
- Check rate limits (1000 messages/24h in test mode)

**Media upload fails**
- Check Cloudinary credentials
- Verify media URL is accessible
- Check file size limits
- Ensure proper CORS headers

**Database errors**
- Verify Firebase credentials
- Check Firestore rules
- Ensure proper indexes

## Security Hardening

1. **Webhook Signature Verification**
   - Implement X-Hub-Signature validation
   - Reject unsigned requests

2. **IP Whitelisting**
   - Whitelist Meta's IP ranges
   - Block all other IPs

3. **Secrets Management**
   - Use AWS Secrets Manager
   - Or Google Cloud Secret Manager
   - Never hardcode secrets

4. **Audit Logging**
   - Log all API calls
   - Track who sent what message when
   - Retain logs for compliance

---

**Need Help?** Check the main README.md or Meta Developer Docs
