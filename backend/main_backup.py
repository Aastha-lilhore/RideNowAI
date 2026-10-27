
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "ml" / "models"

app = FastAPI(
    title="RideNow AI Backend",
    description="Ride fare, safety risk and route anomaly prediction API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_FILES = {
    "fare": "fare_prediction.joblib",
    "safety": "safety_score.joblib",
    "route_anomaly": "route_anomaly_detection.joblib",
}

FEATURES = {
    "fare": {
        "numeric": [
            "distance_km", "passenger_count", "booking_hour",
            "day_of_week", "is_weekend", "is_peak_hour",
            "is_late_night", "traffic_weather_risk",
            "ride_request_count_15min", "nearby_driver_count",
            "demand_supply_ratio", "estimated_arrival_min",
            "pickup_wait_estimate", "route_expected_km",
        ],
        "categorical": [
            "pickup_zone", "drop_zone", "vehicle_type",
            "traffic_level", "weather", "payment_method",
            "booking_source",
        ],
    },
    "safety": {
        "numeric": [
            "distance_km", "passenger_count", "booking_hour",
            "day_of_week", "is_weekend", "is_peak_hour",
            "is_late_night", "traffic_weather_risk",
            "ride_request_count_15min", "nearby_driver_count",
            "demand_supply_ratio", "estimated_arrival_min",
            "pickup_wait_estimate", "driver_acceptance_rate",
            "driver_cancellation_history", "driver_profile_rating",
        ],
        "categorical": [
            "pickup_zone", "drop_zone", "vehicle_type",
            "traffic_level", "weather", "payment_method",
            "booking_source",
        ],
    },
    "route_anomaly": {
        "numeric": [
            "distance_km", "passenger_count", "booking_hour",
            "day_of_week", "traffic_weather_risk",
            "route_expected_km", "actual_route_km",
            "trip_duration_min", "unexpected_stop_count",
            "gps_signal_gap_min", "driver_speed_kmh_simulated",
            "driver_gps_accuracy_m_simulated",
            "estimated_arrival_min",
        ],
        "categorical": [
            "pickup_zone", "drop_zone", "vehicle_type",
            "traffic_level", "weather",
            "driver_location_status_simulated",
        ],
    },
}

models = {}
model_errors = {}


def load_models():
    models.clear()
    model_errors.clear()

    for name, filename in MODEL_FILES.items():
        path = MODEL_DIR / filename
        try:
            if not path.exists():
                model_errors[name] = f"Missing model: {path}"
            else:
                models[name] = joblib.load(path)
        except Exception as exc:
            model_errors[name] = str(exc)


@app.on_event("startup")
def startup():
    load_models()


class PredictionRequest(BaseModel):
    features: dict[str, Any]


def get_model(name):
    if name not in models:
        raise HTTPException(
            status_code=503,
            detail=model_errors.get(name, "Model unavailable"),
        )
    return models[name]


def make_frame(name, supplied):
    config = FEATURES[name]
    row = {}

    for col in config["numeric"]:
        value = supplied.get(col)

        if value is None or value == "":
            row[col] = np.nan
        else:
            try:
                row[col] = float(value)
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=422,
                    detail=f"{col} must be numeric",
                )

    for col in config["categorical"]:
        value = supplied.get(col, "Missing")
        row[col] = (
            "Missing"
            if value is None or str(value).strip() == ""
            else str(value)
        )

    return pd.DataFrame(
        [row],
        columns=config["numeric"] + config["categorical"],
    )


@app.get("/")
def home():
    return {
        "message": "RideNow AI API is running",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok" if len(models) == 3 else "degraded",
        "loaded_models": list(models.keys()),
        "model_errors": model_errors,
    }


@app.post("/api/predict/fare")
def predict_fare(request: PredictionRequest):
    model = get_model("fare")
    frame = make_frame("fare", request.features)

    try:
        fare = float(model.predict(frame)[0])
        return {
            "predicted_fare": max(0.0, fare),
            "currency": "INR",
            "note": "Estimated fare; actual fare may differ.",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


def binary_prediction(name, features):
    model = get_model(name)
    frame = make_frame(name, features)

    try:
        label = int(model.predict(frame)[0])
        result = {"label": label}

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(frame)[0]
            classes = list(model.classes_)
            index = classes.index(1) if 1 in classes else -1
            result["positive_probability"] = float(probabilities[index])

        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/predict/safety")
def predict_safety(request: PredictionRequest):
    result = binary_prediction("safety", request.features)

    return {
        "risk_label": result["label"],
        "risk_probability": result.get("positive_probability"),
        "warning": (
            "Experimental model output only; this is not a guarantee "
            "of safety or a replacement for emergency services."
        ),
    }


@app.post("/api/predict/route-anomaly")
def predict_route_anomaly(request: PredictionRequest):
    result = binary_prediction("route_anomaly", request.features)

    return {
        "anomaly_detected": bool(result["label"]),
        "anomaly_probability": result.get("positive_probability"),
        "note": "Use after trip data is available; this API does not track live GPS.",
    }
