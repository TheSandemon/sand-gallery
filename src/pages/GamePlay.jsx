import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Target, Clock, Star } from 'lucide-react'

// Simple Neural Maze game - a click/tap based reaction game
export default function GamePlay() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [gameState, setGameState] = useState('idle') // idle, playing, finished
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 })
  const [highScore, setHighScore] = useState(0)
  const [clicks, setClicks] = useState(0)
  const [misses, setMisses] = useState(0)

  const gameTitle = gameId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Neural Maze'

  useEffect(() => {
    // Load high score from localStorage
    const saved = localStorage.getItem(`sand-gallery-game-${gameId}-highscore`)
    if (saved) setHighScore(parseInt(saved))
  }, [gameId])

  useEffect(() => {
    let interval
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
        // Move target randomly
        setTargetPosition({
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20
        })
      }, 1000)
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished')
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem(`sand-gallery-game-${gameId}-highscore`, score.toString())
      }
    }
    return () => clearInterval(interval)
  }, [gameState, timeLeft, score, highScore, gameId])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(30)
    setClicks(0)
    setMisses(0)
    setTargetPosition({ x: 50, y: 50 })
  }

  const handleTargetClick = (e) => {
    e.stopPropagation()
    if (gameState !== 'playing') return
    setScore(s => s + 10)
    setClicks(c => c + 1)
    // Move immediately after click
    setTargetPosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20
    })
  }

  const handleMiss = () => {
    if (gameState !== 'playing') return
    setMisses(m => m + 1)
    setScore(s => Math.max(0, s - 5))
  }

  const resetGame = () => {
    setGameState('idle')
    setScore(0)
    setTimeLeft(30)
    setClicks(0)
    setMisses(0)
  }

  const accuracy = clicks > 0 ? Math.round((clicks / (clicks + misses)) * 100) : 0

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
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-center mb-6"
        >
          {gameTitle}
        </motion.h1>

        {/* Game Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{score}</div>
            <div className="text-xs text-zinc-500">SCORE</div>
          </div>
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
        </div>

        {/* Game Area */}
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="relative bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden aspect-video cursor-crosshair"
          onClick={handleMiss}
        >
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Target size={64} className="text-zinc-600 mb-4" />
              <p className="text-zinc-400 mb-6">Click the targets as fast as you can!</p>
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
              className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/50 hover:scale-110 transition-transform cursor-pointer"
            >
              <Zap className="text-white" size={24} />
            </motion.button>
          )}

          {gameState === 'finished' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-amber-400 mb-2">{score}</div>
              <div className="text-zinc-400 mb-6">Final Score</div>
              {score >= highScore && score > 0 && (
                <div className="text-green-400 mb-4 flex items-center gap-2">
                  <Star className="fill-green-400" size={20} />
                  New High Score!
                </div>
              )}
              <div className="flex gap-4 mb-6 text-sm text-zinc-500">
                <span>Clicks: {clicks}</span>
                <span>Misses: {misses}</span>
                <span>Accuracy: {accuracy}%</span>
              </div>
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
          )}
        </motion.div>

        {/* Instructions */}
        <div className="mt-6 text-center text-zinc-500 text-sm">
          {gameState === 'playing' 
            ? 'Click the glowing target before time runs out!' 
            : 'Hit the targets to score points. Misses cost 5 points each.'}
        </div>
      </div>
    </div>
  )
}
