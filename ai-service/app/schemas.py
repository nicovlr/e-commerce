from pydantic import BaseModel, Field
from typing import Optional


class PredictRequest(BaseModel):
    product_id: int = Field(..., ge=1, le=10, description="Product ID (1-10)")


class DemandPrediction(BaseModel):
    product_id: int
    prediction_7d: float = Field(..., description="Predicted demand for next 7 days")
    prediction_14d: float = Field(..., description="Predicted demand for next 14 days")
    prediction_30d: float = Field(..., description="Predicted demand for next 30 days")
    current_stock: float = Field(..., description="Current stock level")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Model confidence score"
    )


class AlertItem(BaseModel):
    product_id: int
    current_stock: float
    predicted_14d_demand: float
    deficit: float = Field(..., description="How much stock is short")
    urgency: str = Field(..., description="low, medium, or high")


class AlertsResponse(BaseModel):
    alerts: list[AlertItem]
    total_alerts: int


class HealthResponse(BaseModel):
    status: str
    model_trained: bool
    products_loaded: int


class ErrorResponse(BaseModel):
    detail: str
