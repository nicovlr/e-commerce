import os
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "sales_data.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "demand_model.joblib"
METADATA_PATH = MODEL_DIR / "model_metadata.joblib"


class DemandModel:
    """Random Forest based demand prediction model.

    Features used:
        - day_of_week (0-6)
        - month (1-12)
        - rolling_avg_7d (7-day rolling average of quantity_sold)
        - rolling_avg_30d (30-day rolling average of quantity_sold)
        - stock_level
    """

    def __init__(self):
        self.model: RandomForestRegressor | None = None
        self.data: pd.DataFrame | None = None
        self.is_trained: bool = False
        self.product_ids: list[int] = []
        self.confidence_score: float = 0.0

    def _load_data(self) -> pd.DataFrame:
        """Load and preprocess the sales CSV data."""
        if not DATA_PATH.exists():
            raise FileNotFoundError(f"Sales data not found at {DATA_PATH}")

        df = pd.read_csv(DATA_PATH, parse_dates=["date"])
        df = df.sort_values(["product_id", "date"]).reset_index(drop=True)

        # Feature engineering
        df["day_of_week"] = df["date"].dt.dayofweek
        df["month"] = df["date"].dt.month

        # Rolling averages per product
        df["rolling_avg_7d"] = (
            df.groupby("product_id")["quantity_sold"]
            .transform(lambda x: x.rolling(window=7, min_periods=1).mean())
        )
        df["rolling_avg_30d"] = (
            df.groupby("product_id")["quantity_sold"]
            .transform(lambda x: x.rolling(window=30, min_periods=1).mean())
        )

        return df

    def _get_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extract feature matrix from dataframe."""
        feature_cols = [
            "day_of_week",
            "month",
            "rolling_avg_7d",
            "rolling_avg_30d",
            "stock_level",
        ]
        return df[feature_cols].values

    def train(self) -> dict:
        """Train the Random Forest model on sales data.

        Returns:
            dict with training metrics.
        """
        logger.info("Loading training data...")
        self.data = self._load_data()
        self.product_ids = sorted(self.data["product_id"].unique().tolist())

        X = self._get_features(self.data)
        y = self.data["quantity_sold"].values

        logger.info(f"Training on {len(X)} samples with {X.shape[1]} features...")

        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        )

        # Cross-validation to estimate confidence
        cv_scores = cross_val_score(
            self.model, X, y, cv=5, scoring="r2"
        )
        self.confidence_score = float(max(0.0, min(1.0, cv_scores.mean())))

        # Fit on full data
        self.model.fit(X, y)
        self.is_trained = True

        logger.info(
            f"Model trained. CV R2={cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})"
        )

        # Save model
        self.save()

        return {
            "samples": len(X),
            "features": X.shape[1],
            "cv_r2_mean": round(cv_scores.mean(), 4),
            "cv_r2_std": round(cv_scores.std(), 4),
            "confidence": round(self.confidence_score, 4),
        }

    def save(self) -> None:
        """Persist model and metadata to disk."""
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(
            {
                "product_ids": self.product_ids,
                "confidence_score": self.confidence_score,
            },
            METADATA_PATH,
        )
        logger.info(f"Model saved to {MODEL_PATH}")

    def load(self) -> bool:
        """Load a previously trained model from disk.

        Returns:
            True if model loaded successfully, False otherwise.
        """
        if MODEL_PATH.exists() and METADATA_PATH.exists():
            try:
                self.model = joblib.load(MODEL_PATH)
                metadata = joblib.load(METADATA_PATH)
                self.product_ids = metadata["product_ids"]
                self.confidence_score = metadata["confidence_score"]
                self.data = self._load_data()
                self.is_trained = True
                logger.info("Model loaded from disk.")
                return True
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                return False
        return False

    def predict(self, product_id: int, days: int) -> float:
        """Predict total demand for a product over the given number of days.

        Args:
            product_id: The product to predict for.
            days: Number of days to forecast.

        Returns:
            Predicted total quantity demanded over the period.
        """
        if not self.is_trained or self.model is None or self.data is None:
            raise RuntimeError("Model is not trained. Call train() first.")

        if product_id not in self.product_ids:
            raise ValueError(
                f"Unknown product_id {product_id}. "
                f"Valid IDs: {self.product_ids}"
            )

        # Get the most recent data for this product to use as a baseline
        product_data = self.data[self.data["product_id"] == product_id]
        last_row = product_data.iloc[-1]

        last_date = last_row["date"]
        rolling_7 = last_row["rolling_avg_7d"]
        rolling_30 = last_row["rolling_avg_30d"]
        stock = last_row["stock_level"]

        total_demand = 0.0

        for d in range(1, days + 1):
            future_date = last_date + pd.Timedelta(days=d)
            dow = future_date.dayofweek
            month = future_date.month

            features = np.array([[dow, month, rolling_7, rolling_30, stock]])
            daily_pred = float(self.model.predict(features)[0])
            daily_pred = max(0.0, daily_pred)

            total_demand += daily_pred

            # Update rolling averages for subsequent predictions
            rolling_7 = rolling_7 * (6 / 7) + daily_pred * (1 / 7)
            rolling_30 = rolling_30 * (29 / 30) + daily_pred * (1 / 30)

        return round(total_demand, 2)

    def get_current_stock(self, product_id: int) -> float:
        """Get the most recent stock level for a product."""
        if self.data is None:
            raise RuntimeError("Data not loaded.")
        product_data = self.data[self.data["product_id"] == product_id]
        return float(product_data.iloc[-1]["stock_level"])

    def get_all_product_ids(self) -> list[int]:
        """Return all known product IDs."""
        return self.product_ids
