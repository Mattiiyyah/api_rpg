import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import MagicMouse from '../../components/MagicMouse';
import '../Login/Login.css';

export default function PasswordRecovery() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function lidandoComEnvio(e) {
        e.preventDefault();

        if (email.length < 1) {
            toast.warn('⚠️ Preencha o email corretamente!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/users/password_recovery', {
                email,
            });

            toast.success(response.data.msg);

            navigate('/password_reset', {
                state: { email: response.data.dados.email }
            });

        } catch (err) {
            setIsLoading(false);
            const errors = err.response?.data?.errors || [];

            if (errors.length > 0) {
                errors.map(error => toast.error(error));
            } else {
                toast.error('Erro desconhecido ao enviar email de recuperação.');
            }
        }
    }

    return (
        <div className="login-container">
            <MagicMouse />
            <div className="grid-overlay"></div>

            {/* Botão Voltar */}
            <button className="btn-back-landing" onClick={() => navigate('/login')}>
                ← Voltar ao Login
            </button>

            <div className="runes-container">
                <div className="rune text-rune" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>Reset...</div>
                <div className="rune text-rune" style={{ top: '60%', left: '5%', animationDelay: '2s' }}>Recover</div>
                <div className="rune text-rune" style={{ top: '20%', right: '15%', animationDelay: '4s' }}>New Key</div>
                <div className="rune text-rune" style={{ top: '80%', right: '10%', animationDelay: '1s' }}>Unlock</div>
                <div className="rune text-rune" style={{ top: '40%', left: '85%', animationDelay: '3s' }}>Restore</div>
                <div className="rune text-rune" style={{ top: '10%', left: '50%', animationDelay: '5s' }}>Magic Key</div>
                <div className="rune text-rune" style={{ top: '90%', left: '30%', animationDelay: '0.5s' }}>Rebirth</div>
                <div className="rune text-rune" style={{ top: '30%', left: '25%', animationDelay: '2.5s' }}>Forgot?</div>
                <div className="rune text-rune" style={{ top: '70%', right: '35%', animationDelay: '4.5s' }}>Access</div>
                <div className="rune text-rune" style={{ top: '50%', right: '5%', animationDelay: '1.5s' }}>Login Fix</div>
                <div className="rune text-rune" style={{ top: '5%', right: '25%', animationDelay: '3.5s' }}>Sending...</div>
                <div className="rune text-rune" style={{ top: '85%', left: '60%', animationDelay: '2.2s' }}>Remember</div>
            </div>

            <div className="login-welcome-tooltip">
                <span className="tooltip-icon">🔑</span>
                <span>Esqueceu sua senha? Sem problemas!</span>
            </div>

            <div className="login-card">
                <div className="login-icon">🔐</div>
                <h1 className="login-title">Recuperar Senha</h1>
                <p className="login-subtitle">Informe seu email para receber o código de recuperação</p>

                <form onSubmit={lidandoComEnvio} className="login-form">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Seu e-mail cadastrado"
                        className="input-field"
                        required
                    />

                    <button type="submit" className="button-login" disabled={isLoading} style={{ background: 'linear-gradient(135deg, #8257e5 0%, #6833e4 100%)' }}>
                        {isLoading ? 'Enviando...' : 'sudo recover --password'}
                    </button>
                </form>

                <p className="register-link" style={{ marginTop: '20px', textAlign: 'center' }}>
                    Lembrou a senha? <span onClick={() => navigate('/login')} style={{ color: '#8257e5', cursor: 'pointer', fontWeight: 'bold' }}>Fazer login</span>
                </p>
            </div>
        </div>
    );
}