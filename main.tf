terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

resource "azurerm_resource_group" "student_result_portal" {
  name     = "student-result-portal-rg"
  location = "East US"
}

resource "azurerm_container_registry" "acr" {
  name                = "studentresultportalacr"
  resource_group_name = azurerm_resource_group.student_result_portal.name
  location            = azurerm_resource_group.student_result_portal.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "student-result-portal-aks"
  location            = azurerm_resource_group.student_result_portal.location
  resource_group_name = azurerm_resource_group.student_result_portal.name
  dns_prefix          = "studentportal"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_DS2_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}

output "acr_login_server" {
  description = "ACR login server"
  value       = azurerm_container_registry.acr.login_server
}

output "aks_cluster_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.aks.name
}

output "aks_kube_config" {
  description = "AKS kube config"
  value       = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive   = true
}
