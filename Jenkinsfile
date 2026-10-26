
pipeline {
    agent any

    stages {
        stage('1. Checkout') {
            steps {
                checkout scm
            }
        }

        stage('2. Validate') {
            steps {
                bat 'git --version'
            }
        }

        stage('3. Install') {
            steps {
                bat 'cd v1 && npm install'
                bat 'cd v2 && npm install'
                bat 'cd v3 && npm install'
            }
        }

        stage('4. Test') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('5. Build Docker Images') {
            steps {
                bat 'docker build -t 24mis0341/crm-devops:v1 v1'
                bat 'docker build -t 24mis0341/crm-devops:v2 v2'
                bat 'docker build -t 24mis0341/crm-devops:v3 v3'
            }
        }

        stage('6. Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat 'echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin'
                    bat 'docker push 24mis0341/crm-devops:v1'
                    bat 'docker push 24mis0341/crm-devops:v2'
                    bat 'docker push 24mis0341/crm-devops:v3'
                }
            }
        }

        stage('7. Deploy Kubernetes') {
            steps {
                bat 'kubectl apply -f k8s/v1.yaml'
                bat 'kubectl apply -f k8s/v2.yaml'
                bat 'kubectl apply -f k8s/v3.yaml'
                bat 'kubectl get deployments,pods,services'
            }
        }
    }
}
