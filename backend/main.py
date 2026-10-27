
from pathlib import Path
from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, atan2
from typing import Any
import os
import uuid

import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# =========================================================
# CONFIGURATION
# =========================================================

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "ml" / "models"

load_dotenv(ROOT / ".env")
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

supabase = None

if SUPABASE_URL and SUPABASE_SECRET_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

app = FastAPI(
    title="RideNow AI Backend",
    description="Ride booking, AI predictions, GPS tracking and safety API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# AI MODEL LOADING
# =========================================================
# Change these filenames if your trained models use different names.

MODEL_FILES = {
    "fare": "fare_prediction.joblib",
    "safety": "safety_score.joblib",
    "route_anomaly": "route_anomaly_detection.joblib",
}

models = {}
model_errors = {}


def load_models():
    models.clear()
    model_errors.clear()

    for name, filename in MODEL_FILES.items():
        path = MODEL_DIR / filename

        try:
            if path.exists():
                models[name] = joblib.load(path)
            else:
                model_errors[name] = f"Model file not found: {path}"
        except Exception as exc:
            model_errors[name] = str(exc)


@app.on_event("startup")
def startup():
    load_models()


def require_supabase():
    if supabase is None:
        raise HTTPException(
            status_code=503,
            detail="Supabase is not configured. Check your backend .env file.",
        )


def get_model(name):
    if name not in models:
        raise HTTPException(
            status_code=503,
            detail=model_errors.get(name, f"Model '{name}' is unavailable."),
        )
    return models[name]


# =========================================================
# HEALTH CHECKS
# =========================================================

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
        "status": "ok",
        "loaded_models": list(models.keys()),
        "model_errors": model_errors,
    }


@app.get("/api/health/db")
def database_health():
    require_supabase()

    try:
        supabase.table("rides").select("ride_id").limit(1).execute()
        return {
            "status": "connected",
            "database": "Supabase",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Supabase connection failed: {str(exc)}",
        )


# =========================================================
# DISTANCE CALCULATION
# =========================================================

def distance_metres(lat1, lon1, lat2, lon2):
    earth_radius = 6_371_000

    lat1, lon1 = radians(lat1), radians(lon1)
    lat2, lon2 = radians(lat2), radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    )

    return earth_radius * 2 * atan2(
        sqrt(a),
        sqrt(max(0.0, 1 - a)),
    )


def validate_coordinates(latitude, longitude):
    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422,
            detail="Latitude and longitude must be numeric.",
        )

    if not np.isfinite(latitude) or not -90 <= latitude <= 90:
        raise HTTPException(status_code=422, detail="Invalid latitude.")

    if not np.isfinite(longitude) or not -180 <= longitude <= 180:
        raise HTTPException(status_code=422, detail="Invalid longitude.")

    return latitude, longitude


# =========================================================
# AI FARE PREDICTION
# =========================================================

class AIFareRequest(BaseModel):
    distance: float = Field(gt=0)
    estimated_duration: int = Field(gt=0)
    vehicle_type: str
    time_of_day: int = Field(ge=0, le=23)
    day_of_week: int = Field(ge=0, le=6)
    traffic_level: str
    demand_level: str
    weather_condition: str


@app.post("/api/ai/fare-predict")
def ai_fare_predict(request: AIFareRequest):
    model = get_model("fare")

    hour = request.time_of_day
    traffic = request.traffic_level.strip().title()
    weather = request.weather_condition.strip().title()
    demand = request.demand_level.strip().title()

    features = {
        "distance_km": request.distance,
        "passenger_count": 1,
        "booking_hour": hour,
        "day_of_week": request.day_of_week,
        "is_weekend": int(request.day_of_week in [5, 6]),
        "is_peak_hour": int(hour in [8, 9, 10, 17, 18, 19, 20]),
        "is_late_night": int(hour >= 22 or hour <= 5),
        "traffic_weather_risk": (
            {"Low": 1, "Moderate": 2, "Medium": 2,
             "High": 3, "Severe": 4}.get(traffic, 2)
            + int(weather.lower() not in ["clear", "sunny"])
        ),
        "ride_request_count_15min": {
            "Low": 5, "Moderate": 15, "Medium": 15,
            "High": 30, "Very High": 45,
        }.get(demand, 15),
        "nearby_driver_count": {
            "Low": 20, "Moderate": 10, "Medium": 10,
            "High": 5, "Very High": 2,
        }.get(demand, 10),
        "demand_supply_ratio": {
            "Low": 0.5, "Moderate": 1.0, "Medium": 1.0,
            "High": 1.5, "Very High": 2.0,
        }.get(demand, 1.0),
        "estimated_arrival_min": request.estimated_duration,
        "pickup_wait_estimate": 5,
        "route_expected_km": request.distance,
        "pickup_zone": "Unknown",
        "drop_zone": "Unknown",
        "vehicle_type": request.vehicle_type.strip().title(),
        "traffic_level": traffic,
        "weather": weather,
        "payment_method": "Unknown",
        "booking_source": "Web",
    }

    # These features must match the feature names and preprocessing
    # used when your model was trained.
    try:
        frame = pd.DataFrame([features])
        predicted_fare = float(model.predict(frame)[0])

        return {
            "predicted_fare": round(max(0.0, predicted_fare), 2),
            "currency": "INR",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Fare prediction failed: {str(exc)}",
        )


# =========================================================
# AI SAFETY SCORE
# =========================================================

class AISafetyRequest(BaseModel):
    ride: dict[str, Any]
    driver: dict[str, Any]


@app.post("/api/ai/safety-score")
def ai_safety_score(request: AISafetyRequest):
    ride = request.ride
    driver = request.driver

    def bounded(value, default=0.0):
        try:
            return max(0.0, min(100.0, float(value)))
        except (TypeError, ValueError):
            return default

    rating = bounded(driver.get("rating", 0))
    rating_score = rating * 20 if rating <= 5 else rating

    total_rides = max(0, int(driver.get("total_rides", 0) or 0))
    cancellation_rate = bounded(driver.get("cancellation_rate", 0))

    history_score = min(100.0, total_rides / 10) * (
        1 - cancellation_rate / 100
    )

    route_score = 100 - bounded(ride.get("route_risk", 30))

    try:
        hour = int(ride.get("time_of_day", 12))
    except (TypeError, ValueError):
        hour = 12

    time_score = 60 if hour >= 22 or hour <= 5 else 100

    traffic = str(ride.get("traffic_level", "Moderate")).lower()
    traffic_score = {
        "low": 100,
        "moderate": 80,
        "medium": 80,
        "high": 55,
        "severe": 30,
    }.get(traffic, 70)

    area_score = 100 - bounded(ride.get("area_risk", 30))

    score = round(
        rating_score * 0.25
        + history_score * 0.20
        + route_score * 0.25
        + time_score * 0.10
        + traffic_score * 0.10
        + area_score * 0.10
    )

    score = max(0, min(100, score))

    if score >= 80:
        interpretation = "Higher estimated safety score"
    elif score >= 60:
        interpretation = "Moderate estimated safety score"
    else:
        interpretation = "Lower estimated safety score; review conditions"

    return {
        "score": score,
        "interpretation": interpretation,
        "disclaimer": "An estimate, not a guarantee of safety.",
    }


# =========================================================
# AI ROUTE ANOMALY DETECTION
# =========================================================

class AIAnomalyRequest(BaseModel):
    ride_id: str
    current_location: dict[str, Any]
    planned_route: dict[str, Any]


@app.post("/api/ai/anomaly-detect")
def ai_anomaly_detect(request: AIAnomalyRequest):
    try:
        current_lat, current_lon = validate_coordinates(
            request.current_location["latitude"],
            request.current_location["longitude"],
        )
        planned_lat, planned_lon = validate_coordinates(
            request.planned_route["latitude"],
            request.planned_route["longitude"],
        )
    except KeyError:
        raise HTTPException(
            status_code=422,
            detail="Both locations must contain latitude and longitude.",
        )

    distance = distance_metres(
        current_lat, current_lon, planned_lat, planned_lon
    )

    anomaly = distance > 500

    if distance > 1500:
        severity = "high"
    elif distance > 500:
        severity = "medium"
    else:
        severity = "low"

    return {
        "ride_id": request.ride_id,
        "isAnomaly": anomaly,
        "severity": severity,
        "distance_from_route_m": round(distance, 1),
        "reason": (
            "Location deviates from the supplied route point."
            if anomaly
            else "No significant deviation from the supplied route point."
        ),
    }


# =========================================================
# AI RIDE RECOMMENDATIONS
# =========================================================

class AIRecommendRequest(BaseModel):
    rides: list[dict[str, Any]]


@app.post("/api/ai/recommend")
def ai_recommend(request: AIRecommendRequest):
    if not request.rides:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one ride option.",
        )

    rides = []

    for index, item in enumerate(request.rides):
        try:
            fare = float(item["fare"])
            duration = float(item["estimated_duration"])
            safety = float(item.get("safety_score", 70))
            eco = float(item.get("eco_score", 70))

            if fare <= 0 or duration <= 0:
                raise ValueError
        except (KeyError, TypeError, ValueError):
            raise HTTPException(
                status_code=422,
                detail=f"Invalid fare or duration for ride at index {index}.",
            )

        rides.append({
            **item,
            "fare": fare,
            "estimated_duration": duration,
            "safety_score": max(0, min(100, safety)),
            "eco_score": max(0, min(100, eco)),
        })

    lowest_fare = min(item["fare"] for item in rides)
    shortest_duration = min(item["estimated_duration"] for item in rides)

    for item in rides:
        cost_score = lowest_fare / item["fare"] * 100
        time_score = shortest_duration / item["estimated_duration"] * 100

        score = (
            0.40 * item["safety_score"]
            + 0.30 * cost_score
            + 0.20 * time_score
            + 0.10 * item["eco_score"]
        )

        item["score"] = round(score, 2)
        item["reason"] = (
            f"Safety {item['safety_score']:.0f}/100; "
            f"cost efficiency {cost_score:.0f}/100; "
            f"time efficiency {time_score:.0f}/100; "
            f"eco score {item['eco_score']:.0f}/100."
        )

    rides.sort(key=lambda item: item["score"], reverse=True)

    return {"rides": rides}


# =========================================================
# SMART PICKUP
# =========================================================

class AISmartPickupRequest(BaseModel):
    candidates: list[dict[str, Any]]
    user_location: dict[str, Any]


@app.post("/api/ai/smart-pickup")
def ai_smart_pickup(request: AISmartPickupRequest):
    try:
        user_lat, user_lon = validate_coordinates(
            request.user_location["latitude"],
            request.user_location["longitude"],
        )
    except KeyError:
        raise HTTPException(
            status_code=422,
            detail="user_location requires latitude and longitude.",
        )

    if not request.candidates:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one pickup candidate.",
        )

    candidates = []

    for index, candidate in enumerate(request.candidates):
        try:
            lat, lon = validate_coordinates(
                candidate["latitude"], candidate["longitude"]
            )
        except KeyError:
            raise HTTPException(
                status_code=422,
                detail=f"Candidate {index} requires latitude and longitude.",
            )

        distance = distance_metres(user_lat, user_lon, lat, lon)

        candidates.append({
            **candidate,
            "distance_m": round(distance, 1),
            "score": round(max(0, 100 * (1 - distance / 5000)), 2),
            "reason": f"Approximately {distance:.0f} metres away.",
        })

    candidates.sort(key=lambda item: item["distance_m"])

    return {"candidates": candidates}


# =========================================================
# RIDE SEARCH
# =========================================================

class RideSearchRequest(BaseModel):
    pickup: Any
    destination: Any
    priority: str = "balanced"


@app.post("/api/rides/search")
def search_rides(request: RideSearchRequest):
    try:
        pickup_lat, pickup_lon = validate_coordinates(
            request.pickup["latitude"], request.pickup["longitude"]
        )
        dest_lat, dest_lon = validate_coordinates(
            request.destination["latitude"],
            request.destination["longitude"],
        )
    except (KeyError, TypeError):
        raise HTTPException(
            status_code=422,
            detail=(
                "pickup and destination must each contain "
                "latitude and longitude."
            ),
        )

    actual_distance_km = distance_metres(
        pickup_lat, pickup_lon, dest_lat, dest_lon
    ) / 1000

    estimated_distance = max(0.5, actual_distance_km * 1.25)

    vehicle_options = [
        {
            "vehicle_type": "Bike",
            "base_fare": 20,
            "per_km": 7,
            "speed": 25,
            "eco_score": 95,
            "safety_score": 72,
        },
        {
            "vehicle_type": "Auto",
            "base_fare": 30,
            "per_km": 12,
            "speed": 22,
            "eco_score": 70,
            "safety_score": 78,
        },
        {
            "vehicle_type": "Mini",
            "base_fare": 50,
            "per_km": 15,
            "speed": 25,
            "eco_score": 55,
            "safety_score": 82,
        },
        {
            "vehicle_type": "Sedan",
            "base_fare": 70,
            "per_km": 18,
            "speed": 28,
            "eco_score": 40,
            "safety_score": 84,
        },
    ]

    rides = []

    for index, vehicle in enumerate(vehicle_options, start=1):
        fare = round(
            vehicle["base_fare"] + estimated_distance * vehicle["per_km"],
            2,
        )
        duration = max(
            3,
            round(estimated_distance / vehicle["speed"] * 60 + 5),
        )

        rides.append({
            "ride_id": f"SEARCH{index:03d}-{uuid.uuid4().hex[:10]}",
            "vehicle_type": vehicle["vehicle_type"],
            "distance_km": round(estimated_distance, 2),
            "estimated_fare": fare,
            "estimated_duration": duration,
            "safety_score": vehicle["safety_score"],
            "eco_score": vehicle["eco_score"],
            "priority": request.priority,
            "estimated": True,
        })

    priority = request.priority.strip().lower()

    if priority in ("safety", "safest"):
        rides.sort(key=lambda r: r["safety_score"], reverse=True)
    elif priority in ("cheap", "cheapest", "cost"):
        rides.sort(key=lambda r: r["estimated_fare"])
    elif priority in ("fast", "fastest", "time"):
        rides.sort(key=lambda r: r["estimated_duration"])
    elif priority in ("eco", "green"):
        rides.sort(key=lambda r: r["eco_score"], reverse=True)
    elif priority not in ("balanced", "recommended", ""):
        raise HTTPException(
            status_code=422,
            detail="priority must be balanced, safety, cheap, fast, or eco.",
        )

    return {
        "pickup": request.pickup,
        "destination": request.destination,
        "estimated_distance_km": round(estimated_distance, 2),
        "rides": rides,
    }


# =========================================================
# RIDE BOOKING: SUPABASE
# =========================================================

class RideBookRequest(BaseModel):
    ride_id: str


BOOKING_OPTIONS = {
    1: {"vehicle_type": "Bike", "fare": 28.40},
    2: {"vehicle_type": "Auto", "fare": 44.40},
    3: {"vehicle_type": "Mini", "fare": 68.00},
    4: {"vehicle_type": "Sedan", "fare": 91.59},
}


def fetch_booking(ride_id: str):
    result = (
        supabase.table("rides")
        .select("ride_id, vehicle_type, estimated_fare, status, driver_id")
        .eq("ride_id", ride_id)
        .limit(1)
        .execute()
    )

    rows = result.data or []

    if not rows:
        return None

    row = rows[0]
    driver = None

    if row.get("driver_id"):
        driver_result = (
            supabase.table("drivers")
            .select("driver_id, name, rating, vehicle_number")
            .eq("driver_id", row["driver_id"])
            .limit(1)
            .execute()
        )

        if driver_result.data:
            driver = driver_result.data[0]

    fare = row.get("estimated_fare")

    return {
        "ride_id": row["ride_id"],
        "status": row["status"],
        "vehicle_type": row.get("vehicle_type"),
        "estimated_fare": float(fare) if fare is not None else None,
        "driver": driver,
        "message": (
            "Ride booked successfully."
            if row["status"] == "booked"
            else f"Ride status: {row['status']}."
        ),
    }


@app.post("/api/rides/book")
def book_ride(request: RideBookRequest):
    require_supabase()

    ride_id = request.ride_id.strip()

    if not ride_id:
        raise HTTPException(status_code=422, detail="ride_id is required.")

    try:
        existing = fetch_booking(ride_id)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not check booking: {str(exc)}",
        )

    if existing:
        return existing

    base_id = ride_id.split("-", 1)[0]

    try:
        ride_number = int(base_id.replace("SEARCH", ""))
    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Invalid ride ID. Search for rides again.",
        )

    if (
        base_id != f"SEARCH{ride_number:03d}"
        or ride_number not in BOOKING_OPTIONS
    ):
        raise HTTPException(
            status_code=404,
            detail="Ride not found. Search for rides again.",
        )

    option = BOOKING_OPTIONS[ride_number]
    vehicle_type = option["vehicle_type"]
    selected_driver = None

    try:
        vehicle_result = (
            supabase.table("vehicles")
            .select("vehicle_id, driver_id, vehicle_type, vehicle_number")
            .eq("vehicle_type", vehicle_type)
            .execute()
        )

        for vehicle in vehicle_result.data or []:
            driver_id = vehicle.get("driver_id")

            if not driver_id:
                continue

            driver_result = (
                supabase.table("drivers")
                .select("driver_id, name, rating, vehicle_number, is_available")
                .eq("driver_id", driver_id)
                .eq("is_available", True)
                .limit(1)
                .execute()
            )

            if driver_result.data:
                selected_driver = driver_result.data[0]
                break

        if selected_driver is None:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"No available driver is registered for {vehicle_type}. "
                    "Choose another vehicle type."
                ),
            )

        # Mark the driver unavailable before creating the ride.
        (
            supabase.table("drivers")
            .update({"is_available": False})
            .eq("driver_id", selected_driver["driver_id"])
            .execute()
        )

        try:
            inserted = (
                supabase.table("rides")
                .insert({
                    "ride_id": ride_id,
                    "vehicle_type": vehicle_type,
                    "estimated_fare": option["fare"],
                    "status": "booked",
                    "driver_id": selected_driver["driver_id"],
                })
                .execute()
            )

            if not inserted.data:
                raise RuntimeError("Supabase did not confirm the booking.")
        except Exception:
            (
                supabase.table("drivers")
                .update({"is_available": True})
                .eq("driver_id", selected_driver["driver_id"])
                .execute()
            )
            raise

        booking = fetch_booking(ride_id)

        if booking is None:
            raise RuntimeError("Could not retrieve the saved booking.")

        return booking

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save booking: {str(exc)}",
        )


@app.get("/api/rides/{ride_id}")
def get_ride_details(ride_id: str):
    require_supabase()

    try:
        booking = fetch_booking(ride_id.strip())
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve ride: {str(exc)}",
        )

    if booking is None:
        raise HTTPException(status_code=404, detail="Ride not found.")

    return booking


@app.post("/api/rides/{ride_id}/cancel")
def cancel_ride(ride_id: str):
    require_supabase()

    ride_id = ride_id.strip()

    try:
        booking = fetch_booking(ride_id)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve booking: {str(exc)}",
        )

    if booking is None:
        raise HTTPException(status_code=404, detail="Ride not found.")

    if booking["status"] == "cancelled":
        booking["message"] = "This ride has already been cancelled."
        return booking

    if booking["status"] != "booked":
        raise HTTPException(
            status_code=400,
            detail="This ride cannot be cancelled.",
        )

    try:
        (
            supabase.table("rides")
            .update({
                "status": "cancelled",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })
            .eq("ride_id", ride_id)
            .execute()
        )

        driver = booking.get("driver")

        if driver and driver.get("driver_id"):
            (
                supabase.table("drivers")
                .update({"is_available": True})
                .eq("driver_id", driver["driver_id"])
                .execute()
            )

        updated = fetch_booking(ride_id)

        if updated is None:
            raise RuntimeError("Could not retrieve updated ride.")

        updated["message"] = "Ride cancelled successfully."
        return updated

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not cancel ride: {str(exc)}",
        )


# =========================================================
# PERSISTENT GPS TRACKING: SUPABASE
#
# Required table: public.ride_tracking
# Columns:
# tracking_id, ride_id, latitude, longitude, speed, recorded_at
# =========================================================

@app.post("/api/rides/{ride_id}/location")
def update_ride_location(ride_id: str, data: dict):
    require_supabase()

    ride_id = ride_id.strip()

    if not ride_id:
        raise HTTPException(status_code=422, detail="ride_id is required.")

    try:
        latitude, longitude = validate_coordinates(
            data["latitude"], data["longitude"]
        )
        speed = float(data.get("speed", 0))
    except KeyError:
        raise HTTPException(
            status_code=422,
            detail="Provide latitude and longitude.",
        )
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422,
            detail="Latitude, longitude and speed must be numeric.",
        )

    if not np.isfinite(speed) or speed < 0:
        raise HTTPException(
            status_code=422,
            detail="Speed must be a non-negative number.",
        )

    try:
        ride_result = (
            supabase.table("rides")
            .select("ride_id, status")
            .eq("ride_id", ride_id)
            .limit(1)
            .execute()
        )

        if not ride_result.data:
            raise HTTPException(status_code=404, detail="Ride not found.")

        if ride_result.data[0]["status"] != "booked":
            raise HTTPException(
                status_code=409,
                detail="GPS tracking is only allowed for booked rides.",
            )

        point = {
            "ride_id": ride_id,
            "latitude": latitude,
            "longitude": longitude,
            "speed": speed,
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }

        result = supabase.table("ride_tracking").insert(point).execute()

        if not result.data:
            raise RuntimeError("Supabase did not confirm the GPS insert.")

        saved = result.data[0]

        return {
            "ride_id": ride_id,
            "message": "Location saved successfully.",
            "current_location": {
                "latitude": saved["latitude"],
                "longitude": saved["longitude"],
                "speed": saved.get("speed", 0),
                "timestamp": saved["recorded_at"],
            },
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save GPS location: {str(exc)}",
        )


@app.get("/api/rides/{ride_id}/tracking")
def get_ride_tracking(ride_id: str):
    require_supabase()

    ride_id = ride_id.strip()

    if not ride_id:
        raise HTTPException(status_code=422, detail="ride_id is required.")

    try:
        result = (
            supabase.table("ride_tracking")
            .select(
                "tracking_id, ride_id, latitude, longitude, speed, recorded_at"
            )
            .eq("ride_id", ride_id)
            .order("recorded_at", desc=False)
            .execute()
        )

        rows = result.data or []

        if not rows:
            return {
                "ride_id": ride_id,
                "total_points": 0,
                "current_location": None,
                "trail": [],
            }

        trail = [
            {
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "speed": row.get("speed", 0),
                "timestamp": row["recorded_at"],
            }
            for row in rows
        ]

        return {
            "ride_id": ride_id,
            "total_points": len(trail),
            "current_location": trail[-1],
            "trail": trail,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve GPS tracking: {str(exc)}",
        )


# =========================================================
# SOS EMERGENCY & SAFETY EVENTS
# Note: SOS events are stored in memory in this version.
# They reset when the backend restarts.
# =========================================================

safety_events = []


@app.post("/api/safety/sos")
def trigger_sos(data: dict):
    ride_id = str(data.get("ride_id", "")).strip()
    location = data.get("location")

    if not ride_id:
        raise HTTPException(status_code=422, detail="ride_id is required.")

    if not isinstance(location, dict):
        raise HTTPException(
            status_code=422,
            detail="location must contain latitude and longitude.",
        )

    try:
        latitude, longitude = validate_coordinates(
            location["latitude"], location["longitude"]
        )
    except KeyError:
        raise HTTPException(
            status_code=422,
            detail="Provide latitude and longitude.",
        )

    event = {
        "event_id": f"SAFETY{len(safety_events) + 1:04d}",
        "ride_id": ride_id,
        "event_type": "SOS",
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "recorded",
    }

    safety_events.append(event)

    return {
        "message": "SOS event recorded.",
        "event": event,
    }


@app.post("/api/safety/alert-contact")
def alert_trusted_contact(data: dict):
    ride_id = str(data.get("ride_id", "")).strip()
    contact_id = str(data.get("contact_id", "")).strip()

    if not ride_id or not contact_id:
        raise HTTPException(
            status_code=422,
            detail="Both ride_id and contact_id are required.",
        )

    # This endpoint does not send a real SMS or notification.
    return {
        "ride_id": ride_id,
        "contact_id": contact_id,
        "status": "simulated",
        "message": "Trusted-contact alert simulated. No real message was sent.",
    }


@app.get("/api/safety/{ride_id}")
def get_safety_events(ride_id: str):
    events = [
        event for event in safety_events
        if event["ride_id"] == ride_id.strip()
    ]

    return {
        "ride_id": ride_id,
        "total_events": len(events),
        "safety_events": events,
    }
