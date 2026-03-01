import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Works from './pages/Works'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import Editor from './pages/Editor'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Kaito from './pages/Kaito'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/services" element={<Services />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/kaito" element={<Kaito />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
