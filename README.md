# Student Result Portal

A comprehensive web application for managing student information and academic results, built with DevOps best practices.

## Features

- **Student Management**: Add, view, and manage student information
- **Result Management**: Record and display academic results with automatic grade calculation
- **Web Interface**: Responsive Bootstrap-based UI
- **Database**: SQLite for data persistence
- **REST API**: JSON endpoints for programmatic access
- **Health Checks**: Built-in health monitoring

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: EJS templates, Bootstrap 5
- **Testing**: Jest, Supertest
- **Containerization**: Docker
- **CI/CD**: Jenkins
- **Infrastructure as Code**: Ansible, Terraform
- **Orchestration**: Kubernetes

## Prerequisites

- Node.js 18+
- Docker
- Docker Compose (optional)
- Ansible
- Terraform
- kubectl (for Kubernetes deployment)
- minikube (for local Kubernetes)

## Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-result-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open http://localhost:3000 in your browser

5. **Run tests**
   ```bash
   npm test
   ```

## Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t student-result-portal .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 -v $(pwd)/data:/app/data student-result-portal
   ```

## Ansible Provisioning

Run the Ansible playbook to provision the infrastructure:

```bash
ansible-playbook playbook.yml
```

## Terraform Deployment

1. **Initialize Terraform**
   ```bash
   terraform init
   ```

2. **Plan the deployment**
   ```bash
   terraform plan
   ```

3. **Apply the configuration**
   ```bash
   terraform apply
   ```

## Kubernetes Deployment

1. **Start minikube**
   ```bash
   minikube start
   ```

2. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s-deployment.yml
   ```

3. **Check deployment status**
   ```bash
   kubectl get pods
   kubectl get services
   ```

## Jenkins CI/CD

The project includes a Jenkinsfile for automated CI/CD pipeline with the following stages:

- Checkout
- Build
- Test
- Security Scan
- Deploy to Staging
- Integration Tests
- Deploy to Production
- Cleanup

## API Endpoints

- `GET /` - Home page
- `GET /health` - Health check
- `GET /students` - List all students
- `POST /students` - Create new student
- `GET /students/:id/results` - Get student results
- `POST /students/:id/results` - Add result for student
- `GET /api/students/:id/results` - JSON API for student results

## Database Schema

### Students Table
- id (INTEGER, PRIMARY KEY)
- name (TEXT)
- roll_number (TEXT, UNIQUE)
- email (TEXT, UNIQUE)

### Results Table
- id (INTEGER, PRIMARY KEY)
- student_id (INTEGER, FOREIGN KEY)
- subject (TEXT)
- marks (INTEGER)
- grade (TEXT)
- semester (TEXT)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
