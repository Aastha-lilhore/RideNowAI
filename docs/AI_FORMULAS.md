# RideNow AI — AI/Logic Formulas (frontend stand-ins)

These are the exact formulas the frontend's mock services must implement, so the numbers are real and honest before the ML teammate's trained models are wired in. Do not invent alternate weights or logic — if a formula needs to change, update this file first and tell the team.

## Fare prediction
Inputs: `distance, estimated_duration, vehicle_type, time_of_day, day_of_week, traffic_level, demand_level, weather_condition`.
Implement as a documented rule-based formula (base fare + per-km + per-min + multipliers for traffic/demand/weather/time). Comment clearly that this is a stand-in for a Random Forest Regressor using the same feature set, so it's swappable later with no shape changes.

## Safety score
Weighted out of 100:
- Driver rating — 25%
- Driver history — 20%
- Route safety — 25%
- Time of day — 10%
- Traffic — 10%
- Area risk — 10%

Interpretation: 0–39 High Risk, 40–69 Moderate, 70–84 Safe, 85–100 Very Safe.

## Recommendation score
```
score = 0.40 * safety + 0.30 * costEfficiency + 0.20 * timeEfficiency + 0.10 * ecoScore
```
Cost and time efficiency are normalized relative to the other candidate rides in the same search (cheaper/faster = higher efficiency). Every recommended ride must also generate a plain-English `reason` string from these real numbers (e.g. "12% cheaper than fastest, 94/100 safety, arrives 7 min sooner").

## Route anomaly detection
Flag an anomaly if the vehicle deviates more than ~500m from the planned route AND the deviation persists beyond a short duration, or if a stop exceeds an expected-stop threshold. Comment that this is a stand-in for an Isolation Forest model using features: distance from expected route, deviation duration, unexpected stop duration, speed, route progress.

## Eco score
Normalize to 0–100 using CO2-per-km by vehicle/fuel type against a baseline trip, adjusted for occupancy.

## Smart pickup
Weighted ranking of candidate pickup points using distance, traffic, safety/lighting, crowd level, and vehicle accessibility.
