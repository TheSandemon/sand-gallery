import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { 
  Play, Pause, RotateCcw, Trophy, Star, Lock
} from 'lucide-react'

// Game constants
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PLAYER_SIZE = 30
const PLAYER_SPEED = 5
const OBSTACLE_SPEED = 3
const ORB_SPEED = 2

// Sound effects using Web Audio API
class SoundManager {
  constructor() {
    this.ctx = null
    this.enabled = true
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  playTone(freq, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
    gain.gain.setValueAtTime(volume, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + duration)
  }

  playThrust() {
    this.playTone(150, 0.1, 'sawtooth', 0.1)
  }

  playCollect() {
    this.playTone(880, 0.1, 'sine', 0.2)
    setTimeout(() => this.playTone(1100, 0.1, 'sine', 0.15), 50)
  }

  playCrash() {
    this.playTone(100, 0.3, 'square', 0.3)
    this.playTone(50, 0.4, 'sawtooth', 0.2)
  }

  playPowerUp() {
    this.playTone(440, 0.1, 'sine', 0.2)
    setTimeout(() => this.playTone(550, 0.1, 'sine', 0.2), 100)
    setTimeout(() => this.playTone(660, 0.15, 'sine', 0.2), 200)
  }

  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }
}

const soundManager = new SoundManager()

// Star particle
function createStar() {
  return {
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.5 + 0.2,
    brightness: Math.random() * 0.5 + 0.5
  }
}

// Obstacle (asteroid)
function createObstacle(x) {
  const size = Math.random() * 40 + 20
  return {
    x,
    y: -size,
    size,
    speed: OBSTACLE_SPEED + Math.random() * 2,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.05
  }
}

// Collectible orb
function createOrb(x) {
  return {
    x,
    y: -20,
    size: 12,
    speed: ORB_SPEED + Math.random(),
    color: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'][Math.floor(Math.random() * 4)],
    pulse: 0
  }
}

// Power-up
function createPowerUp(x) {
  return {
    x,
    y: -30,
    size: 20,
    speed: ORB_SPEED,
    type: ['shield', 'slow', 'double'][Math.floor(Math.random() * 3)],
    rotation: 0
  }
}

export default function CosmicDrift() {
  const { user } = useAuth()
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  
  const gameRef = useRef({
    player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80, vx: 0 },
    obstacles: [],
    orbs: [],
    powerUps: [],
    stars: [],
    keys: { left: false, right: false, up: false },
    frame: 0,
    score: 0,
    lives: 3,
    shield: false,
    shieldTime: 0,
    slowTime: 0,
    doubleTime: 0,
    particles: []
  })
  
  const animationRef = useRef(null)

  // Initialize stars
  useEffect(() => {
    const stars = []
    for (let i = 0; i < 100; i++) {
      stars.push(createStar())
    }
    gameRef.current.stars = stars
  }, [])

  // Load high score
  useEffect(() => {
    async function loadHighScore() {
      if (user) {
        const docRef = doc(db, 'users', user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists() && snap.data().gameScores?.cosmicDrift) {
          setHighScore(snap.data().gameScores.cosmicDrift)
        }
      } else {
        const saved = localStorage.getItem('cosmicDriftHighScore')
        if (saved) setHighScore(parseInt(saved))
      }
    }
    loadHighScore()
  }, [user])

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameRef.current.keys.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') gameRef.current.keys.right = true
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        gameRef.current.keys.up = true
        soundManager.playThrust()
      }
      if (e.key === 'Escape') {
        setGameState(prev => prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev)
      }
    }
    
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameRef.current.keys.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') gameRef.current.keys.right = false
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') gameRef.current.keys.up = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Save score
  const saveScore = useCallback(async (finalScore) => {
    if (finalScore > highScore) {
      setHighScore(finalScore)
      if (user) {
        const docRef = doc(db, 'users', user.uid)
        await setDoc(docRef, { 
          gameScores: { cosmicDrift: finalScore }
        }, { merge: true })
      } else {
        localStorage.setItem('cosmicDriftHighScore', finalScore.toString())
      }
    }
  }, [user, highScore])

  // Create explosion particles
  function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
      gameRef.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        color,
        size: Math.random() * 4 + 2
      })
    }
  }

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const game = gameRef.current

    // Clear canvas
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw starfield
    game.stars.forEach(star => {
      star.y += star.speed
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0
        star.x = Math.random() * CANVAS_WIDTH
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    })

    if (gameState !== 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }

    game.frame++

    // Difficulty scaling
    const difficulty = 1 + game.frame / 3000

    // Player movement
    if (game.keys.left && game.player.x > PLAYER_SIZE) {
      game.player.x -= PLAYER_SPEED
    }
    if (game.keys.right && game.player.x < CANVAS_WIDTH - PLAYER_SIZE) {
      game.player.x += PLAYER_SPEED
    }

    // Thrust effect
    if (game.keys.up) {
      game.particles.push({
        x: game.player.x + (Math.random() - 0.5) * 10,
        y: game.player.y + PLAYER_SIZE,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        life: 0.5,
        color: '#ff6600',
        size: Math.random() * 3 + 1
      })
    }

    // Spawn obstacles
    const spawnRate = Math.max(20, Math.floor(60 / difficulty))
    if (game.frame % spawnRate === 0) {
      game.obstacles.push(createObstacle(Math.random() * (CANVAS_WIDTH - 60) + 30))
    }

    // Spawn orbs
    if (game.frame % 90 === 0) {
      game.orbs.push(createOrb(Math.random() * (CANVAS_WIDTH - 30) + 15))
    }

    // Spawn power-ups
    if (game.frame % 600 === 0) {
      game.powerUps.push(createPowerUp(Math.random() * (CANVAS_WIDTH - 40) + 20))
    }

    // Update obstacles
    game.obstacles = game.obstacles.filter(obs => {
      obs.y += obs.speed * (game.slowTime > 0 ? 0.5 : 1)
      obs.rotation += obs.rotationSpeed

      const dx = game.player.x - obs.x
      const dy = game.player.y - obs.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < obs.size / 2 + PLAYER_SIZE / 2) {
        if (game.shield) {
          createExplosion(obs.x, obs.y, '#00ffff')
          soundManager.playPowerUp()
          return false
        }
        game.lives--
        createExplosion(game.player.x, game.player.y, '#ff0000')
        soundManager.playCrash()
        game.obstacles = []
        game.orbs = []
        if (game.lives <= 0) {
          setScore(game.score)
          saveScore(game.score)
          setGameState('gameOver')
          return false
        }
      }

      return obs.y < CANVAS_HEIGHT + obs.size
    })

    // Update orbs
    game.orbs = game.orbs.filter(orb => {
      orb.y += orb.speed
      orb.pulse += 0.1

      const dx = game.player.x - orb.x
      const dy = game.player.y - orb.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < orb.size + PLAYER_SIZE / 2) {
        game.score += 10 * (game.doubleTime > 0 ? 2 : 1)
        setScore(game.score)
        createExplosion(orb.x, orb.y, orb.color)
        soundManager.playCollect()
        return false
      }

      return orb.y < CANVAS_HEIGHT + orb.size
    })

    // Update power-ups
    game.powerUps = game.powerUps.filter(pup => {
      pup.y += pup.speed
      pup.rotation += 0.05

      const dx = game.player.x - pup.x
      const dy = game.player.y - pup.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < pup.size + PLAYER_SIZE / 2) {
        soundManager.playPowerUp()
        if (pup.type === 'shield') {
          game.shield = true
          game.shieldTime = 300
        } else if (pup.type === 'slow') {
          game.slowTime = 300
        } else if (pup.type === 'double') {
          game.doubleTime = 300
        }
        createExplosion(pup.x, pup.y, '#ffffff')
        return false
      }

      return pup.y < CANVAS_HEIGHT + pup.size
    })

    // Update power-up timers
    if (game.shieldTime > 0) game.shieldTime--
    else game.shield = false
    if (game.slowTime > 0) game.slowTime--
    if (game.doubleTime > 0) game.doubleTime--

    // Update particles
    game.particles = game.particles.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.02
      return p.life > 0
    })

    // Draw particles
    game.particles.forEach(p => {
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.life
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Draw power-ups
    game.powerUps.forEach(pup => {
      ctx.save()
      ctx.translate(pup.x, pup.y)
      ctx.rotate(pup.rotation)
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pup.size)
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(0.5, pup.type === 'shield' ? '#00ffff' : pup.type === 'slow' ? '#ffff00' : '#ff00ff')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, pup.size, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#ffffff'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const icon = pup.type === 'shield' ? 'S' : pup.type === 'slow' ? 'T' : '2X'
      ctx.fillText(icon, 0, 0)
      
      ctx.restore()
    })

    // Draw orbs
    game.orbs.forEach(orb => {
      const pulseSize = orb.size + Math.sin(orb.pulse) * 3
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulseSize)
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(0.5, orb.color)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(orb.x, orb.y, pulseSize, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw obstacles
    game.obstacles.forEach(obs => {
      ctx.save()
      ctx.translate(obs.x, obs.y)
      ctx.rotate(obs.rotation)
      
      ctx.fillStyle = '#4a4a5a'
      ctx.strokeStyle = '#6a6a7a'
      ctx.lineWidth = 2
      ctx.beginPath()
      const points = 8
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2
        const r = obs.size / 2 * (0.8 + Math.sin(i * 3) * 0.2)
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      ctx.fillStyle = '#3a3a4a'
      ctx.beginPath()
      ctx.arc(obs.size * 0.2, -obs.size * 0.1, obs.size * 0.2, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })

    // Draw player
    ctx.save()
    ctx.translate(game.player.x, game.player.y)
    
    if (game.shield) {
      const shieldGradient = ctx.createRadialGradient(0, 0, PLAYER_SIZE * 0.5, 0, 0, PLAYER_SIZE * 1.5)
      shieldGradient.addColorStop(0, 'transparent')
      shieldGradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.3)')
      shieldGradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)')
      ctx.fillStyle = shieldGradient
      ctx.beginPath()
      ctx.arc(0, 0, PLAYER_SIZE * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.fillStyle = '#1a1a2e'
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, -PLAYER_SIZE / 2)
    ctx.lineTo(-PLAYER_SIZE / 2, PLAYER_SIZE / 2)
    ctx.lineTo(0, PLAYER_SIZE / 3)
    ctx.lineTo(PLAYER_SIZE / 2, PLAYER_SIZE / 2)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    ctx.fillStyle = '#00ffff'
    ctx.beginPath()
    ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    
    if (game.keys.up) {
      const engineGradient = ctx.createRadialGradient(0, PLAYER_SIZE / 2, 0, 0, PLAYER_SIZE / 2, 20)
      engineGradient.addColorStop(0, '#ffffff')
      engineGradient.addColorStop(0.3, '#ff6600')
      engineGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = engineGradient
      ctx.beginPath()
      ctx.arc(0, PLAYER_SIZE / 2, 20, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()

    // Draw HUD
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('SCORE: ' + game.score, 20, 30)
    ctx.fillText('LIVES: ' + '!'.repeat(game.lives), 20, 55)
    
    ctx.textAlign = 'right'
    ctx.fillText('HIGH: ' + highScore, CANVAS_WIDTH - 20, 30)

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, highScore, saveScore])

  // Start game
  const startGame = useCallback(() => {
    soundManager.init()
    if (!soundEnabled) {
      soundManager.enabled = false
    }
    
    gameRef.current = {
      player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80, vx: 0 },
      obstacles: [],
      orbs: [],
      powerUps: [],
      stars: gameRef.current.stars,
      keys: { left: false, right: false, up: false },
      frame: 0,
      score: 0,
      lives: 3,
      shield: false,
      shieldTime: 0,
      slowTime: 0,
      doubleTime: 0,
      particles: []
    }
    setScore(0)
    setGameState('playing')
  }, [soundEnabled])

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev)
  }, [])

  // Handle play click
  const handlePlay = () => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }
    startGame()
  }

  // Cleanup
  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLoop])

  // Toggle sound
  const toggleSound = () => {
    const newState = soundManager.toggle()
    setSoundEnabled(newState)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="text-center mb-4">
          <h1 className="text-4xl font-display font-bold text-[#00ffff] mb-2" style={{ textShadow: '0 0 20px #00ffff' }}>
            COSMIC DRIFT
          </h1>
          <p className="text-zinc-400">Navigate the asteroid field. Collect energy orbs. Survive.</p>
        </div>

        <div className="relative rounded-xl overflow-hidden border-2 border-[#00ffff] shadow-[0_0_30px_rgba(0,255,255,0.3)]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="bg-[#0a0a0f] block max-w-full h-auto"
            style={{ maxWidth: '100%' }}
          />

          <AnimatePresence>
            {gameState === 'menu' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
              >
                <div className="text-center space-y-6">
                  {highScore > 0 && (
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                      <Trophy size={24} />
                      <span className="text-xl font-bold">Best: {highScore}</span>
                    </div>
                  )}

                  <div className="text-zinc-400 text-sm space-y-2">
                    <p>Arrow Keys or WASD to move</p>
                    <p>SPACE or W for thrust</p>
                    <p>ESC to pause</p>
                  </div>

                  <button
                    onClick={handlePlay}
                    className="px-8 py-4 bg-[#00ffff] text-black font-bold text-xl rounded-full hover:bg-[#00cccc] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] flex items-center gap-2 mx-auto"
                  >
                    <Play size={24} fill="black" />
                    {user ? 'PLAY' : 'LOGIN TO PLAY'}
                  </button>

                  {!user && (
                    <p className="text-zinc-500 text-sm">Login to save your high score!</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {gameState === 'paused' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">PAUSED</h2>
                  <button
                    onClick={togglePause}
                    className="px-6 py-3 bg-[#00ffff] text-black font-bold rounded-full hover:bg-[#00cccc] transition-all"
                  >
                    Resume
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {gameState === 'gameOver' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold text-red-500" style={{ textShadow: '0 0 20px red' }}>
                    GAME OVER
                  </h2>
                  
                  <div className="text-2xl text-white">
                    Score: <span className="text-[#00ffff] font-bold">{score}</span>
                  </div>
                  
                  {score >= highScore && score > 0 && (
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                      <Star size={24} fill="amber" />
                      <span className="text-xl font-bold">NEW HIGH SCORE!</span>
                    </div>
                  )}

                  <div className="flex gap-4 justify-center mt-6">
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-[#00ffff] text-black font-bold rounded-full hover:bg-[#00cccc] transition-all flex items-center gap-2"
                    >
                      <RotateCcw size={20} />
                      Play Again
                    </button>
                    <button
                      onClick={() => setGameState('menu')}
                      className="px-6 py-3 bg-zinc-700 text-white font-bold rounded-full hover:bg-zinc-600 transition-all"
                    >
                      Menu
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleSound}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            {soundEnabled ? (
              <span className="text-[#00ffff]">SFX</span>
            ) : (
              <span className="text-zinc-500">MUTED</span>
            )}
          </button>

          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <Pause size={20} className="text-white" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showLoginPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 flex items-center justify-center z-50"
              onClick={() => setShowLoginPrompt(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-zinc-900 p-8 rounded-2xl border border-zinc-700 max-w-md text-center"
                onClick={e => e.stopPropagation()}
              >
                <Lock size={48} className="mx-auto text-[#00ffff] mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Login Required</h3>
                <p className="text-zinc-400 mb-6">
                  Sign in to save your high score and compete on the leaderboard!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="w-full px-6 py-3 bg-[#00ffff] text-black font-bold rounded-full hover:bg-[#00cccc] transition-all"
                  >
                    Sign in with Google
                  </button>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="w-full px-6 py-3 bg-zinc-800 text-white font-bold rounded-full hover:bg-zinc-700 transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-6 text-center text-zinc-500 text-sm max-w-md">
        <p className="mb-2">Shield / Slow Motion / Double Points power-ups</p>
        <p>Collect colored orbs for points. Avoid asteroids!</p>
      </div>
    </div>
  )
}
