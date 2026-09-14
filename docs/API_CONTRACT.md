RideNow AI — API Contract & Data Schema

This is the shared agreement between Frontend, Backend, and ML. Everyone builds against this exact shape — don't change it without telling the other two people first.

Database Schema (Backend owns this, everyone reads it)
users
field	type
id	PK
name	string
email	string
phone	string
password_hash	string
gender	string
profile_photo	string
safety_mode	boolean
created_at	datetime
drivers
field	type
id	PK
name	string
phone	string
license_number	string
vehicle_id	FK
rating	float
total_rides	int
safety_rating	float
verification_status	string
current_latitude	float
current_longitude	float
created_at	datetime
vehicles
field	type
id	PK
driver_id	FK
vehicle_number	string
vehicle_type	string
model	string
fuel_type	string
capacity	int
year	int
rides
field	type
id	PK
user_id	FK
driver_id	FK
pickup_latitude / pickup_longitude	float
destination_latitude / destination_longitude	float
distance	float (km)
estimated_duration	int (min)
actual_duration	int (min)
estimated_fare	float
actual_fare	float
ride_status	enum: REQUESTED, SEARCHING, DRIVER_ASSIGNED, DRIVER_ARRIVING, STARTED, COMPLETED, CANCELLED
route_type	enum: fastest, cheapest, safest, ai
safety_score	int (0–100)
eco_score	int (0–100)
created_at / completed_at	datetime
ride_locations
field	type
id	PK
ride_id	FK
latitude / longitude	float
speed	float
timestamp	datetime
safety_events
field	type
id	PK
ride_id	FK
event_type	string (e.g. "ROUTE_ANOMALY", "SOS")
severity	string
latitude / longitude	float
description	string
detected_at	datetime
resolved	boolean
trusted_contacts
field	type
id	PK
user_id	FK
name	string
phone	string
relationship	string
is_primary	boolean
ride_insights
field	type
id	PK
ride_id	FK
fare_per_km	float
time_saved	int (min)
distance	float
safety_score	int
eco_score	int
co2_estimate	float
route_efficiency	float
API Endpoints (Backend implements, Frontend calls, ML powers the /ai/* ones)
Auth
POST /api/auth/register — body: {name, email, phone, password, gender} → returns {user, token}
POST /api/auth/login — body: {email, password} → returns {user, token} or {error: reason}
Rides
POST /api/rides/search — body: {pickup, destination, priority} → returns list of candidate rides with fare/ETA/safety/eco
POST /api/rides/book — body: {ride_id} → returns booked ride with driver assigned
GET /api/rides/{ride_id} — returns full ride object
POST /api/rides/{ride_id}/cancel → returns updated ride status
AI (ML teammate's models live behind these)
POST /api/ai/fare-predict — body: {distance, estimated_duration, vehicle_type, time_of_day, day_of_week, traffic_level, demand_level, weather_condition} → returns {predicted_fare}
POST /api/ai/recommend — body: {rides: [...]} → returns ranked rides, each with {score, reason}
POST /api/ai/safety-score — body: {ride, driver} → returns {score, interpretation}
POST /api/ai/anomaly-detect — body: {ride_id, current_location, planned_route} → returns {isAnomaly, severity, reason}
POST /api/ai/smart-pickup — body: {candidates, user_location} → returns ranked pickup points
Tracking
POST /api/rides/{ride_id}/location — body: {latitude, longitude, speed} → logs a GPS point
GET /api/rides/{ride_id}/tracking → returns latest location + trail
Safety
POST /api/safety/sos — body: {ride_id, location} → logs a safety_event
POST /api/safety/alert-contact — body: {ride_id, contact_id} → simulated notification
GET /api/safety/{ride_id} → returns safety_events for that ride
AI Formulas (ML teammate implements these exactly — Frontend's mock services already match them)
Fare: Random Forest Regressor on the 8 features listed above → predicted_fare (INR)
Safety score: Driver rating 25% + Driver history 20% + Route safety 25% + Time of day 10% + Traffic 10% + Area risk 10% → 0–100
Recommendation score: 0.40*safety + 0.30*costEfficiency + 0.20*timeEfficiency + 0.10*ecoScore
Anomaly: Isolation Forest on route-deviation-distance, deviation duration, unexpected stop duration, speed, route progress — flag if deviation > ~500m and persists
Rule for changing this file

If anyone needs to change a field name, endpoint shape, or formula, they edit this file, commit with a clear message, and message the other two — don't just change your own code silently
