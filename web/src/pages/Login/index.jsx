import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import MagicMouse from '../../components/MagicMouse';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Dynamic glow calculation
  const glowIntensity = Math.min(password.length * 5, 50); // Max 50px glow
  const iconStyle = {
    filter: `drop-shadow(0 0 ${10 + glowIntensity}px var(--primary))`,
    transform: `scale(${1 + Math.min(password.length * 0.02, 0.2)})`
  };

  async function lidaComLogin(e) {
    e.preventDefault();

    if (email.length < 1 || password.length < 1) {
      toast.warn('⚠️ Preencha todos os campos, aventureiro!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/tokens', {
        email,
        password
      });

      toast.success(`🦄 Bem-vindo, ${response.data.user.nome}!`);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setIsLoading(false);
      navigate('/dashboard');

    } catch (err) {
      setIsLoading(false);
      const errors = err.response?.data?.errors || [];

      if (errors.length > 0) {
        toast.error(`❌ ${errors[0]}`);
      } else {
        toast.error('❌ Erro no servidor. O portal está fechado.');
      }
    }
  }

  return (
    <div className="login-container">
      <MagicMouse />
      <div className="grid-overlay"></div>

      <div className="runes-container">
        <div className="rune text-rune" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>+100 XP</div>
        <div className="rune text-rune" style={{ top: '60%', left: '5%', animationDelay: '2s' }}>Level Up!</div>
        <div className="rune text-rune" style={{ top: '20%', right: '15%', animationDelay: '4s' }}>Critical Hit</div>
        <div className="rune text-rune" style={{ top: '80%', right: '10%', animationDelay: '1s' }}>Mana Full</div>
        <div className="rune text-rune" style={{ top: '40%', left: '85%', animationDelay: '3s' }}>Quest Log</div>
        <div className="rune text-rune" style={{ top: '10%', left: '50%', animationDelay: '5s' }}>Loading...</div>
        <div className="rune text-rune" style={{ top: '90%', left: '30%', animationDelay: '0.5s' }}>Save Game</div>
        <div className="rune text-rune" style={{ top: '30%', left: '25%', animationDelay: '2.5s' }}>New Skill</div>
        <div className="rune text-rune" style={{ top: '70%', right: '35%', animationDelay: '4.5s' }}>Bug Fixed</div>
        <div className="rune text-rune" style={{ top: '50%', right: '5%', animationDelay: '1.5s' }}>Loot Found</div>
        <div className="rune text-rune" style={{ top: '5%', right: '25%', animationDelay: '3.5s' }}>Compiling...</div>
        <div className="rune text-rune" style={{ top: '85%', left: '60%', animationDelay: '2.2s' }}>Boss Fight</div>
      </div>

      <div className="login-welcome-tooltip">
        <span className="tooltip-icon">👋</span>
        <span>Aventureiro, faça seu login abaixo!</span>
      </div>

      <div className="login-card">
        <div className="login-icon" style={iconStyle}>🔮</div>
        <h1 className="login-title">Portal do Reino</h1>
        <p className="login-subtitle">Entre com suas credenciais de mestre</p>

        <form onSubmit={lidaComLogin} className="login-form">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Seu e-mail real"
            className="input-field"
          />

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Sua senha secreta"
            className="input-field"
          />

          <button type="submit" className="button-login" disabled={isLoading}>
            {isLoading ? 'Invocando...' : 'Acessar Grimório'}
          </button>
        </form>
      </div>
    </div>
  );
}