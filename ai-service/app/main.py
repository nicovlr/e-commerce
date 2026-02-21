import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.model import DemandModel
from app.schemas import (
    AlertItem,
    AlertsResponse,
    DemandPrediction,
    ErrorResponse,
    HealthResponse,
    PredictRequest,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Global model instance
demand_model = DemandModel()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load or train the model on startup."""
    logger.info("Starting up AI demand prediction service...")
    if not demand_model.load():
        logger.info("No saved model found. Training from scratch...")
        metrics = demand_model.train()
        logger.info(f"Training complete: {metrics}")
    else:
        logger.info("Loaded pre-trained model.")
    yield
    logger.info("Shutting down AI service.")


app = FastAPI(
    title="Stock Demand Prediction API",
    description="AI microservice for predicting product demand and generating stock alerts.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_trained=demand_model.is_trained,
        products_loaded=len(demand_model.get_all_product_ids()),
    )


@app.post(
    "/predict",
    response_model=DemandPrediction,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def predict_demand(request: PredictRequest):
    """Predict demand for a product over 7, 14, and 30 day windows."""
    if not demand_model.is_trained:
        raise HTTPException(status_code=500, detail="Model is not trained yet.")

    try:
        prediction_7d = demand_model.predict(request.product_id, 7)
        prediction_14d = demand_model.predict(request.product_id, 14)
        prediction_30d = demand_model.predict(request.product_id, 30)
        current_stock = demand_model.get_current_stock(request.product_id)

        return DemandPrediction(
            product_id=request.product_id,
            prediction_7d=prediction_7d,
            prediction_14d=prediction_14d,
            prediction_30d=prediction_30d,
            current_stock=current_stock,
            confidence=demand_model.confidence_score,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get(
    "/alerts",
    response_model=AlertsResponse,
    responses={500: {"model": ErrorResponse}},
)
async def get_stock_alerts():
    """Get alerts for products where current stock is below predicted 14-day demand."""
    if not demand_model.is_trained:
        raise HTTPException(status_code=500, detail="Model is not trained yet.")

    alerts: list[AlertItem] = []

    try:
        for product_id in demand_model.get_all_product_ids():
            predicted_14d = demand_model.predict(product_id, 14)
            current_stock = demand_model.get_current_stock(product_id)

            if current_stock < predicted_14d:
                deficit = round(predicted_14d - current_stock, 2)
                ratio = current_stock / predicted_14d if predicted_14d > 0 else 1.0

                if ratio < 0.3:
                    urgency = "high"
                elif ratio < 0.6:
                    urgency = "medium"
                else:
                    urgency = "low"

                alerts.append(
                    AlertItem(
                        product_id=product_id,
                        current_stock=current_stock,
                        predicted_14d_demand=predicted_14d,
                        deficit=deficit,
                        urgency=urgency,
                    )
                )

        # Sort by urgency (high first) then by deficit descending
        urgency_order = {"high": 0, "medium": 1, "low": 2}
        alerts.sort(key=lambda a: (urgency_order[a.urgency], -a.deficit))

        return AlertsResponse(alerts=alerts, total_alerts=len(alerts))

    except Exception as e:
        logger.error(f"Alert generation failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Alert generation error: {str(e)}"
        )
