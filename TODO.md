# Azure Cloud Migration TODO

- [x] Update main.tf to use Azure providers (Resource Group, ACR, AKS)
- [x] Modify k8s-deployment.yml for ACR image reference and Azure Disk storage
- [x] Update playbook.yml for Azure deployment using az CLI and kubectl
- [x] Test Terraform configuration (terraform init, plan) - Local Docker works, Azure requires login
- [ ] Deploy infrastructure (terraform apply) - Requires Azure subscription and CLI login
- [ ] Deploy application to AKS (kubectl apply) - Requires Azure resources deployed
- [ ] Verify application functionality and database persistence - Requires deployed application
