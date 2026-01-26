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
                <h1 className="landing-title">Crônicas do Código Eterno</h1>
                <p className="landing-subtitle">Onde lógica encontra magia.</p>

                <div className="story-card">
                    <div className="story-text">
                        <p>
                            Em uma era onde <strong>dragões de espaguete</strong> aterrorizavam os servidores,
                            surgiu uma antiga profecia. Dizia-se que um grupo de Aventureiros, guiados pela lógica e café,
                            restauraria a ordem no <strong>Reino Digital</strong>.
                        </p>
                        <br />
                        <p>
                            A <strong>Guilda dos Devs</strong> permanece como o último bastião de esperança.
                            Seus arquivos guardam segredos de tecnologias esquecidas.
                        </p>
                    </div>
                </div>

                <button onClick={() => navigate('/login')} className="btn-enter">
                    Entrar no Portal
                </button>
            </div>
        </div>
    );
}
