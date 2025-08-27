# 🚀 Azure Deployment Guide - African Fintech Index Backend

## 📋 **Prerequisites**

- Azure subscription
- GitHub repository with the project
- Azure Web App service created

## 🔧 **Azure Web App Configuration**

### **1. Environment Variables Setup**

In your Azure Web App → Configuration → Application settings, add these environment variables:

| Name | Value | Description |
|------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | **IMPORTANT: Must be 5000, not 8080** |
| `MONGO_URI` | `mongodb+srv://FinTech:91073Tecy@cluster0.sybcb.mongodb.net/FinTech?retryWrites=true&w=majority&appName=Cluster0` | MongoDB connection |
| `JWT_SECRET` | `african-fintech-index-2024-secret-key-change-in-production` | JWT authentication secret |
| `SMTP_HOST` | `smtp.gmail.com` | Gmail SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `ntakirpetero@gmail.com` | Gmail account |
| `SMTP_PASS` | `dqdv dwjo iryp ywxj` | Gmail app password |
| `SMTP_FROM` | `ntakirpetero@gmail.com` | From email address |
| `ADMIN_EMAIL` | `ntakirpetero@gmail.com` | Admin contact email |
| `ADMIN_PHONE` | `+250781712615` | Admin contact phone |
| `TWILIO_ACCOUNT_SID` | `AC4f44480df2189a3722ad6cd4b1ebfc20` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | `6e132d1524cfb12fe553138d260c5257` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | `+17542543653` | Twilio phone number |
| `TWILIO_SENDER_NAME` | `African Fintech Index` | SMS sender name |

### **2. Port Configuration**

**CRITICAL**: Ensure your Azure Web App is configured to use port **5000**, not 8080.

## 🚀 **GitHub Actions Workflow**

The workflow automatically:
1. **Builds** the TypeScript backend
2. **Verifies** the build output
3. **Deploys** to Azure Web App

### **Workflow Triggers**
- **Push to main branch** - Automatic deployment
- **Manual trigger** - Use "workflow_dispatch"

## 🔍 **Troubleshooting Common Issues**

### **Issue 1: Port 409 Conflict**
**Error**: `Failed to deploy web package to App Service`
**Solution**: 
- Verify Azure Web App uses port 5000
- Check environment variables are set correctly
- Ensure the app service is not in a failed state

### **Issue 2: Build Failures**
**Error**: `dist/index.js not found`
**Solution**:
- Check TypeScript compilation
- Verify `tsconfig.json` is correct
- Ensure all dependencies are installed

### **Issue 3: Environment Variables Missing**
**Error**: App crashes on startup
**Solution**:
- Verify all environment variables are set in Azure
- Check for typos in variable names
- Restart the web app after configuration changes

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoint**
```
GET https://your-app-name.azurewebsites.net/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "uptime": 123.45,
  "environment": "production",
  "deployment": "NEW_DEPLOYMENT_2025_XX_XX"
}
```

### **Application Logs**
- **Azure Portal** → Web App → Log stream
- **GitHub Actions** → Workflow runs → Job logs

## 🛠️ **Manual Deployment (If Needed)**

### **1. Build Locally**
```bash
cd backend
npm install
npm run build
```

### **2. Verify Build Output**
```bash
ls -la dist/
# Should show dist/index.js
```

### **3. Deploy to Azure**
```bash
# Use Azure CLI or Azure DevOps
az webapp deployment source config-zip \
  --resource-group <resource-group> \
  --name <web-app-name> \
  --src <path-to-zip>
```

## 🔐 **Security Considerations**

### **Environment Variables**
- ✅ **Never commit secrets** to Git
- ✅ **Use Azure Key Vault** for production secrets
- ✅ **Rotate JWT secrets** regularly
- ✅ **Monitor access logs**

### **Network Security**
- ✅ **Enable HTTPS** only
- ✅ **Configure CORS** properly
- ✅ **Use Azure Application Gateway** if needed

## 📈 **Scaling Configuration**

### **Current Settings**
- **Min Instances**: 1
- **Max Instances**: 3
- **Health Check**: `/health` endpoint
- **Eviction Time**: 10 minutes

### **Performance Tuning**
- **Enable Always On** for consistent performance
- **Configure auto-scaling** based on CPU/memory
- **Use Azure CDN** for static assets

## 🚨 **Emergency Procedures**

### **Rollback Deployment**
1. Go to Azure Portal → Web App → Deployment Center
2. Select previous successful deployment
3. Click "Redeploy"

### **Restart Web App**
1. Azure Portal → Web App → Overview
2. Click "Restart"
3. Wait for service to come back online

### **Contact Support**
- **GitHub Issues**: Create issue in repository
- **Azure Support**: Use Azure support portal
- **Email**: ntakirpetero@gmail.com

## 📚 **Useful Resources**

- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Node.js on Azure](https://docs.microsoft.com/en-us/azure/developer/nodejs/)
- [TypeScript Configuration](https://www.typescriptlang.org/docs/)

## ✅ **Deployment Checklist**

- [ ] Environment variables configured in Azure
- [ ] Port set to 5000 (not 8080)
- [ ] GitHub Actions workflow updated
- [ ] TypeScript build working locally
- [ ] Health check endpoint responding
- [ ] MongoDB connection successful
- [ ] Email notifications working
- [ ] SMS notifications working
- [ ] Admin panel accessible
- [ ] User authentication working

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: African Fintech Index Team
