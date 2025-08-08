# Deploy RavePulse to AWS Amplify

## Prerequisites
- AWS Account
- GitHub repository with your code

## Steps

### 1. Push your code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ravepulse.git
git push -u origin main
```

### 2. Set up AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" > "Host web app"
3. Choose GitHub and authorize AWS Amplify
4. Select your repository and branch
5. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 3. Environment Variables

In Amplify Console > App settings > Environment variables, add:

```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=d9005acdc11141a1813f2ca6f20daa9b
SPOTIFY_CLIENT_SECRET=1678b867195542b4a15134e0d99b915a
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://YOUR-APP-ID.amplifyapp.com/api/auth/callback
NEXT_PUBLIC_APP_URL=https://YOUR-APP-ID.amplifyapp.com
```

### 4. Deploy

Click "Save and deploy"

### 5. Update Spotify App

After deployment, update your Spotify app redirect URI to:
`https://YOUR-APP-ID.amplifyapp.com/api/auth/callback`

## Custom Domain (Optional)

1. In Amplify Console > Domain management
2. Add your custom domain
3. Follow DNS configuration steps
4. Update all URLs in environment variables and Spotify app