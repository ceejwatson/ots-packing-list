'use client'

import type { BuyerProfile } from '@/lib/types'

/**
 * Optional buyer details. Every field is skippable — the report degrades to
 * national averages rather than refusing to run, and the lifestyle section is
 * omitted entirely if nothing here is answered.
 */
export default function ProfileFields({
  profile,
  onChange,
}: {
  profile: BuyerProfile
  onChange: (p: BuyerProfile) => void
}) {
  const set = <K extends keyof BuyerProfile>(key: K, value: BuyerProfile[K]) =>
    onChange({ ...profile, [key]: value })

  const num = (v: string): number | undefined => {
    const n = parseInt(v.replace(/[^\d]/g, ''), 10)
    return Number.isFinite(n) ? n : undefined
  }

  return (
    <div className="surface space-y-5 rounded-xl p-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="ZIP code">
          <input
            inputMode="numeric"
            maxLength={5}
            value={profile.zip ?? ''}
            onChange={(e) => set('zip', e.target.value.replace(/[^\d]/g, ''))}
            placeholder="30303"
            className={inputClass}
          />
        </Field>
        <Field label="Your age">
          <input
            inputMode="numeric"
            value={profile.driverAge ?? ''}
            onChange={(e) => set('driverAge', num(e.target.value))}
            placeholder="34"
            className={inputClass}
          />
        </Field>
        <Field label="Budget">
          <input
            inputMode="numeric"
            value={profile.budget ? `$${profile.budget.toLocaleString('en-US')}` : ''}
            onChange={(e) => set('budget', num(e.target.value))}
            placeholder="$20,000"
            className={inputClass}
          />
        </Field>
        <Field label="Miles per year">
          <input
            inputMode="numeric"
            value={profile.annualMiles ? profile.annualMiles.toLocaleString('en-US') : ''}
            onChange={(e) => set('annualMiles', num(e.target.value))}
            placeholder="12,000"
            className={inputClass}
          />
        </Field>
        <Field label="Commute (each way)">
          <input
            inputMode="numeric"
            value={profile.commuteMiles ?? ''}
            onChange={(e) => set('commuteMiles', num(e.target.value))}
            placeholder="18 mi"
            className={inputClass}
          />
        </Field>
        <Field label="People in household">
          <input
            inputMode="numeric"
            value={profile.householdSize ?? ''}
            onChange={(e) => set('householdSize', num(e.target.value))}
            placeholder="4"
            className={inputClass}
          />
        </Field>
        <Field label="Mostly driving">
          <select
            value={profile.drivingMix ?? ''}
            onChange={(e) => set('drivingMix', (e.target.value || undefined) as BuyerProfile['drivingMix'])}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="city">City</option>
            <option value="highway">Highway</option>
            <option value="mixed">Mixed</option>
          </select>
        </Field>
        <Field label="Driving record">
          <select
            value={profile.cleanRecord === undefined ? '' : profile.cleanRecord ? 'clean' : 'incidents'}
            onChange={(e) =>
              set('cleanRecord', e.target.value === '' ? undefined : e.target.value === 'clean')
            }
            className={inputClass}
          >
            <option value="">—</option>
            <option value="clean">Clean</option>
            <option value="incidents">Ticket or accident</option>
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3 border-t pt-4 hairline">
        <Toggle label="Snow" checked={profile.needsSnow} onChange={(v) => set('needsSnow', v)} />
        <Toggle label="Towing" checked={profile.needsTowing} onChange={(v) => set('needsTowing', v)} />
        <Toggle label="Road trips" checked={profile.roadTrips} onChange={(v) => set('roadTrips', v)} />
        <Toggle label="Pets" checked={profile.hasPets} onChange={(v) => set('hasPets', v)} />
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border bg-transparent px-3 py-2 text-[14px] outline-none hairline placeholder:text-[color:var(--muted)]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider muted">{label}</span>
      {children}
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[14px]">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[color:var(--accent)]"
      />
      {label}
    </label>
  )
}
