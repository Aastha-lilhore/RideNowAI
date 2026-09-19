import { useState } from 'react'
import { ShieldCheck, ShieldHalf, TriangleAlert, Trash2, Radar, Share2 } from 'lucide-react'
import Switch from '../components/Switch.jsx'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'
import { getRideHistory } from '../services/rideService.js'
import { SAFETY_FEATURES } from '../data/safetyFeatures.js'

const FEATURE_ICONS = { Radar, ShieldCheck, Share2, TriangleAlert }

/**
 * Safety tab — the ONE canonical home for Women's Safety Mode
 * (docs/REQUIREMENTS.md): enhanced monitoring, driver/vehicle
 * verification, live sharing, route monitoring, a trusted contact, and a
 * standalone SOS. Shows real substance (average safety score, feature
 * list) even before the mode is switched on, rather than an empty toggle.
 *
 * PLACEHOLDER: settings and the trusted contact live only in this
 * session's state — there's no account backend yet to persist them to.
 */
function SafetyPage() {
  const [safetyMode, setSafetyMode] = useState(false)
  const [liveSharing, setLiveSharing] = useState(true)
  const [routeMonitoring, setRouteMonitoring] = useState(true)

  const [contact, setContact] = useState(null)
  const [contactForm, setContactForm] = useState({ name: '', phone: '' })

  const [sosStage, setSosStage] = useState('idle') // idle | confirming | sent

  const trips = getRideHistory()
  const avgSafety = Math.round(trips.reduce((sum, t) => sum + t.safety_score, 0) / trips.length)

  function handleAddContact(e) {
    e.preventDefault()
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return
    setContact(contactForm)
    setContactForm({ name: '', phone: '' })
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      {/* Header: pulsing shield + real average-safety stat, not an empty banner */}
      <div className="flex items-center gap-4">
        <div className="safety-float relative flex h-14 w-14 shrink-0 items-center justify-center">
          <span className="safety-pulse absolute inset-0 rounded-full bg-accent-amber/35" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-bg-card-alt">
            <ShieldHalf size={26} className="text-accent-amber-light" strokeWidth={1.75} />
          </span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Safety</h1>
          <p className="text-sm text-text-secondary">
            Average ride safety score: <span className="font-medium text-text-primary">{avgSafety}/100</span>
          </p>
        </div>
      </div>

      {/* Safety Mode */}
      <div className="mt-6 rounded-2xl border border-border-default bg-bg-card p-5">
        <Switch
          id="safety-mode"
          checked={safetyMode}
          onChange={setSafetyMode}
          label="Women's Safety Mode"
          description="Turns on enhanced monitoring, live sharing and stricter driver verification for every ride."
        />

        {safetyMode ? (
          <div className="mt-5 flex flex-col gap-4 border-t border-border-default pt-5">
            <p className="flex items-center gap-2 text-xs text-success-DEFAULT">
              <ShieldCheck size={14} /> Driver and vehicle verification enforced on every ride
            </p>
            <Switch
              id="live-sharing"
              checked={liveSharing}
              onChange={setLiveSharing}
              label="Live location sharing"
              description="Automatically share your live location with your trusted contact during rides."
            />
            <Switch
              id="route-monitoring"
              checked={routeMonitoring}
              onChange={setRouteMonitoring}
              label="Route monitoring"
              description="Get an alert if your ride deviates from the planned route."
            />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border-default pt-5">
            {SAFETY_FEATURES.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon]
              return (
                <div key={feature.title} className="flex items-start gap-2">
                  {Icon && <Icon size={15} className="mt-0.5 shrink-0 text-text-secondary" />}
                  <div>
                    <p className="text-xs font-medium text-text-primary">{feature.title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-text-secondary">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Trusted contact */}
      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <p className="font-display text-sm font-semibold text-text-primary">Trusted contact</p>
        {contact ? (
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">{contact.name}</p>
              <p className="text-xs text-text-secondary">{contact.phone}</p>
            </div>
            <button
              type="button"
              onClick={() => setContact(null)}
              className="rounded-md p-2 text-text-secondary transition-colors hover:text-danger-DEFAULT"
              aria-label="Remove trusted contact"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddContact} className="mt-3 flex flex-col gap-3">
            <TextField
              id="contact-name"
              label="Name"
              type="text"
              value={contactForm.name}
              onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
            />
            <TextField
              id="contact-phone"
              label="Phone number"
              type="tel"
              value={contactForm.phone}
              onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <Button type="submit" variant="secondary" className="self-start">
              Add contact
            </Button>
          </form>
        )}
      </div>

      {/* Standalone SOS */}
      <div className="mt-4">
        {sosStage === 'idle' && (
          <Button variant="outlineDanger" onClick={() => setSosStage('confirming')} className="w-full">
            <TriangleAlert size={16} className="mr-2" /> SOS
          </Button>
        )}
        {sosStage === 'confirming' && (
          <div className="rounded-xl border border-danger-DEFAULT/50 bg-danger-DEFAULT/10 p-4">
            <p className="text-sm text-text-primary">Send an SOS alert to your trusted contacts?</p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" onClick={() => setSosStage('sent')} className="flex-1">
                Confirm SOS
              </Button>
              <Button variant="secondary" onClick={() => setSosStage('idle')} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
        {sosStage === 'sent' && (
          <div className="rounded-xl border border-danger-DEFAULT/50 bg-danger-DEFAULT/10 p-4 text-center text-sm text-text-primary">
            SOS alert sent to your trusted contacts (prototype).
          </div>
        )}
      </div>
    </div>
  )
}

export default SafetyPage
