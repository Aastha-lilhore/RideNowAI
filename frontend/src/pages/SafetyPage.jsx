import { useState } from 'react'
import { ShieldCheck, ShieldHalf, TriangleAlert, Trash2, Radar, Share2, Star, Plus } from 'lucide-react'
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

  const [contacts, setContacts] = useState([])
  const [contactForm, setContactForm] = useState({ name: '', phone: '' })
  const [addingContact, setAddingContact] = useState(true)

  const [sosStage, setSosStage] = useState('idle') // idle | confirming | sent

  const trips = getRideHistory()
  const avgSafety = Math.round(trips.reduce((sum, t) => sum + t.safety_score, 0) / trips.length)

  function handleAddContact(e) {
    e.preventDefault()
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return
    setContacts((prev) => [...prev, { ...contactForm, id: Date.now() }])
    setContactForm({ name: '', phone: '' })
    setAddingContact(false)
  }

  function removeContact(id) {
    setContacts((prev) => prev.filter((c) => c.id !== id))
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

      {/* Trusted contacts — matches trusted_contacts table: multiple contacts, first is primary */}
      <div className="mt-4 rounded-2xl border border-border-default bg-bg-card p-5">
        <p className="font-display text-sm font-semibold text-text-primary">Trusted contacts</p>

        {contacts.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {contacts.map((c, index) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-bg-card-alt px-3.5 py-2.5">
                <div>
                  <p className="flex items-center gap-1.5 text-sm text-text-primary">
                    {c.name}
                    {index === 0 && (
                      <Star size={11} className="fill-accent-amber-light text-accent-amber-light" aria-label="Primary contact" />
                    )}
                  </p>
                  <p className="text-xs text-text-secondary">{c.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeContact(c.id)}
                  className="rounded-md p-2 text-text-secondary transition-colors hover:text-danger-DEFAULT"
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {addingContact ? (
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
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" className="flex-1">
                Add contact
              </Button>
              {contacts.length > 0 && (
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setAddingContact(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAddingContact(true)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent-amber-light hover:underline"
          >
            <Plus size={14} /> Add another contact
          </button>
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
