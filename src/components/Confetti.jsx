import React, { useEffect, useState, useRef } from 'react'

const COLORS = ['#F87171', '#FB923C', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA']

export default function Confetti({ show = false, pieces = 120, duration = 3000 }) {
  const [piecesState, setPiecesState] = useState([])
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!show) {
      setPiecesState([])
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
      return
    }

    // create pieces positioned across full width; they will start above viewport (top:-20vh)
    const arr = Array.from({ length: pieces }).map(() => ({
      id: Math.random().toString(36).slice(2),
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: 6 + Math.random() * 10,
      h: 10 + Math.random() * 14,
      delay: Math.random() * 500,
      fall: duration + Math.random() * 1200,
      sway: (Math.random() - 0.5) * 60,
      rotate: (Math.random() * 720) - 360,
    }))

    setPiecesState(arr)

    // cleanup after longest animation
    timeoutRef.current = setTimeout(() => setPiecesState([]), duration + 1200)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [show, pieces, duration])

  if (!show || piecesState.length === 0) return null

  return (
    <div aria-hidden className="confetti-root pointer-events-none fixed inset-0 z-50 overflow-hidden top-0 left-0">
      {piecesState.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `-40vh`,
            width: `${p.w}px`,
            height: `${p.h}px`,
            pointerEvents: 'none',
            animation: `confetti-fall ${p.fall}ms linear ${p.delay}ms forwards`,
          }}
        >
          <i
            className="confetti-inner"
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${p.color}, rgba(255,255,255,0.9))`,
              borderRadius: '3px',
              animation: `confetti-rotate ${p.fall}ms linear ${p.delay}ms forwards, confetti-sway 900ms ease-in-out ${p.delay}ms infinite alternate`,
              ['--sway']: `${p.sway}px`,
              position: 'relative',
              left: '0px',
            }}
          />
        </span>
      ))}

      <style>{`
        @keyframes confetti-fall {
          from { top: -40vh; }
          to   { top: 120vh; }
        }
        @keyframes confetti-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(720deg); }
        }
        @keyframes confetti-sway {
          from { left: 0px; }
          to   { left: var(--sway); }
        }

        /* lightweight coin shine indicator driven by data attr on body */
        body[data-coin-shine] .confetti-root::after {
          content: '';
          position: fixed;
          right: 20px;
          top: 16px;
          width: 60px;
          height: 24px;
          border-radius: 8px;
          background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12), transparent 30%), linear-gradient(90deg, rgba(255,215,0,0.12), rgba(255,215,0,0));
          pointer-events: none;
          animation: coin-shine 900ms ease-out;
        }
        @keyframes coin-shine { from { opacity: 0; transform: translateY(-6px) } 50% { opacity: 1 } to { opacity: 0; transform: translateY(-18px) } }

        /* lightweight trail indicator */
        body[data-trail] .confetti-root::before {
          content: '';
          position: fixed;
          left: 0; right: 0; top: 0; height: 200px;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%);
          pointer-events: none;
          animation: trail-fade 800ms ease-out;
        }
        @keyframes trail-fade { from { opacity: 1 } to { opacity: 0 } }
      `}</style>
    </div>
  )
}
