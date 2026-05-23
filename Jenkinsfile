pipeline{
    agent any
    tools{
        nodejs "node" // This should match the name of the NodeJS installation configured in Jenkins
    }
    environment{
        VERCEL_TOKEN      = credentials('VERCEL_AUTH_TOKEN')
        VERCEL_ORG_ID     = credentials('VERCEL_ORG_ID')
        VERCEL_PROJECT_ID = credentials('VERCEL_PROJECT_ID')
    }

    stages{
        stage('Checkout Source'){
            steps{
                checkout scm
                echo "Checked out source code from Git repository."
            }
        }

        stage('Install Dependencies'){
            steps{
                echo "Installing project dependencies using npm ci..."
                sh 'npm ci'
                echo "Installed project dependencies."
            }
        }

        stage('Next.js Build'){
            steps{
                echo "Building the Next.js application..."
                sh 'npm run build'
                echo "Next.js application built successfully."
            }
        }

        stage('Deploy to Vercel'){
            steps{
                echo "Deploying to Vercel..."
                sh "npx vercel --token ${VERCEL_TOKEN} --prod --yes"
                echo "Deployment to Vercel completed."
            }
        }
    }
    post{
        success{
            echo "Pipeline completed successfully. The Next.js application has been deployed to Vercel."
        }
        failure{
            echo "Pipeline failed. Please check the logs for details."
        }
    }
}