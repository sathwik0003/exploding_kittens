import React from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import { Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/home/:username" element={<Home/>} />
      </Routes>
    </>
  )
}

export default App