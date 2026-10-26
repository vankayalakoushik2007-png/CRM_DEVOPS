
pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        DOCKERHUB_REPO = '24mis0341/crm-devops'
    }

    stages {

        stage('1. Checkout') {
            steps {
                checkout scm
            }
        }

        stage('2. Validate Project') {
            steps {
                bat '''
                    if not exist "v1\\app.js" exit /b 1
                    if not exist "v2\\app.js" exit /b 1
                    if not exist "v3\\app.js" exit /b 1
                    if not exist "k8s\\v1.yaml" exit /b 1
                    if not exist "k8s\\v2.yaml" exit /b 1
                    if not exist "k8s\\v3.yaml" exit /b 1
                    echo All required files found.
                '''
            }
        }

        stage('3. Install Dependencies') {
            steps {
                bat 'cd v1 && npm install'
                bat 'cd v2 && npm install'
                bat 'cd v3 && npm install'
            }
        }

        stage('4. Test Applications') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'cd v1 && npm run test --if-present'
                bat 'cd v2 && npm run test --if-present'
                bat 'cd v3 && npm run test --if-present'
            }
        }

        stage('5. Build Docker Images') {
            steps {
                bat 'docker build -t %DOCKERHUB_REPO%:v1 v1'
                bat 'docker build -t %DOCKERHUB_REPO%:v2 v2'
                bat 'docker build -t %DOCKERHUB_REPO%:v3 v3'
            }
        }

        stage('6. Push and Verify Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat '''
                        echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin
                        if errorlevel 1 exit /b 1

                        docker push %DOCKERHUB_REPO%:v1
                        if errorlevel 1 exit /b 1

                        docker push %DOCKERHUB_REPO%:v2
                        if errorlevel 1 exit /b 1

                        docker push %DOCKERHUB_REPO%:v3
                        if errorlevel 1 exit /b 1

                        docker logout
                    '''
                }

                bat '''
                    echo ===== VERIFY CRM DOCKER IMAGES =====
                    docker images %DOCKERHUB_REPO%
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('7. Deploy to Kubernetes') {
            steps {
                bat '''
                    kubectl apply -f k8s/v1.yaml
                    if errorlevel 1 exit /b 1

                    kubectl apply -f k8s/v2.yaml
                    if errorlevel 1 exit /b 1

                    kubectl apply -f k8s/v3.yaml
                    if errorlevel 1 exit /b 1

                    kubectl rollout status deployment/crm-v1 --timeout=180s
                    if errorlevel 1 exit /b 1

                    kubectl rollout status deployment/crm-v2 --timeout=180s
                    if errorlevel 1 exit /b 1

                    kubectl rollout status deployment/crm-v3 --timeout=180s
                    if errorlevel 1 exit /b 1

                    echo ===== KUBERNETES DEPLOYMENT STATUS =====
                    kubectl get deployments,pods,services
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: All seven pipeline stages completed.'
        }

        failure {
            echo 'FAILURE: Check Console Output for the failed stage.'
        }

        always {
            echo 'CRM_DEVOPS pipeline execution finished.'
        }
    }
}
