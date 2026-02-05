import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import MagicMouse from '../../components/MagicMouse';
import '../Login/Login.css';

export default function Verify() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState('');

    const iconStyle = {
        animation: 'float 3s ease-in-out infinite',
    };

    const lidandoComEnvio = async (e) => {
        e.preventDefault();

        if (email.length < 1 || code.length < 1) {
            toast.warn('⚠️ Preencha todos os campos, aventureiro!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/users/verify', {
                email: email,
                verification_code: code,
            });

            toast.success(response.data.msg);
            navigate('/login');

        } catch (err) {
            setIsLoading(false);
            const errors = err.response?.data?.errors || [];

            if (errors.length > 0) {
                errors.map(error => toast.error(error));
            } else {
                toast.error('Erro desconhecido ao verificar conta.');
            }
        }
    };

    const lidandoComReenvio = async () => {
        if (email.length < 1) {
            toast.warn('⚠️ Informe seu e-mail para reenviar o código.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/users/resend_code', {
                email: email,
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
    };

    return (
        <div className="login-container">
            <MagicMouse />
            <div className="grid-overlay"></div>

            {/* Botão Voltar */}
            <button className="btn-back-landing" onClick={() => navigate('/login')}>
                ← Voltar
            </button>

            <div className="runes-container">
                <div className="rune text-rune" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>Verifying...</div>
                <div className="rune text-rune" style={{ top: '60%', left: '5%', animationDelay: '2s' }}>Magic Code</div>
                <div className="rune text-rune" style={{ top: '20%', right: '15%', animationDelay: '4s' }}>Seal Check</div>
                <div className="rune text-rune" style={{ top: '80%', right: '10%', animationDelay: '1s' }}>Auth Token</div>
                <div className="rune text-rune" style={{ top: '40%', left: '85%', animationDelay: '3s' }}>Unlock Gate</div>
                <div className="rune text-rune" style={{ top: '10%', left: '50%', animationDelay: '5s' }}>Decrypting</div>
                <div className="rune text-rune" style={{ top: '90%', left: '30%', animationDelay: '0.5s' }}>Crown Valid</div>
                <div className="rune text-rune" style={{ top: '30%', left: '25%', animationDelay: '2.5s' }}>Email Sent</div>
                <div className="rune text-rune" style={{ top: '70%', right: '35%', animationDelay: '4.5s' }}>Access Key</div>
                <div className="rune text-rune" style={{ top: '50%', right: '5%', animationDelay: '1.5s' }}>Portal Open</div>
                <div className="rune text-rune" style={{ top: '5%', right: '25%', animationDelay: '3.5s' }}>Validating</div>
                <div className="rune text-rune" style={{ top: '85%', left: '60%', animationDelay: '2.2s' }}>Confirmed!</div>
            </div>

            <div className="login-welcome-tooltip">
                <span className="tooltip-icon">📧</span>
                <span>Verifique seu email e digite o código recebido</span>
            </div>

            <div className="login-card">
                <div className="login-icon" style={iconStyle}>🔐</div>
                <h1 className="login-title">Verificação</h1>
                <p className="login-subtitle">Digite o código mágico enviado para seu email</p>

                <form onSubmit={lidandoComEnvio} className="login-form">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Seu e-mail cadastrado"
                        className="input-field"
                        required
                    />

                    <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder="Código de verificação"
                        className="input-field"
                        style={{ textAlign: 'center', letterSpacing: '3px', fontSize: '1.2rem' }}
                        required
                    />

                    <button type="submit" className="button-login" disabled={isLoading} style={{ background: 'linear-gradient(135deg, #8257e5 0%, #6833e4 100%)' }}>
                        {isLoading ? 'Verificando...' : 'sudo verify --code'}
                    </button>

                    <p style={{ marginTop: '20px', color: '#7c7c8a', fontSize: '0.9rem', textAlign: 'center' }}>
                        Não recebeu o código?{' '}
                        <span
                            onClick={lidandoComReenvio}
                            style={{ color: '#04d361', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Reenviar código
                        </span>
                    </p>

                    <p style={{ marginTop: '10px', color: '#7c7c8a', fontSize: '0.9rem', textAlign: 'center' }}>
                        Já verificou?{' '}
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