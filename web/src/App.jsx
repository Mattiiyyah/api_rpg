import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//importe das páginas
import Login from './pages/Login';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Guilda from './pages/Guilda';
import Artefato from './pages/Artefato';
import Skill from './pages/Skill';
import User from './pages/User';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app-layout">
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/guilda" element={<Guilda />} />
          <Route path="/artefatos" element={<Artefato />} />
          <Route path="/skills" element={<Skill />} />
          <Route path="/users/:id" element={<User />} />
        </Routes>
      </main>

      <Footer />

      <ToastContainer autoClose={3000} theme="dark" style={{ zIndex: 99999 }} />
    </div>
  );
}

export default App;