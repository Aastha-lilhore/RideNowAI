import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getRideHistory } from '../services/rideService.js'

/**
 * Insights tab (docs/REQUIREMENTS.md -> Insights): total spending,
 * distance, ride count, average safety, AI insights, sustainability
 * stats — now a real mini-dashboard with two charts (fare per ride,
 * safety score trend) rather than just tiles. All numbers come from the
 * same mock ride history the Activity tab uses — nothing separately
 * invented.
 */
const CO2_GOAL_KG = 10 // arbitrary monthly demo goal, shown so the progress bar has meaning

const CHART_COLORS = {
  grid: '#2e2924',
  axis: '#a39a8f',
  amber: '#d9822b',
  amberLight: '#f0a94e',
}

function shortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border-default bg-bg-card-alt px-3 py-2 text-xs">
      <p className="text-text-secondary">{label}</p>
      <p className="font-medium text-text-primary">
        {payload[0].value}
        {unit}
      </p>
    </div>
  )
}

function InsightsPage() {
  const trips = getRideHistory()
  // charts read oldest -> newest, left to right
  const chronological = [...trips].reverse().map((t) => ({ ...t, dateLabel: shortDate(t.completed_at) }))

  const totalSpending = trips.reduce((sum, t) => sum + t.actual_fare, 0)
  const totalDistance = Math.round(trips.reduce((sum, t) => sum + t.distance, 0) * 10) / 10
  const rideCount = trips.length
  const avgSafety = Math.round(trips.reduce((sum, t) => sum + t.safety_score, 0) / rideCount)
  const totalCo2Saved = Math.round(trips.reduce((sum, t) => sum + t.co2_estimate, 0) * 10) / 10
  const totalTimeSaved = trips.reduce((sum, t) => sum + t.time_saved, 0)
  const co2Progress = Math.min(100, Math.round((totalCo2Saved / CO2_GOAL_KG) * 100))

  const tiles = [
    { label: 'Total spending', value: `₹${totalSpending}` },
    { label: 'Distance travelled', value: `${totalDistance} km` },
    { label: 'Ride count', value: rideCount },
    { label: 'Average safety', value: `${avgSafety}/100` },
  ]

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Insights</h1>
      <p className="mt-1 text-sm text-text-secondary">Across your last {rideCount} rides.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-border-default bg-bg-card p-4">
            <p className="text-xs text-text-secondary">{tile.label}</p>
            <p className="mt-1 font-display text-lg font-semibold text-text-primary">{tile.value}</p>
          </div>
        ))}
      </div>

      {/* Fare per ride */}
      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <p className="text-sm font-medium text-text-primary">Fare per ride</p>
        <div className="mt-3 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chronological} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
              />
              <YAxis tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<ChartTooltip unit=" ₹" />} cursor={{ fill: 'rgba(217,130,43,0.08)' }} />
              <Bar dataKey="actual_fare" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Safety score trend */}
      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <p className="text-sm font-medium text-text-primary">Safety score trend</p>
        <div className="mt-3 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chronological} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<ChartTooltip unit="/100" />} cursor={{ stroke: CHART_COLORS.grid }} />
              <Line
                type="monotone"
                dataKey="safety_score"
                stroke={CHART_COLORS.amberLight}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.amberLight, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text-primary">Sustainability</p>
          <p className="text-xs text-text-secondary">{totalCo2Saved} / {CO2_GOAL_KG} kg CO₂ saved</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg-card-alt">
          <div className="h-full rounded-full bg-accent-amber" style={{ width: `${co2Progress}%` }} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card-alt p-5">
        <p className="text-sm font-medium text-text-primary">AI insights</p>
        <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
          AI-recommended rides saved you about {totalTimeSaved} minutes in total across these trips, at an
          average safety score of {avgSafety}/100.
        </p>
      </div>
    </div>
  )
}

export default InsightsPage
