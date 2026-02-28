output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_client_url" {
  description = "ECR repository URL for client image"
  value       = aws_ecr_repository.client.repository_url
}

output "ecr_ai_service_url" {
  description = "ECR repository URL for AI service image"
  value       = aws_ecr_repository.ai_service.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}
