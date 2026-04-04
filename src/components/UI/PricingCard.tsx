interface PricingTier {
  name: string
  count: number
  price: string
  pricePerUnit: string
  isPopular?: boolean
  description?: string
  onClick?: () => void
}

interface PricingCardProps {
  tiers: PricingTier[]
}

export function PricingCard({ tiers }: PricingCardProps) {
  return (
    <div className="flex flex-col gap-3">
      {tiers.map((tier, idx) => {
        const isPopular = tier.isPopular

        return (
          <button
            key={idx}
            onClick={tier.onClick}
            type="button"
            className="w-full transition-all active:scale-95"
            style={{
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isPopular ? 'var(--color-primary)' : 'var(--color-surface)',
              border: isPopular ? 'none' : '1.5px solid var(--color-border)',
              padding: '20px',
              boxShadow: isPopular ? '0 8px 24px rgba(79, 106, 245, 0.25)' : 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Popular badge */}
            {isPopular && (
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '16px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                }}
              >
                EN POPÜLER
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : 'var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                    }}
                  >
                    {tier.count > 0 ? [...Array(Math.min(tier.count / 10, 3))]
                      .map((_, i) => (
                        <span key={i} style={{ display: 'inline-block' }}>
                          ☐
                        </span>
                      )) : ''}
                  </div>
                  <p
                    className="font-bold"
                    style={{
                      color: isPopular ? '#ffffff' : 'var(--color-text1)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {tier.count} {tier.name}
                  </p>
                </div>
                {tier.description && (
                  <p
                    className="text-xs leading-5"
                    style={{ color: isPopular ? 'rgba(255,255,255,0.75)' : 'var(--color-text2)' }}
                  >
                    {tier.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p
                  className="text-xl font-bold"
                  style={{
                    color: isPopular ? '#ffffff' : 'var(--color-text1)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {tier.price}
                </p>
                <p className="text-xs" style={{ color: isPopular ? 'rgba(255,255,255,0.6)' : 'var(--color-text2)' }}>
                  {tier.pricePerUnit}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
