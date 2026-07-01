import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onDone: () => void
}

function PulseDot({ delay }: { delay: number }) {
  return (
    <motion.div
      style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)' }}
      animate={{ opacity: [0.35, 1, 0.35] }}
      transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

export function SplashScreen({ onDone }: Props) {
  const [visible, setVisible] = useState(true)
  const stemRef = useRef<SVGPathElement>(null)
  const [stemLength, setStemLength] = useState(16)

  useEffect(() => {
    if (stemRef.current) {
      setStemLength(stemRef.current.getTotalLength())
    }

    const hideTimer = setTimeout(() => setVisible(false), 1700)
    const doneTimer = setTimeout(onDone, 2050) // after fade-out (0.35s)
    return () => { clearTimeout(hideTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#E8775A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          {/* Logo container */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" overflow="visible">
              {/* Hill */}
              <motion.ellipse
                cx="13" cy="23" rx="9" ry="2"
                fill="rgba(255,255,255,0.2)"
                style={{ transformOrigin: '13px 23px' }}
                initial={{ scaleX: 0.6, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
              />

              {/* Stem — path so getTotalLength() works */}
              <motion.path
                ref={stemRef}
                d="M13 22 L13 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDasharray: stemLength, strokeDashoffset: stemLength }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                style={{ strokeDasharray: stemLength }}
              />

              {/* Left leaf */}
              <motion.path
                d="M13 14 Q6 11 5 6 Q11 6 13 14"
                fill="white"
                style={{ transformOrigin: '13px 14px' }}
                initial={{ scale: 0, rotate: -15, opacity: 0 }}
                animate={{ scale: [0, 1.15, 1], rotate: [-15, 3, 0], opacity: [0, 1, 1] }}
                transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut', times: [0, 0.7, 1] }}
              />

              {/* Right leaf */}
              <motion.path
                d="M13 10 Q19 7 20 3 Q14 3 13 10"
                fill="rgba(255,255,255,0.55)"
                style={{ transformOrigin: '13px 10px' }}
                initial={{ scale: 0, rotate: 15, opacity: 0 }}
                animate={{ scale: [0, 1.15, 1], rotate: [15, -3, 0], opacity: [0, 1, 1] }}
                transition={{ delay: 0.95, duration: 0.5, ease: 'easeOut', times: [0, 0.7, 1] }}
              />
            </svg>
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
              style={{ fontSize: 26, fontWeight: 500, color: 'white', letterSpacing: -0.3 }}
            >
              Teggo
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6, ease: 'easeOut' }}
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}
            >
              Твой ритм, твой рост
            </motion.p>
          </div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.3 }}
            style={{ display: 'flex', gap: 5 }}
          >
            <PulseDot delay={0} />
            <PulseDot delay={0.2} />
            <PulseDot delay={0.4} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
