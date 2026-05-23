pipeline{
    agent any
    tools{
        nodejs "nodejs" // This should match the name of the NodeJS installation configured in Jenkins
    }
    environment{
        VERCEL_TOKEN = credentials('VERCEL_AUTH_TOKEN')
    }
}