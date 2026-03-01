import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Target, Clock, Star, Grid, Music, Puzzle, Brain, Hash, TrendingUp, TrendingDown, Shield, Sword, Gem, Sparkles, Timer, ArrowUp, ArrowDown, Moon, Sun, Infinity } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

// Game configurations
const GAMES = {
  'neural-maze': {
    name: 'Neural Maze',
    description: 'Click the targets as fast as you can!',
    icon: Target,
    color: 'from-amber-400 to-amber-600',
    type: 'reaction'
  },
  'crypto-runner': {
    name: 'Crypto Runner',
    description: 'Dodge the bears, catch the bulls! Press LEFT/RIGHT to dodge.',
    icon: Zap,
    color: 'from-green-400 to-emerald-600',
    type: 'runner'
  },
  'quantum-chess': {
    name: 'Quantum Chess',
    description: 'A simplified quantum chess puzzle. Click to place your pieces.',
    icon: Brain,
    color: 'from-purple-400 to-indigo-600',
    type: 'puzzle'
  },
  'beat-synth': {
    name: 'Beat Synth',
    description: 'Hit the notes in rhythm! Press keys or click when notes align.',
    icon: Music,
    color: 'from-pink-400 to-rose-600',
    type: 'rhythm'
  },
  'word-ai': {
    name: 'Word AI',
    description: 'Form words from the letter grid. Longer words = more points!',
    icon: Hash,
    color: 'from-blue-400 to-cyan-600',
    type: 'word'
  },
  'crystal-cavern': {
    name: 'Crystal Cavern',
    description: 'Collect crystals in the dark cave! Move your mouse to guide the orb. Combo for consecutive collects!',
    icon: Gem,
    color: 'from-cyan-400 to-blue-600',
    type: 'cavern'
  },
  'gravity-flip': {
    name: 'Gravity Flip',
    description: 'Tap or press SPACE to flip gravity! Collect stars, avoid red obstacles.',
    icon: ArrowUp,
    color: 'from-violet-400 to-purple-600',
    type: 'gravity'
  }
}

// Get game config from gameId or use defaults
const getGameConfig = (gameId) => {
  const id = gameId?.toLowerCase() || 'neural-maze'
  return GAMES[id] || {
    name: gameId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Game',
    description: 'Click to play!',
    icon: Star,
    color: 'from-amber-400 to-amber-600',
    type: 'reaction'
  }
}

export default function GamePlay() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const config = getGameConfig(gameId)
  const Icon = config.icon
  
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  
  // Neural Maze state
  const [timeLeft, setTimeLeft] = useState(30)
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 })
  const [clicks, setClicks] = useState(0)
  const [misses, setMisses] = useState(0)
  
  // Crypto Runner state
  const [playerX, setPlayerX] = useState(50)
  const [obstacles, setObstacles] = useState([])
  const [direction, setDirection] = useState(0)
  
  // Quantum Chess state
  const [board, setBoard] = useState(Array(9).fill(null))
  const [playerTurn, setPlayerTurn] = useState('X')
  const [winner, setWinner] = useState(null)
  
  // Beat Synth state
  const [notes, setNotes] = useState([])
  const [beatPosition, setBeatPosition] = useState(0)
  
  // Word AI state
  const [grid] = useState(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return Array(16).fill(0).map(() => letters[Math.floor(Math.random() * 26)])
  })
  const [selectedCells, setSelectedCells] = useState([])
  const [foundWords, setFoundWords] = useState([])
  
  // Crystal Cavern state
  const [cavernPlayer, setCavernPlayer] = useState({ x: 50, y: 80 })
  const [crystals, setCrystals] = useState([])
  const [particles, setParticles] = useState([])
  const [combo, setCombo] = useState(0)
  const [cavernTimeLeft, setCavernTimeLeft] = useState(60)
  const [collected, setCollected] = useState(0)
  
  // Gravity Flip state
  const [gravityFlipped, setGravityFlipped] = useState(false)
  const [gravityPlayerY, setGravityPlayerY] = useState(85)
  const [gravityObstacles, setGravityObstacles] = useState([])
  const [stars, setStars] = useState([])
  const [gravityTimeLeft, setGravityTimeLeft] = useState(45)
  const [gravitySpeed, setGravitySpeed] = useState(2)
  const [flipEffect, setFlipEffect] = useState(false)
  
  // Audio context for SFX
  const [audioContext, setAudioContext] = useState(null)
  const { user } = useAuth()

  // Load high score from Firebase + localStorage
  useEffect(() => {
    const loadHighScore = async () => {
      // First load from localStorage as fallback
      const localSaved = localStorage.getItem(`sand-gallery-game-${gameId}-highscore`)
      if (localSaved) setHighScore(parseInt(localSaved))
      
      // Then try to load from Firebase if user is logged in
      if (user?.uid) {
        try {
          const gameRef = doc(db, 'users', user.uid, 'gameScores', gameId)
          const gameSnap = await getDoc(gameRef)
          if (gameSnap.exists()) {
            const fbScore = gameSnap.data()?.highScore || 0
            if (fbScore > (parseInt(localSaved) || 0)) {
              setHighScore(fbScore)
              localStorage.setItem(`sand-gallery-game-${gameId}-highscore`, fbScore.toString())
            }
          }
        } catch (err) {
          console.log('Could not load Firebase high score:', err.message)
        }
      }
    }
    loadHighScore()
  }, [gameId, user])

  // Save high score to Firebase + localStorage
  useEffect(() => {
    if (gameState === 'finished' && score > highScore) {
      setHighScore(score)
      localStorage.setItem(`sand-gallery-game-${gameId}-highscore`, score.toString())
      
      // Also save to Firebase if user is logged in
      if (user?.uid) {
        try {
          const gameRef = doc(db, 'users', user.uid, 'gameScores', gameId)
          setDoc(gameRef, {
            highScore: score,
            lastPlayed: new Date(),
            gamesPlayed: increment(1)
          }, { merge: true })
        } catch (err) {
          console.log('Could not save Firebase high score:', err.message)
        }
      }
    }
  }, [gameState, score, highScore, gameId, user])

  // Neural Maze game loop
  useEffect(() => {
    let interval
    if (gameState === 'playing' && config.type === 'reaction' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
        setTargetPosition({
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20
        })
      }, 1000)
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished')
    }
    return () => clearInterval(interval)
  }, [gameState, timeLeft, config.type])

  // Crypto Runner game loop
  useEffect(() => {
    let interval
    if (gameState === 'playing' && config.type === 'runner') {
      interval = setInterval(() => {
        setBeatPosition(p => (p + 2) % 100)
        // Spawn obstacles
        if (Math.random() < 0.3) {
          setObstacles(prev => [...prev.filter(o => o.y < 100), { x: Math.random() * 80 + 10, y: 0 }])
        }
        // Move obstacles
        setObstacles(prev => {
          const newObstacles = prev.map(o => ({ ...o, y: o.y + 4 })).filter(o => o.y < 100)
          // Check collision
          const playerLeft = playerX - 5
          const playerRight = playerX + 5
          for (const obs of newObstacles) {
            if (obs.y > 70 && obs.y < 90 && obs.x > playerLeft && obs.x < playerRight) {
              setGameState('finished')
              return []
            }
          }
          // Score for passing obstacles
          setScore(s => s + newObstacles.filter(o => o.y > 95).length * 10)
          return newObstacles.filter(o => o.y <= 95)
        })
      }, 50)
    }
    return () => clearInterval(interval)
  }, [gameState, config.type, playerX])

  // Beat Synth game loop
  useEffect(() => {
    let interval
    if (gameState === 'playing' && config.type === 'rhythm') {
      interval = setInterval(() => {
        setBeatPosition(p => (p + 1.5) % 100)
        // Spawn notes
        if (Math.random() < 0.15) {
          setNotes(prev => [...prev.filter(n => n.y < 100), { x: Math.random() * 60 + 20, y: 0, hit: false }])
        }
        // Move notes
        setNotes(prev => {
          const newNotes = prev.map(n => ({ ...n, y: n.y + 2 }))
          // Check hits
          newNotes.forEach(n => {
            if (n.y > 80 && n.y < 95 && !n.hit) {
              setScore(s => s + 10)
              n.hit = true
            }
          })
          return newNotes.filter(n => n.y < 100)
        })
      }, 30)
    }
    return () => clearInterval(interval)
  }, [gameState, config.type])

  // Start game
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setClicks(0)
    setMisses(0)
    setTimeLeft(30)
    setTargetPosition({ x: 50, y: 50 })
    setPlayerX(50)
    setObstacles([])
    setNotes([])
    setBoard(Array(9).fill(null))
    setWinner(null)
    setPlayerTurn('X')
    setSelectedCells([])
    // Crystal Cavern init
    setCavernPlayer({ x: 50, y: 80 })
    setCrystals([])
    setParticles([])
    setCombo(0)
    setCavernTimeLeft(60)
    setCollected(0)
    // Gravity Flip init
    setGravityFlipped(false)
    setGravityPlayerY(85)
    setGravityObstacles([])
    setStars([])
    setGravityTimeLeft(45)
    setGravitySpeed(2)
    setFlipEffect(false)
    // Init audio context on user interaction
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      setAudioContext(ctx)
    }
  }

  // Reset
  const resetGame = () => {
    setGameState('idle')
    setScore(0)
    setTimeLeft(30)
    setClicks(0)
    setMisses(0)
    setObstacles([])
    setNotes([])
    setBoard(Array(9).fill(null))
    setWinner(null)
    setSelectedCells([])
    setCavernPlayer({ x: 50, y: 80 })
    setCrystals([])
    setParticles([])
    setCombo(0)
    setCavernTimeLeft(60)
    setCollected(0)
    // Gravity Flip reset
    setGravityFlipped(false)
    setGravityPlayerY(85)
    setGravityObstacles([])
    setStars([])
    setGravityTimeLeft(45)
    setGravitySpeed(2)
    setFlipEffect(false)
  }

  // Neural Maze handlers
  const handleTargetClick = (e) => {
    e.stopPropagation()
    if (gameState !== 'playing' || config.type !== 'reaction') return
    setScore(s => s + 10)
    setClicks(c => c + 1)
    setTargetPosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20
    })
  }

  const handleReactionMiss = () => {
    if (gameState !== 'playing' || config.type !== 'reaction') return
    setMisses(m => m + 1)
    setScore(s => Math.max(0, s - 5))
  }

  // Crypto Runner handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' || config.type !== 'runner') return
      if (e.key === 'ArrowLeft') setPlayerX(p => Math.max(10, p - 10))
      if (e.key === 'ArrowRight') setPlayerX(p => Math.min(90, p + 10))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, config.type])

  // Quantum Chess handlers
  const handleCellClick = (index) => {
    if (gameState !== 'playing' || config.type !== 'puzzle') return
    if (board[index] || winner) return
    
    const newBoard = [...board]
    newBoard[index] = playerTurn
    setBoard(newBoard)
    
    // Check winner
    const lines = [
      [0,1,2], [3,4,5], [6,7,8], // rows
      [0,3,6], [1,4,7], [2,5,8], // cols
      [0,4,8], [2,4,6] // diagonals
    ]
    
    for (const [a, b, c] of lines) {
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinner(playerTurn)
        setScore(s => s + 100)
        return
      }
    }
    
    // Check draw
    if (!newBoard.includes(null)) {
      setWinner('draw')
      return
    }
    
    setPlayerTurn(playerTurn === 'X' ? 'O' : 'X')
  }

  // Beat Synth hit handler
  const handleBeatHit = () => {
    if (gameState !== 'playing' || config.type !== 'rhythm') return
    // Check if any note is in hit zone
    const hitNote = notes.find(n => n.y > 75 && n.y < 95 && !n.hit)
    if (hitNote) {
      setScore(s => s + 20)
      setNotes(prev => prev.map(n => n === hitNote ? { ...n, hit: true } : n))
    }
  }

  // Word AI handlers
  const handleCellSelect = (index) => {
    if (gameState !== 'playing' || config.type !== 'word') return
    if (selectedCells.includes(index)) {
      setSelectedCells(selectedCells.filter(i => i !== index))
    } else if (selectedCells.length < 6) {
      const newSelected = [...selectedCells, index]
      setSelectedCells(newSelected)
      
      // Check if adjacent
      if (selectedCells.length > 0) {
        const last = selectedCells[selectedCells.length - 1]
        const adjacent = [
          [0,1,4], [1,2,5], [3,4,7], [4,5,8], // top/mid/bottom rows
          [0,3,1], [1,4,2], [3,6,4], [4,7,5] // diagonals
        ]
        const isAdjacent = adjacent.some(group => 
          (group[0] === last && group[1] === index) || 
          (group[1] === last && group[0] === index) ||
          (group[1] === last && group[2] === index) ||
          (group[2] === last && group[1] === index)
        )
        if (!isAdjacent && selectedCells.length > 0) {
          setSelectedCells([index])
          return
        }
      }
      
      // Submit word if 3+ letters
      if (newSelected.length >= 3) {
        const word = newSelected.map(i => grid[i]).join('')
        if (!foundWords.includes(word)) {
          setFoundWords([...foundWords, word])
          setScore(s => s + word.length * 10)
        }
        setSelectedCells([])
      }
    }
  }

  // Crystal Cavern game loop
  useEffect(() => {
    let interval
    if (gameState === 'playing' && config.type === 'cavern') {
      // Timer
      interval = setInterval(() => {
        setCavernTimeLeft(t => {
          if (t <= 1) {
            setGameState('finished')
            return 0
          }
          return t - 1
        })
        // Spawn crystals
        if (Math.random() < 0.25) {
          const newCrystal = {
            id: Date.now(),
            x: Math.random() * 70 + 15,
            y: Math.random() * 50 + 10,
            color: ['#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff6600'][Math.floor(Math.random() * 5)],
            pulse: 0
          }
          setCrystals(prev => [...prev.slice(-8), newCrystal])
        }
        // Spawn particles occasionally
        if (Math.random() < 0.1) {
          setParticles(prev => [...prev.slice(-20), {
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.2,
            opacity: Math.random() * 0.5 + 0.3
          }])
        }
        // Move particles
        setParticles(prev => prev.map(p => ({
          ...p,
          y: p.y + p.speed,
          opacity: p.opacity - 0.002
        })).filter(p => p.opacity > 0))
        // Animate crystal pulse
        setCrystals(prev => prev.map(c => ({ ...c, pulse: (c.pulse + 0.1) % (Math.PI * 2) })))
        // Check crystal collection
        setCrystals(prev => {
          const playerRadius = 5
          const crystalRadius = 3
          const collected = prev.filter(c => {
            const dx = c.x - cavernPlayer.x
            const dy = c.y - cavernPlayer.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < playerRadius + crystalRadius
          })
          if (collected.length > 0) {
            const newCombo = combo + collected.length
            setCombo(newCombo)
            const points = collected.length * 10 * Math.min(newCombo, 5)
            setScore(s => s + points)
            setCollected(c => c + collected.length)
            // Play collection sound
            if (audioContext) {
              const osc = audioContext.createOscillator()
              const gain = audioContext.createGain()
              osc.connect(gain)
              gain.connect(audioContext.destination)
              osc.frequency.setValueAtTime(880 + newCombo * 100, audioContext.currentTime)
              osc.type = 'sine'
              gain.gain.setValueAtTime(0.1, audioContext.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
              osc.start()
              osc.stop(audioContext.currentTime + 0.1)
            }
          }
          return prev.filter(c => {
            const dx = c.x - cavernPlayer.x
            const dy = c.y - cavernPlayer.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance >= playerRadius + crystalRadius
          })
        })
        // Reset combo if no collection in 2 seconds (handled by not collecting)
      }, 50)
    }
    return () => clearInterval(interval)
  }, [gameState, config.type, cavernPlayer, combo, audioContext])

  // Gravity Flip game loop
  useEffect(() => {
    let interval
    if (gameState === 'playing' && config.type === 'gravity') {
      interval = setInterval(() => {
        // Timer
        setGravityTimeLeft(t => {
          if (t <= 1) {
            setGameState('finished')
            return 0
          }
          return t - 1
        })
        
        // Increase speed over time
        setGravitySpeed(s => Math.min(5, 2 + (45 - gravityTimeLeft) * 0.05))
        
        // Move player based on gravity
        setGravityPlayerY(y => {
          const targetY = gravityFlipped ? 15 : 85
          // Smooth transition toward target
          const diff = targetY - y
          return y + diff * 0.15
        })
        
        // Spawn obstacles
        if (Math.random() < 0.08) {
          const isTop = Math.random() > 0.5
          setGravityObstacles(prev => [...prev, {
            id: Date.now(),
            x: 105,
            y: isTop ? 5 : 75,
            width: Math.random() * 15 + 10,
            height: 20
          }])
        }
        
        // Spawn stars
        if (Math.random() < 0.1) {
          const starY = Math.random() > 0.5 ? 20 + Math.random() * 60 : 20 + Math.random() * 60
          setStars(prev => [...prev, {
            id: Date.now(),
            x: 105,
            y: starY,
            rotation: 0
          }])
        }
        
        // Move obstacles
        setGravityObstacles(prev => {
          const newObstacles = prev.map(o => ({ ...o, x: o.x - gravitySpeed })).filter(o => o.x > -20)
          
          // Check collision with player
          const playerY = gravityPlayerY
          const playerX = 15
          for (const obs of newObstacles) {
            if (obs.x < playerX + 5 && obs.x + obs.width > playerX - 5 &&
                Math.abs(obs.y - playerY) < 15) {
              // Collision! Play crash sound
              if (audioContext) {
                const osc = audioContext.createOscillator()
                const gain = audioContext.createGain()
                osc.connect(gain)
                gain.connect(audioContext.destination)
                osc.frequency.setValueAtTime(150, audioContext.currentTime)
                osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3)
                osc.type = 'sawtooth'
                gain.gain.setValueAtTime(0.2, audioContext.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
                osc.start()
                osc.stop(audioContext.currentTime + 0.3)
              }
              setGameState('finished')
              return []
            }
          }
          return newObstacles
        })
        
        // Move stars
        setStars(prev => {
          const newStars = prev.map(s => ({ ...s, x: s.x - gravitySpeed, rotation: s.rotation + 5 })).filter(s => s.x > -10)
          
          // Check star collection
          const playerY = gravityPlayerY
          const playerX = 15
          const collected = newStars.filter(s => 
            s.x < playerX + 8 && s.x > playerX - 8 &&
            Math.abs(s.y - playerY) < 12
          )
          
          if (collected.length > 0) {
            setScore(s => s + collected.length * 25)
            // Play star sound
            if (audioContext) {
              const osc = audioContext.createOscillator()
              const gain = audioContext.createGain()
              osc.connect(gain)
              gain.connect(audioContext.destination)
              osc.frequency.setValueAtTime(880, audioContext.currentTime)
              osc.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1)
              osc.type = 'sine'
              gain.gain.setValueAtTime(0.15, audioContext.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
              osc.start()
              osc.stop(audioContext.currentTime + 0.15)
            }
          }
          return newStars.filter(s => !collected.includes(s))
        })
      }, 30)
    }
    return () => clearInterval(interval)
  }, [gameState, config.type, gravityFlipped, gravityPlayerY, gravitySpeed, gravityTimeLeft, audioContext])

  // Gravity Flip input handler
  useEffect(() => {
    const handleGravityFlip = (e) => {
      if (gameState !== 'playing' || config.type !== 'gravity') return
      if (e.type === 'click' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        setGravityFlipped(f => !f)
        setFlipEffect(true)
        setTimeout(() => setFlipEffect(false), 300)
        // Play flip sound
        if (audioContext) {
          const osc = audioContext.createOscillator()
          const gain = audioContext.createGain()
          osc.connect(gain)
          gain.connect(audioContext.destination)
          osc.frequency.setValueAtTime(440, audioContext.currentTime)
          osc.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.08)
          osc.type = 'sine'
          gain.gain.setValueAtTime(0.1, audioContext.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          osc.start()
          osc.stop(audioContext.currentTime + 0.1)
        }
      }
    }
    window.addEventListener('keydown', handleGravityFlip)
    return () => window.removeEventListener('keydown', handleGravityFlip)
  }, [gameState, config.type, audioContext])

  // Mouse movement handler for Crystal Cavern
  useEffect(() => {
    if (config.type !== 'cavern') return
    const handleMouseMove = (e) => {
      if (gameState !== 'playing') return
      const gameArea = e.currentTarget
      if (!gameArea) return
      const rect = gameArea.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setCavernPlayer({ x: Math.max(5, Math.min(95, x)), y: Math.max(10, Math.min(95, y)) })
    }
    const gameArea = document.querySelector('[data-game-area]')
    if (gameArea) {
      gameArea.addEventListener('mousemove', handleMouseMove)
      return () => gameArea.removeEventListener('mousemove', handleMouseMove)
    }
  }, [gameState, config.type])

  // Combo decay
  useEffect(() => {
    if (config.type !== 'cavern') return
    const interval = setInterval(() => {
      setCombo(c => Math.max(0, c - 1))
    }, 2000)
    return () => clearInterval(interval)
  }, [config.type])

  const accuracy = clicks > 0 ? Math.round((clicks / (clicks + misses)) * 100) : 0

  // Render based on game type
  const renderGameArea = () => {
    switch (config.type) {
      case 'reaction':
        return (
          <>
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Target size={64} className="text-zinc-600 mb-4" />
                <p className="text-zinc-400 mb-6">{config.description}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); startGame(); }}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-full font-medium transition-colors"
                >
                  <Play size={20} />
                  Start Game
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  left: `${targetPosition.x}%`,
                  top: `${targetPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={handleTargetClick}
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer`}
              >
                <Zap className="text-white" size={24} />
              </motion.button>
            )}
          </>
        )
        
      case 'runner':
        return (
          <>
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Zap size={64} className="text-green-500 mb-4" />
                <p className="text-zinc-400 mb-6">{config.description}</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-full font-medium transition-colors"
                >
                  <Play size={20} />
                  Start Running
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <>
                {/* Player */}
                <div 
                  style={{ left: `${playerX}%`, top: '80%' }}
                  className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2"
                >
                  <Shield className="w-full h-full text-green-400" />
                </div>
                {/* Obstacles */}
                {obstacles.map((obs, i) => (
                  <div
                    key={i}
                    style={{ left: `${obs.x}%`, top: `${obs.y}%` }}
                    className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2"
                  >
                    <TrendingDown className="w-full h-full text-red-500" />
                  </div>
                ))}
                {/* Bull (positive) */}
                <div className="absolute top-4 right-4 text-green-400 text-xs">🐂 = +10</div>
                <div className="absolute top-4 left-4 text-red-400 text-xs">🐻 = Game Over</div>
              </>
            )}
          </>
        )
        
      case 'puzzle':
        return (
          <>
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Brain size={64} className="text-purple-500 mb-4" />
                <p className="text-zinc-400 mb-6">{config.description}</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-full font-medium transition-colors"
                >
                  <Play size={20} />
                  Start Game
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-2">
                  {board.map((cell, i) => (
                    <button
                      key={i}
                      onClick={() => handleCellClick(i)}
                      disabled={!!cell || !!winner}
                      className={`w-16 h-16 rounded-lg text-2xl font-bold flex items-center justify-center transition-all ${
                        cell === 'X' ? 'bg-purple-600 text-white' :
                        cell === 'O' ? 'bg-indigo-600 text-white' :
                        'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    >
                      {cell}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )
        
      case 'rhythm':
        return (
          <>
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Music size={64} className="text-pink-500 mb-4" />
                <p className="text-zinc-400 mb-6">{config.description}</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 rounded-full font-medium transition-colors"
                >
                  <Play size={20} />
                  Start Beat
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <>
                {/* Hit zone */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-4 bg-zinc-700 rounded-full">
                  <div className="absolute inset-0 bg-pink-500/30 rounded-full animate-pulse" />
                </div>
                {/* Notes */}
                {notes.map((note, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0 }}
                    animate={{ y: `${note.y}%` }}
                    style={{ left: `${note.x}%` }}
                    className={`absolute w-8 h-8 rounded-full ${note.hit ? 'bg-green-500' : `bg-gradient-to-br ${config.color}`} flex items-center justify-center`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white/50" />
                  </motion.div>
                ))}
                <button
                  onClick={handleBeatHit}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-8 py-2 bg-pink-600 rounded-full text-sm font-medium"
                >
                  HIT (Space)
                </button>
              </>
            )}
          </>
        )
        
      case 'word':
        return (
          <>
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Hash size={64} className="text-blue-500 mb-4" />
                <p className="text-zinc-400 mb-6">{config.description}</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-colors"
                >
                  <Play size={20} />
                  Start Game
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {grid.map((letter, i) => (
                    <button
                      key={i}
                      onClick={() => handleCellSelect(i)}
                      className={`w-12 h-12 rounded-lg text-xl font-bold flex items-center justify-center transition-all ${
                        selectedCells.includes(i) 
                          ? 'bg-amber-500 text-white scale-110' 
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-2">
                    {selectedCells.map(i => grid[i]).join('')}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Found: {foundWords.join(', ') || 'None yet'}
                  </div>
                </div>
              </div>
            )}
          </>
        )
        
      case 'cavern':
        return (
          <>
            {/* Cave background with particles */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden">
              {/* Animated particles */}
              {particles.map(p => (
                <div
                  key={p.id}
                  className="absolute rounded-full bg-cyan-300"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: p.size,
                    height: p.size,
                    opacity: p.opacity,
                    boxShadow: `0 0 ${p.size * 2}px rgba(0, 255, 255, ${p.opacity})`
                  }}
                />
              ))}
              {/* Cave walls effect */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
            </div>
            
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Gem size={64} className="text-cyan-400 mb-4" />
                </motion.div>
                <p className="text-zinc-400 mb-2 text-center px-4">{config.description}</p>
                <p className="text-zinc-500 text-sm mb-6">Move mouse to collect crystals!</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full font-medium transition-colors"
                >
                  <Play size={20} />
                  Enter Cavern
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <>
                {/* Crystals */}
                {crystals.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ 
                      scale: 1 + Math.sin(c.pulse) * 0.2,
                      rotate: [0, 15, -15, 0]
                    }}
                    transition={{ duration: 0.5 }}
                    style={{
                      position: 'absolute',
                      left: `${c.x}%`,
                      top: `${c.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className="w-8 h-8"
                  >
                    <div 
                      className="w-full h-full rounded-full"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, white, ${c.color})`,
                        boxShadow: `0 0 20px ${c.color}, 0 0 40px ${c.color}`
                      }}
                    />
                  </motion.div>
                ))}
                
                {/* Player orb */}
                <motion.div
                  animate={{ 
                    x: cavernPlayer.x * 4,
                    y: cavernPlayer.y * 4,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 0.1 }}
                  style={{
                    position: 'absolute',
                    left: `${cavernPlayer.x}%`,
                    top: `${cavernPlayer.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="w-12 h-12"
                >
                  <div 
                    className="w-full h-full rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, white, #00ffff, #0066ff)',
                      boxShadow: '0 0 30px #00ffff, 0 0 60px #0066ff, inset 0 0 20px rgba(255,255,255,0.5)'
                    }}
                  />
                  {/* Orbiting particles */}
                  {[0, 1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute w-2 h-2 rounded-full bg-cyan-300"
                      style={{
                        top: '50%',
                        left: '50%',
                        marginTop: -4,
                        marginLeft: -4,
                        transformOrigin: `${Math.cos(i * Math.PI / 2) * 20}px ${Math.sin(i * Math.PI / 2) * 20}px`
                      }}
                    />
                  ))}
                </motion.div>
                
                {/* Combo indicator */}
                {combo > 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                  >
                    <Sparkles size={14} className="text-white" />
                    <span className="text-white font-bold text-sm">x{combo}</span>
                  </motion.div>
                )}
              </>
            )}
          </>
        )
        
      case 'gravity':
        return (
          <>
            {/* Space background */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-purple-950/20 to-zinc-950 overflow-hidden">
              {/* Stars */}
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.3
                  }}
                />
              ))}
              {/* Gravity indicator lines */}
              <div className={`absolute inset-0 transition-transform duration-300 ${flipEffect ? 'scale-y-125' : ''} ${gravityFlipped ? 'bg-gradient-to-t from-purple-500/5 to-transparent' : 'bg-gradient-to-b from-purple-500/5 to-transparent'}`} />
            </div>
            
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowUp size={64} className="text-violet-400 mb-4" />
                </motion.div>
                <p className="text-zinc-400 mb-2 text-center px-4">{config.description}</p>
                <p className="text-zinc-500 text-sm mb-6">Tap, click, or press SPACE to flip gravity!</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-full font-medium transition-colors"
                >
                  <Play size={20} />
                  Enter the Void
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <>
                {/* Top and bottom boundaries */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-violet-500/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-violet-500/30 to-transparent" />
                
                {/* Stars to collect */}
                {stars.map(star => (
                  <motion.div
                    key={star.id}
                    animate={{ 
                      rotate: star.rotation,
                      x: 0
                    }}
                    transition={{ duration: 0 }}
                    style={{
                      position: 'absolute',
                      left: `${star.x}%`,
                      top: `${star.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className="w-8 h-8"
                  >
                    <Star className="w-full h-full text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                  </motion.div>
                ))}
                
                {/* Obstacles */}
                {gravityObstacles.map(obs => (
                  <div
                    key={obs.id}
                    style={{
                      position: 'absolute',
                      left: `${obs.x}%`,
                      top: `${obs.y}%`,
                      width: `${obs.width}%`,
                      height: `${obs.height}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className="bg-gradient-to-b from-red-500 to-red-700 rounded-lg shadow-lg shadow-red-500/50"
                  />
                ))}
                
                {/* Player ship */}
                <motion.div
                  animate={{ 
                    y: gravityPlayerY * 4,
                    rotate: gravityFlipped ? 180 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    position: 'absolute',
                    left: '15%',
                    top: `${gravityPlayerY}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="w-10 h-10"
                >
                  <div 
                    className="w-full h-full rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, white, #8b5cf6, #4c1d95)',
                      boxShadow: '0 0 20px #8b5cf6, 0 0 40px #4c1d95, inset 0 0 15px rgba(255,255,255,0.5)'
                    }}
                  />
                  {/* Engine trail */}
                  <motion.div
                    animate={{ scaleY: [1, 1.5, 1] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3 h-6 bg-gradient-to-t from-violet-500 to-transparent rounded-full blur-sm"
                  />
                </motion.div>
                
                {/* Gravity indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-zinc-900/80 rounded-full">
                  {gravityFlipped ? (
                    <ArrowDown size={14} className="text-violet-400" />
                  ) : (
                    <ArrowUp size={14} className="text-violet-400" />
                  )}
                  <span className="text-xs text-violet-400 font-medium">GRAVITY</span>
                </div>
                
                {/* Speed indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-zinc-900/80 rounded-full">
                  <Zap size={14} className="text-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">x{gravitySpeed.toFixed(1)}</span>
                </div>
                
                {/* Instructions hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-zinc-500 text-xs">
                  TAP / SPACE to flip
                </div>
              </>
            )}
          </>
        )
        
      default:
        return (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
            Game type not implemented
          </div>
        )
    }
  }

  // Render finished state
  const renderFinished = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="text-4xl font-bold text-amber-400 mb-2">{score}</div>
      <div className="text-zinc-400 mb-6">Final Score</div>
      {score >= highScore && score > 0 && (
        <div className="text-green-400 mb-4 flex items-center gap-2">
          <Star className="fill-green-400" size={20} />
          New High Score!
        </div>
      )}
      {config.type === 'puzzle' && winner && (
        <div className="text-purple-400 mb-4">
          {winner === 'draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
        </div>
      )}
      {config.type === 'word' && foundWords.length > 0 && (
        <div className="text-blue-400 mb-4">
          {foundWords.length} words found!
        </div>
      )}
      {config.type === 'cavern' && (
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-cyan-400 font-bold text-lg">{collected}</div>
            <div className="text-xs text-zinc-500">Crystals</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold text-lg">x{combo}</div>
            <div className="text-xs text-zinc-500">Max Combo</div>
          </div>
        </div>
      )}
      <div className="flex gap-4">
        <button 
          onClick={resetGame}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full font-medium transition-colors"
        >
          <RotateCcw size={20} />
          Play Again
        </button>
        <button 
          onClick={() => navigate('/games')}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-full font-medium transition-colors"
        >
          Back to Games
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button 
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Games</span>
          </button>
          <div className="flex items-center gap-2">
            <Star className="text-amber-400 fill-amber-400" size={16} />
            <span className="text-amber-400 font-medium">High Score: {highScore}</span>
          </div>
        </motion.div>

        {/* Game Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.color} bg-opacity-20 mb-3`}>
            <Icon size={20} className="text-white" />
            <span className="text-sm font-medium text-white">{config.name}</span>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{score}</div>
            <div className="text-xs text-zinc-500">SCORE</div>
          </div>
          {config.type === 'reaction' && (
            <>
              <div className="text-center">
                <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-zinc-300'}`}>
                  {timeLeft}s
                </div>
                <div className="text-xs text-zinc-500">TIME</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-300">{accuracy}%</div>
                <div className="text-xs text-zinc-500">ACCURACY</div>
              </div>
            </>
          )}
          {config.type === 'word' && (
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-300">{foundWords.length}</div>
              <div className="text-xs text-zinc-500">WORDS</div>
            </div>
          )}
          {config.type === 'cavern' && (
            <>
              <div className="text-center">
                <div className={`text-2xl font-bold ${cavernTimeLeft <= 10 ? 'text-red-500' : 'text-cyan-400'}`}>
                  {cavernTimeLeft}s
                </div>
                <div className="text-xs text-zinc-500">TIME</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{collected}</div>
                <div className="text-xs text-zinc-500">CRYSTALS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">x{combo}</div>
                <div className="text-xs text-zinc-500">COMBO</div>
              </div>
            </>
          )}
          {config.type === 'gravity' && (
            <>
              <div className="text-center">
                <div className={`text-2xl font-bold ${gravityTimeLeft <= 10 ? 'text-red-500' : 'text-violet-400'}`}>
                  {gravityTimeLeft}s
                </div>
                <div className="text-xs text-zinc-500">TIME</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">x{gravitySpeed.toFixed(1)}</div>
                <div className="text-xs text-zinc-500">SPEED</div>
              </div>
              <div className="text-center">
                {gravityFlipped ? (
                  <ArrowDown size={32} className="text-violet-400 mx-auto" />
                ) : (
                  <ArrowUp size={32} className="text-violet-400 mx-auto" />
                )}
                <div className="text-xs text-zinc-500">GRAVITY</div>
              </div>
            </>
          )}
        </div>

        {/* Game Area */}
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          data-game-area
          className="relative bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden aspect-video cursor-crosshair"
          onClick={(e) => {
            if (config.type === 'reaction') handleReactionMiss()
            if (config.type === 'gravity' && gameState === 'playing') {
              setGravityFlipped(f => !f)
              setFlipEffect(true)
              setTimeout(() => setFlipEffect(false), 300)
              // Play flip sound
              if (audioContext) {
                const osc = audioContext.createOscillator()
                const gain = audioContext.createGain()
                osc.connect(gain)
                gain.connect(audioContext.destination)
                osc.frequency.setValueAtTime(440, audioContext.currentTime)
                osc.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.08)
                osc.type = 'sine'
                gain.gain.setValueAtTime(0.1, audioContext.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
                osc.start()
                osc.stop(audioContext.currentTime + 0.1)
              }
            }
          }}
        >
          <AnimatePresence mode="wait">
            {gameState === 'idle' && renderGameArea()}
            {gameState === 'playing' && renderGameArea()}
            {gameState === 'finished' && renderFinished()}
          </AnimatePresence>
        </motion.div>

        {/* Instructions */}
        <div className="mt-6 text-center text-zinc-500 text-sm">
          {gameState === 'playing' ? config.description : 'Press Start to play!'}
        </div>
      </div>
    </div>
  )
}
