'use client'

interface CashStackProps {
  ratio: number // 0..1
  maxBills?: number
  variant?: 'vault' | 'burn'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

/**
 * Isometric layered stack of banded banknotes that physically dwindles as bank ratio drops.
 */
export function CashStack({
  ratio,
  maxBills = 10,
  variant = 'vault',
  size = 'md',
  label,
}: CashStackProps) {
  const clamped = Math.max(0, Math.min(1, ratio))
  const billCount = clamped <= 0 ? 0 : Math.max(1, Math.round(clamped * maxBills))

  const dims =
    size === 'sm'
      ? { w: 46, h: 42, billStep: 2.5, baseY: 32, rx: 19, ry: 7.5 }
      : size === 'lg'
        ? { w: 84, h: 74, billStep: 4.1, baseY: 58, rx: 35, ry: 12.5 }
        : { w: 62, h: 54, billStep: 3.1, baseY: 43, rx: 25, ry: 9.5 }

  // Palette shifts based on remaining health (or warm ember for burn pile)
  const palette =
    variant === 'burn'
      ? {
          top: '#fef2f2',
          topStroke: '#dc2626',
          side: '#fecaca',
          sideDark: '#f87171',
          band: '#dc2626',
          emblem: '#b91c1c',
        }
      : clamped <= 0.2
        ? {
            top: '#fff1f2',
            topStroke: '#e11d48',
            side: '#fecdd3',
            sideDark: '#fb7185',
            band: '#be123c',
            emblem: '#9f1239',
          }
        : clamped <= 0.45
          ? {
              top: '#fffbeb',
              topStroke: '#d97706',
              side: '#fde68a',
              sideDark: '#f59e0b',
              band: '#b45309',
              emblem: '#92400e',
            }
          : {
              top: '#ecfdf5',
              topStroke: '#059669',
              side: '#a7f3d0',
              sideDark: '#10b981',
              band: '#047857',
              emblem: '#065f46',
            }

  const cx = dims.w / 2
  const { rx, ry, baseY, billStep } = dims
  const thickness = size === 'sm' ? 2.2 : size === 'lg' ? 3.5 : 2.7

  const diamond = (cy: number, scale = 1) => {
    const x = rx * scale
    const y = ry * scale
    return `${cx},${cy - y} ${cx + x},${cy} ${cx},${cy + y} ${cx - x},${cy}`
  }

  return (
    <svg
      width={dims.w}
      height={dims.h}
      viewBox={`0 0 ${dims.w} ${dims.h}`}
      className={`payday-cash-stack payday-cash-stack--${variant}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Empty dashed tray / ground shadow */}
      <polygon
        points={diamond(baseY + 2, 1.02)}
        fill="rgba(15, 23, 42, 0.05)"
        stroke={billCount === 0 ? 'rgba(15, 23, 42, 0.22)' : 'none'}
        strokeDasharray={billCount === 0 ? '3 2' : undefined}
        strokeWidth="1"
      />

      {/* Stacked bills bottom-to-top */}
      {Array.from({ length: billCount }, (_, idx) => {
        const y = baseY - idx * billStep
        const isTop = idx === billCount - 1
        return (
          <g key={idx}>
            {/* Left edge thickness */}
            <polygon
              points={`${cx - rx},${y} ${cx},${y + ry} ${cx},${y + ry + thickness} ${cx - rx},${y + thickness}`}
              fill={palette.side}
              stroke={palette.topStroke}
              strokeWidth="0.65"
              strokeLinejoin="round"
            />
            {/* Right edge thickness */}
            <polygon
              points={`${cx},${y + ry} ${cx + rx},${y} ${cx + rx},${y + thickness} ${cx},${y + ry + thickness}`}
              fill={palette.sideDark}
              stroke={palette.topStroke}
              strokeWidth="0.65"
              strokeLinejoin="round"
            />
            {/* Top face */}
            <polygon
              points={diamond(y)}
              fill={palette.top}
              stroke={palette.topStroke}
              strokeWidth={isTop ? '0.95' : '0.6'}
              strokeLinejoin="round"
            />
            {/* Currency strap + $ emblem on topmost bill */}
            {isTop && (
              <>
                <polygon
                  points={`${cx - rx * 0.28},${y - ry * 0.72} ${cx + rx * 0.72},${y + ry * 0.28} ${cx + rx * 0.28},${y + ry * 0.72} ${cx - rx * 0.72},${y - ry * 0.28}`}
                  fill={palette.band}
                  fillOpacity="0.22"
                />
                <circle
                  cx={cx}
                  cy={y}
                  r={size === 'sm' ? 2.4 : size === 'lg' ? 4.4 : 3.2}
                  fill={palette.band}
                  fillOpacity="0.22"
                  stroke={palette.emblem}
                  strokeWidth="0.7"
                />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

interface VaultMeterProps {
  bank: number
  maxBank: number
  compact?: boolean
}

/**
 * Percentage-filled bank container whose liquid reserve level and color shift as funds drain.
 */
export function VaultMeter({ bank, maxBank, compact = false }: VaultMeterProps) {
  const safeMax = Math.max(1, maxBank)
  const pct = Math.max(0, Math.min(100, (bank / safeMax) * 100))
  const tone =
    pct <= 0 ? 'empty' : pct <= 20 ? 'critical' : pct <= 45 ? 'low' : 'healthy'

  return (
    <div className={`payday-vault-meter payday-vault-meter--${tone}${compact ? ' is-compact' : ''}`}>
      <div className="payday-vault-meter__track">
        <div className="payday-vault-meter__fill" style={{ width: `${pct}%` }} />
        <div className="payday-vault-meter__content">
          <span className="payday-vault-meter__amount">
            ${Math.max(0, Math.round(bank)).toLocaleString()}
          </span>
          <span className="payday-vault-meter__pct">{Math.round(pct)}%</span>
        </div>
      </div>
    </div>
  )
}

interface BidSplitPreviewProps {
  bank: number
  startingBank: number
  bid: number
}

/**
 * Live visual showing your cash stack splitting into Keep vs. Burn as you slide your sealed bid.
 */
export function BidSplitPreview({ bank, startingBank, bid }: BidSplitPreviewProps) {
  const safeStart = Math.max(startingBank, bank, 1)
  const keep = Math.max(0, bank - bid)
  const keepRatio = keep / safeStart
  const burnRatio = bid / safeStart
  const keepPct = bank > 0 ? Math.round((keep / bank) * 100) : 0
  const burnPct = bank > 0 ? Math.round((bid / bank) * 100) : 0

  return (
    <div className="payday-split-preview" aria-label="Live bank and bid visual">
      <div className="payday-split-card">
        <CashStack ratio={keepRatio} maxBills={11} variant="vault" size="md" />
        <div className="payday-split-card__meta">
          <span className="payday-split-card__label">Remaining Vault</span>
          <strong className="payday-split-card__val">${keep.toLocaleString()}</strong>
          <span className="payday-split-card__sub">{keepPct}% of current bank</span>
        </div>
      </div>

      <div className="payday-split-divider" aria-hidden="true">
        <span>→</span>
      </div>

      <div className={`payday-split-card payday-split-card--burn${bid > 0 ? ' is-active' : ''}`}>
        <CashStack ratio={burnRatio} maxBills={11} variant="burn" size="md" />
        <div className="payday-split-card__meta">
          <span className="payday-split-card__label">Burned This Round</span>
          <strong className="payday-split-card__val">${bid.toLocaleString()}</strong>
          <span className="payday-split-card__sub">
            {bid === 0 ? 'Punt ($0)' : `${burnPct}% of current bank`}
          </span>
        </div>
      </div>
    </div>
  )
}
