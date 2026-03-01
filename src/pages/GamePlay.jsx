import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Target, Clock, Star, Grid, Music, Puzzle, Brain, Hash, TrendingUp, TrendingDown, Shield, Sword } from 'lucide-react'

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

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem(`sand-gallery-game-${gameId}-highscore`)
    if (saved) setHighScore(parseInt(saved))
  }, [gameId])

  // Save high score
  useEffect(() => {
    if (gameState === 'finished' && score > highScore) {
      setHighScore(score)
      localStorage.setItem(`sand-gallery-game-${gameId}-highscore`, score.toString())
    }
  }, [gameState, score, highScore, gameId])

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
        </div>

        {/* Game Area */}
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="relative bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden aspect-video cursor-crosshair"
          onClick={config.type === 'reaction' ? handleReactionMiss : undefined}
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
