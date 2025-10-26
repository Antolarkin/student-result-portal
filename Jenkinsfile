pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'student-result-portal'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        APP_PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building Docker image...'
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm test'
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Performing security scan...'
                sh "docker run --rm -v \$(pwd):/app -w /app node:18-alpine npm audit --audit-level=moderate"
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo 'Deploying to staging environment...'
                sh "docker stop ${DOCKER_IMAGE}-staging || true"
                sh "docker rm ${DOCKER_IMAGE}-staging || true"
                sh "docker run -d --name ${DOCKER_IMAGE}-staging -p 3001:${APP_PORT} ${DOCKER_IMAGE}:latest"
                sh 'sleep 10'
                sh 'curl -f http://localhost:3001/health || exit 1'
            }
        }

        stage('Integration Tests') {
            steps {
                echo 'Running integration tests...'
                sh 'curl -f http://localhost:3001/ || exit 1'
                sh 'curl -f http://localhost:3001/health || exit 1'
            }
        }

        stage('Deploy to Production') {
            steps {
                echo 'Deploying to production environment...'
                sh "docker stop ${DOCKER_IMAGE}-prod || true"
                sh "docker rm ${DOCKER_IMAGE}-prod || true"
                sh "docker run -d --name ${DOCKER_IMAGE}-prod -p ${APP_PORT}:${APP_PORT} --restart unless-stopped ${DOCKER_IMAGE}:latest"
                sh 'sleep 10'
                sh "curl -f http://localhost:${APP_PORT}/health || exit 1"
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Cleaning up old Docker images...'
                sh "docker image prune -f"
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Pipeline succeeded! Application deployed successfully.'
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
            sh "docker logs ${DOCKER_IMAGE}-staging || true"
            sh "docker logs ${DOCKER_IMAGE}-prod || true"
        }
    }
}
