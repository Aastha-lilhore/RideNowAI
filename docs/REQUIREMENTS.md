# RideNow AI — Frontend Requirements

## Functional Requirements

### Authentication
- Login
- Signup
- Optional Google sign-in if supported by the final implementation

### Dashboard
- Greeting
- Pickup input
- Destination input
- Quick actions
- AI recommendation entry point

### Ride Search
- Pickup
- Destination
- Priority selection:
  - Cheapest
  - Fastest
  - Safest
  - AI Recommended

### AI Results
Each ride option should support:
- Fare
- ETA
- Safety score
- Driver rating
- Eco score
- Recommendation explanation

### Ride Details
- Driver profile
- Rating
- Vehicle details
- Safety score
- Estimated fare
- Distance
- ETA
- Eco score
- Confirm Ride

### Live Ride
- Interactive map
- Vehicle/driver marker
- Driver information
- Ride status
- Safety score
- Share Ride
- SOS prototype action

### Route Anomaly
- Normal monitoring state
- Alert state
- Clear explanation of anomaly
- Safety actions

### Women's Safety Mode
- Enhanced monitoring
- Driver/vehicle verification
- Live sharing
- Route monitoring
- Trusted contact
- SOS prototype action

### Insights
- Total spending
- Distance
- Ride count
- Average safety
- AI insights
- Sustainability statistics

## Non-Functional Requirements
- Responsive
- Usable
- Reliable
- Secure-ready
- Scalable architecture
- Practical response times
- Accessible
- Maintainable

## Source Alignment
The frontend must support the complete prototype flow described in the project blueprint and synopsis.

## Scope Boundary
Frontend must not implement backend/database/ML internals. It should integrate with them through clean API/service boundaries.
