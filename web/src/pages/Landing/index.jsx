import { useNavigate } from 'react-router-dom';
import './Landing.css';

import MagicMouse from '../../components/MagicMouse';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <MagicMouse />
            <div className="grid-overlay"></div>

            <div className="runes-container">
                <div className="rune">{`{ ... }`}</div>
                <div className="rune">{`</div>`}</div>
                <div className="rune">{`=>`}</div>
                <div className="rune">{`&&`}</div>
                <div className="rune">{`<?>`}</div>
            </div>

            <div className="landing-content">
                <img src="/logo.png" alt="SudoGestor Logo" className="landing-logo" />
                <h1 className="landing-title">SudoGestor</h1>
                <p className="landing-subtitle">Gerencie sua campanha com poderes de root. 🎲</p>

                <div className="story-card">
                    <div className="story-text">
                        <p>
                            Chega de <strong>fichas rabiscadas</strong> perdidas em pilhas de papel.
                            Chega de dados esquecidos e inventários desorganizados.
                            O <strong>SudoGestor</strong> nasceu para trazer ordem ao caos das mesas de RPG.
                        </p>
                        <br />
                        <p>
                            Gerencie seus <strong>aventureiros</strong>, controle <strong>artefatos lendários</strong>,
                            acompanhe <strong>habilidades</strong> e evolua suas campanhas como um verdadeiro
                            <strong> Mestre de Dungeon</strong> — agora com superpoderes digitais.
                        </p>
                    </div>
                </div>

                <div className="landing-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                    <button onClick={() => navigate('/login')} className="btn-enter">
                        sudo login --rpg
                    </button>
                    <button onClick={() => navigate('/register')} className="btn-enter" style={{ background: 'linear-gradient(135deg, #04d361 0%, #02a34d 100%)' }}>
                        sudo create --king
                    </button>
                </div>
            </div>
        </div>
    );
}
