terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

resource "docker_image" "student_result_portal" {
  name = "student-result-portal:latest"
  build {
    context    = "."
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "student_result_portal" {
  name  = "student-result-portal"
  image = docker_image.student_result_portal.image_id

  ports {
    internal = 3000
    external = 3000
  }

  volumes {
    host_path      = "${path.cwd}/data"
    container_path = "/app/data"
  }

  restart = "unless-stopped"

  healthcheck {
    test     = ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval = "30s"
    timeout  = "10s"
    retries  = 3
  }

  depends_on = [docker_image.student_result_portal]
}

output "container_id" {
  description = "ID of the Docker container"
  value       = docker_container.student_result_portal.id
}

output "container_name" {
  description = "Name of the Docker container"
  value       = docker_container.student_result_portal.name
}

output "external_port" {
  description = "External port for the application"
  value       = docker_container.student_result_portal.ports[0].external
}
