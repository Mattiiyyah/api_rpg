import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import MagicMouse from '../../components/MagicMouse';
import '../Login/Login.css';

export default function PasswordReset() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function lidandoComEnvio(e) {
        e.preventDefault();

        if (!email || !verificationCode || !newPassword) {
            toast.warn('⚠️ Preencha todos os campos!');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.warn('⚠️ As senhas não coincidem!');
            return;
        }

        if (newPassword.length < 6) {
            toast.warn('⚠️ A senha deve ter no mínimo 6 caracteres!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/users/password_reset', {
                email,
                verification_code: verificationCode,
                newPassword,
            });

            toast.success(response.data.msg);
            navigate('/login');

        } catch (err) {
            setIsLoading(false);
            const errors = err.response?.data?.errors || [];

            if (errors.length > 0) {
                errors.map(error => toast.error(error));
            } else {
                toast.error('Erro ao redefinir senha.');
            }
        }
    }

    async function lidandoComReenvio() {
        if (!email) {
            toast.warn('⚠️ Preencha o email para reenviar o código!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/users/password_recovery', {
                email,
            });

            toast.success(response.data.msg);
        } catch (err) {
            const errors = err.response?.data?.errors || [];
            if (errors.length > 0) {
                errors.map(error => toast.error(error));
            } else {
                toast.error('Erro ao reenviar código.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-container">
            <MagicMouse />
            <div className="grid-overlay"></div>

            <button className="btn-back-landing" onClick={() => navigate('/login')}>
                ← Voltar ao Login
            </button>

            <div className="runes-container">
                <div className="rune text-rune" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>New Pass</div>
                <div className="rune text-rune" style={{ top: '60%', left: '5%', animationDelay: '2s' }}>Secure</div>
                <div className="rune text-rune" style={{ top: '20%', right: '15%', animationDelay: '4s' }}>Reset OK</div>
                <div className="rune text-rune" style={{ top: '80%', right: '10%', animationDelay: '1s' }}>Verified</div>
                <div className="rune text-rune" style={{ top: '40%', left: '85%', animationDelay: '3s' }}>Strong</div>
                <div className="rune text-rune" style={{ top: '10%', left: '50%', animationDelay: '5s' }}>Protected</div>
                <div className="rune text-rune" style={{ top: '90%', left: '30%', animationDelay: '0.5s' }}>Changed</div>
                <div className="rune text-rune" style={{ top: '30%', left: '25%', animationDelay: '2.5s' }}>Code OK</div>
                <div className="rune text-rune" style={{ top: '70%', right: '35%', animationDelay: '4.5s' }}>Access</div>
                <div className="rune text-rune" style={{ top: '50%', right: '5%', animationDelay: '1.5s' }}>Unlock</div>
            </div>

            <div className="login-welcome-tooltip">
                <span className="tooltip-icon">🔑</span>
                <span>Digite o código e sua nova senha</span>
            </div>

            <div className="login-card">
                <div className="login-icon">🔐</div>
                <h1 className="login-title">Redefinir Senha</h1>
                <p className="login-subtitle">Insira o código recebido por email e sua nova senha</p>

                <form onSubmit={lidandoComEnvio} className="login-form">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Seu e-mail"
                        className="input-field"
                        required
                    />

                    <input
                        type="text"
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value)}
                        placeholder="Código de verificação (6 dígitos)"
                        className="input-field"
                        maxLength={6}
                        required
                    />

                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Nova senha"
                        className="input-field"
                        required
                    />

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar nova senha"
                        className="input-field"
                        required
                    />

                    <button type="submit" className="button-login" disabled={isLoading} style={{ background: 'linear-gradient(135deg, #04d361 0%, #02a34d 100%)' }}>
                        {isLoading ? 'Redefinindo...' : 'sudo reset --password'}
                    </button>
                </form>

                <p className="register-link" style={{ marginTop: '20px', textAlign: 'center' }}>
                    Não recebeu o código?{' '}
                    <span onClick={lidandoComReenvio} style={{ color: '#8257e5', cursor: 'pointer', fontWeight: 'bold' }}>
                        Reenviar código
                    </span>
                </p>
            </div>
        </div>
    );
}