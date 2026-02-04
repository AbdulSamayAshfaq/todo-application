# Hugging Face Spaces Deployment Guide

## Step 1: Install Hugging Face CLI

### Windows (PowerShell - Run as Administrator)
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://hf.co/cli/install.ps1 | iex"
```

### Linux/macOS
```bash
curl -sSL https://hf.co/cli/install.sh | bash
```

## Step 2: Login to Hugging Face

```bash
hf login
```
Enter your Hugging Face token when prompted. You can get your token from: https://huggingface.co/settings/tokens

## Step 3: Clone Your Space

```bash
git clone https://huggingface.co/spaces/Abdulsamay/todo-bk
cd todo-bk
```

## Step 4: Copy Your Project Files

Copy the following files and folders to your cloned space:
- `backend/` folder
- `ai-agent/` folder
- `huggingface_space/app.py`
- `huggingface_space/Dockerfile`
- `huggingface_space/README.md`
- `huggingface_space/.env.example` → rename to `.env`

## Step 5: Configure Environment Variables

1. Go to your Space settings: https://huggingface.co/spaces/Abdulsamay/todo-bk/settings
2. Add the following secrets:
   - `JWT_SECRET_KEY` - Your secret key for JWT tokens
   - `OPENAI_API_KEY` - Your Google AI API key (get from https://aistudio.google.com/)

## Step 6: Deploy to Hugging Face

### Option A: Using Git
```bash
git add .
git commit -m "Add todo app with AI chatbot"
git push
```

### Option B: Using HF CLI
```bash
hf space push
```

## Step 7: Access Your Deployed Application

Once deployed, your application will be available at:
- **Backend API**: https://abdulsamay-todo-bk.hf.space
- **Health Check**: https://abdulsamay-todo-bk.hf.space/health

## Testing Your Deployment

### Test Backend API
```bash
# Check health
curl https://abdulsamay-todo-bk.hf.space/health

# Register a user
curl -X POST https://abdulsamay-todo-bk.hf.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

### Test Chatbot API
```bash
curl -X POST https://abdulsamay-todo-bk.hf.space:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"list my tasks","user_id":"testuser"}'
```

## Troubleshooting

### Port Already in Use
If you get a port error, make sure no other service is using ports 8000 or 8001.

### Dependencies Not Installing
Check that your `requirements.txt` files are correct and accessible.

### CORS Errors
Make sure your frontend URL is correctly configured in the CORS settings.

### Database Issues
For production, consider using a managed database service instead of SQLite.

## Next Steps

1. **Add a Frontend**: Deploy your Next.js frontend to Vercel or another hosting service
2. **Set Up CI/CD**: Configure automatic deployments on code changes
3. **Add Monitoring**: Set up logging and monitoring for your application
4. **Scale Upgrading**: Consider upgrading to a paid tier for more resources

## Support

- Hugging Face Spaces Documentation: https://huggingface.co/docs/hub/spaces
- FastAPI Documentation: https://fastapi.tiangolo.com
- Google AI Documentation: https://ai.google.dev/docs
