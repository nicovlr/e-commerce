variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "e-commerce"
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
}

variable "backend_desired_count" {
  description = "Number of backend ECS tasks"
  type        = number
  default     = 2
}

variable "client_desired_count" {
  description = "Number of client ECS tasks"
  type        = number
  default     = 2
}

# ──────────────────────────────────────────────
# Auto-Scaling Capacity
# ──────────────────────────────────────────────

variable "backend_min_capacity" {
  description = "Minimum number of backend ECS tasks for auto-scaling"
  type        = number
  default     = 2
}

variable "backend_max_capacity" {
  description = "Maximum number of backend ECS tasks for auto-scaling"
  type        = number
  default     = 6
}

variable "client_min_capacity" {
  description = "Minimum number of client ECS tasks for auto-scaling"
  type        = number
  default     = 2
}

variable "client_max_capacity" {
  description = "Maximum number of client ECS tasks for auto-scaling"
  type        = number
  default     = 4
}
