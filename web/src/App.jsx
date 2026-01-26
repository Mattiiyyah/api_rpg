import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//importe das páginas
import Login from './pages/Login';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Guilda from './pages/Guilda';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/guilda" element={<Guilda />} />
      </Routes>

      <ToastContainer autoClose={3000} theme="dark" />
    </>
  );
}

export default App;