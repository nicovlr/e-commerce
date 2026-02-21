import pytest
from fastapi.testclient import TestClient

from app.main import app, demand_model


@pytest.fixture(scope="module", autouse=True)
def train_model():
    """Ensure the model is trained before running tests."""
    if not demand_model.is_trained:
        if not demand_model.load():
            demand_model.train()
    yield


@pytest.fixture(scope="module")
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


class TestHealthEndpoint:
    def test_health_check(self, client: TestClient):
        """Test that the health endpoint returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["model_trained"] is True
        assert data["products_loaded"] == 10


class TestPredictEndpoint:
    def test_predict_valid_product(self, client: TestClient):
        """Test prediction for a valid product ID."""
        response = client.post("/predict", json={"product_id": 1})
        assert response.status_code == 200
        data = response.json()
        assert data["product_id"] == 1
        assert data["prediction_7d"] > 0
        assert data["prediction_14d"] > 0
        assert data["prediction_30d"] > 0
        assert data["current_stock"] >= 0
        assert 0.0 <= data["confidence"] <= 1.0
        # 14-day prediction should be roughly double 7-day
        assert data["prediction_14d"] > data["prediction_7d"]
        # 30-day prediction should be greater than 14-day
        assert data["prediction_30d"] > data["prediction_14d"]

    def test_predict_invalid_product_zero(self, client: TestClient):
        """Test that product_id=0 is rejected by validation."""
        response = client.post("/predict", json={"product_id": 0})
        assert response.status_code == 422

    def test_predict_invalid_product_out_of_range(self, client: TestClient):
        """Test that product_id=999 is rejected by validation."""
        response = client.post("/predict", json={"product_id": 999})
        assert response.status_code == 422

    def test_predict_missing_product_id(self, client: TestClient):
        """Test that missing product_id returns validation error."""
        response = client.post("/predict", json={})
        assert response.status_code == 422

    def test_predict_all_products(self, client: TestClient):
        """Test predictions work for all 10 products."""
        for pid in range(1, 11):
            response = client.post("/predict", json={"product_id": pid})
            assert response.status_code == 200
            data = response.json()
            assert data["product_id"] == pid
            assert data["prediction_7d"] > 0


class TestAlertsEndpoint:
    def test_get_alerts(self, client: TestClient):
        """Test that alerts endpoint returns valid response structure."""
        response = client.get("/alerts")
        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data
        assert "total_alerts" in data
        assert isinstance(data["alerts"], list)
        assert data["total_alerts"] == len(data["alerts"])

    def test_alerts_structure(self, client: TestClient):
        """Test that each alert has the required fields."""
        response = client.get("/alerts")
        assert response.status_code == 200
        data = response.json()
        for alert in data["alerts"]:
            assert "product_id" in alert
            assert "current_stock" in alert
            assert "predicted_14d_demand" in alert
            assert "deficit" in alert
            assert "urgency" in alert
            assert alert["urgency"] in ["low", "medium", "high"]
            # Deficit should be positive (stock < demand)
            assert alert["deficit"] > 0
            assert alert["predicted_14d_demand"] > alert["current_stock"]

    def test_alerts_sorted_by_urgency(self, client: TestClient):
        """Test that alerts are sorted by urgency (high first)."""
        response = client.get("/alerts")
        data = response.json()
        urgency_order = {"high": 0, "medium": 1, "low": 2}
        urgencies = [urgency_order[a["urgency"]] for a in data["alerts"]]
        assert urgencies == sorted(urgencies)
