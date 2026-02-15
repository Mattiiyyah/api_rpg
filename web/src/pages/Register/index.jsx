import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import MagicMouse from '../../components/MagicMouse';
import '../Login/Login.css';

export default function Register() {
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const iconStyle = {
        animation: 'float 3s ease-in-out infinite',
    };

    const lidandoComEnvio = async (e) => {
        e.preventDefault();

        if (nome.length < 1 || email.length < 1 || password.length < 1) {
            toast.warn('⚠️ Preencha todos os campos, aventureiro!');
            return;
        }

        if (password.length < 6) {
            toast.warn('⚠️ A senha deve ter no mínimo 6 caracteres!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/users/register', {
                nome,
                email,
                password,
            });

            toast.success(response.data.msg);

            navigate('/verify', {
                state: { email: response.data.email }
            });

        } catch (err) {
            setIsLoading(false);
            const errors = err.response?.data?.errors || [];

            if (errors.length > 0) {
                errors.map(error => toast.error(error));
            } else {
                toast.error('Erro desconhecido ao criar reino.');
            }
        }
    };
    return (
        <div className="login-container">
            <MagicMouse />
            <div className="grid-overlay"></div>

            {/* Botão Voltar */}
            <button className="btn-back-landing" onClick={() => navigate('/')}>
                ← Voltar
            </button>

            <div className="runes-container">
                <div className="rune text-rune" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>New Hero</div>
                <div className="rune text-rune" style={{ top: '60%', left: '5%', animationDelay: '2s' }}>Creating...</div>
                <div className="rune text-rune" style={{ top: '20%', right: '15%', animationDelay: '4s' }}>Forge Soul</div>
                <div className="rune text-rune" style={{ top: '80%', right: '10%', animationDelay: '1s' }}>Roll Stats</div>
                <div className="rune text-rune" style={{ top: '40%', left: '85%', animationDelay: '3s' }}>New Quest</div>
                <div className="rune text-rune" style={{ top: '10%', left: '50%', animationDelay: '5s' }}>Choose Class</div>
                <div className="rune text-rune" style={{ top: '90%', left: '30%', animationDelay: '0.5s' }}>Born King</div>
                <div className="rune text-rune" style={{ top: '30%', left: '25%', animationDelay: '2.5s' }}>Init Character</div>
                <div className="rune text-rune" style={{ top: '70%', right: '35%', animationDelay: '4.5s' }}>Realm Ready</div>
                <div className="rune text-rune" style={{ top: '50%', right: '5%', animationDelay: '1.5s' }}>Crown Await</div>
                <div className="rune text-rune" style={{ top: '5%', right: '25%', animationDelay: '3.5s' }}>Spawning...</div>
                <div className="rune text-rune" style={{ top: '85%', left: '60%', animationDelay: '2.2s' }}>First Steps</div>
            </div>

            <div className="login-welcome-tooltip">
                <span className="tooltip-icon">👑</span>
                <span>Cadastre-se para se tornar um Rei</span>
            </div>

            <div className="login-card">
                <div className="login-icon" style={iconStyle}>🏰</div>
                <h1 className="login-title">SudoGestor</h1>
                <p className="login-subtitle">Forje sua conta de Rei e comande aventureiros</p>

                <div style={{
                    background: 'rgba(130, 87, 229, 0.1)',
                    border: '1px solid rgba(130, 87, 229, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#a8a8b3', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                        ⚠️ Este cadastro é <strong style={{ color: '#8257e5' }}>exclusivo para Reis</strong>.
                        Mestres e Aventureiros são cadastrados pelo Rei dentro do sistema.
                    </p>
                </div>

                <form onSubmit={lidandoComEnvio} className="login-form">
                    <input
                        type="text"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Seu nome de Rei"
                        className="input-field"
                        required
                    />

                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Seu e-mail real"
                        className="input-field"
                        required
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Sua senha secreta"
                        className="input-field"
                        required
                    />

                    <button type="submit" className="button-login" disabled={isLoading} style={{ background: 'linear-gradient(135deg, #04d361 0%, #02a34d 100%)' }}>
                        {isLoading ? 'Criando...' : 'sudo create --king'}
                    </button>

                    <p style={{ marginTop: '20px', color: '#7c7c8a', fontSize: '0.9rem', textAlign: 'center' }}>
                        Já é um Rei?{' '}
                        <span
                            onClick={() => navigate('/login')}
                            style={{ color: '#8257e5', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Faça login
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}