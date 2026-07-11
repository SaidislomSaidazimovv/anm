import { ImageResponse } from 'next/og'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * The card people see when the link is shared. Same Gargantua mark as the
 * favicon, drawn with boxes because the renderer here is a layout engine, not a
 * browser — no arcs, so the disk is a bar and the event horizon is a circle
 * stacked on top of it.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#02020a',
          backgroundImage:
            'radial-gradient(circle at 50% 42%, rgba(255,170,60,0.16) 0%, rgba(2,2,10,0) 55%)',
        }}
      >
        {/* Mark */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 420,
            height: 260,
          }}
        >
          {/* Stacking is pure DOM order here — this renderer has no z-index. */}

          {/* photon ring — light bent up and over the hole */}
          <div
            style={{
              position: 'absolute',
              width: 190,
              height: 190,
              borderRadius: 95,
              border: '7px solid #ffcf8a',
            }}
          />
          {/* the disk's far side, swallowed where it passes behind the hole */}
          <div
            style={{
              position: 'absolute',
              width: 420,
              height: 11,
              borderRadius: 6,
              top: 112,
              opacity: 0.75,
              background: 'linear-gradient(90deg, #ff9a2b 0%, #ffd9a0 50%, #ff9a2b 100%)',
            }}
          />
          {/* event horizon */}
          <div
            style={{
              position: 'absolute',
              width: 138,
              height: 138,
              borderRadius: 69,
              background: '#02020a',
            }}
          />
          {/* near side, crossing in front of the hole */}
          <div
            style={{
              position: 'absolute',
              width: 420,
              height: 15,
              borderRadius: 8,
              top: 138,
              background: 'linear-gradient(90deg, #ff9a2b 0%, #fffdf5 50%, #ff9a2b 100%)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 76,
            letterSpacing: 28,
            color: '#ffffff',
            marginTop: 56,
            paddingLeft: 28,
          }}
        >
          {SITE_NAME}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 10,
            textTransform: 'uppercase',
            color: '#8a8a8a',
            marginTop: 22,
            paddingLeft: 10,
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    size
  )
}
