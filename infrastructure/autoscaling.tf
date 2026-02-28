# ──────────────────────────────────────────────
# ECS Auto-Scaling
# ──────────────────────────────────────────────

# ──────────────────────────────────────────────
# Auto-Scaling Targets
# ──────────────────────────────────────────────

resource "aws_appautoscaling_target" "backend" {
  max_capacity       = var.backend_max_capacity
  min_capacity       = var.backend_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_target" "client" {
  max_capacity       = var.client_max_capacity
  min_capacity       = var.client_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.client.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# ──────────────────────────────────────────────
# Backend Scaling Policies
# ──────────────────────────────────────────────

# CPU-based scaling for backend
resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "${var.project_name}-backend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Memory-based scaling for backend
resource "aws_appautoscaling_policy" "backend_memory" {
  name               = "${var.project_name}-backend-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# ──────────────────────────────────────────────
# Client Scaling Policies
# ──────────────────────────────────────────────

# CPU-based scaling for client
resource "aws_appautoscaling_policy" "client_cpu" {
  name               = "${var.project_name}-client-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.client.resource_id
  scalable_dimension = aws_appautoscaling_target.client.scalable_dimension
  service_namespace  = aws_appautoscaling_target.client.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
