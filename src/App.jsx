import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Services from './pages/Services'
import Games from './pages/Games'
import GamePlay from './pages/GamePlay'
import Tools from './pages/Tools'
import ToolUse from './pages/ToolUse'
import Editor from './pages/Editor'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Kaito from './pages/Kaito'
import Studio from './pages/Studio'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/services" element={<Services />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:gameId" element={<GamePlay />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/:toolId" element={<ToolUse />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/kaito" element={<Kaito />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
