import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import '../Home/Home.css';
import Modal from '../../components/Modal';
import MagicMouse from '../../components/MagicMouse';

export default function User() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [profile, setProfile] = useState(null);

    const [user] = useState(() => {
        const localUser = localStorage.getItem('user');
        return localUser ? JSON.parse(localUser) : null;
    });

    const isAdmin = user?.role === 'KING' || user?.role === 'MASTER';

    // Inventory Details State
    const [showDetails, setShowDetails] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Skill Details State
    const [showSkillDetails, setShowSkillDetails] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!isAdmin) {
            toast.error("Acesso negado. Apenas para o Rei ou Mestre.");
            navigate('/dashboard');
        }
    }, [user, isAdmin, navigate]);

    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };

            try {
                if (id) {
                    const responseUser = await axios.get(`/users/${id}`, { headers });
                    setProfile(responseUser.data);
                }
            } catch (error) {
                console.log(error);
                toast.error("Erro ao carregar usuário.");
            }
        }
        loadUser();
    }, [isAdmin, id]);

    function abrirDetalhes(item) {
        setSelectedItem(item);
        setShowDetails(true);
    }

    function abrirDetalhesSkill(skill) {
        setSelectedSkill(skill);
        setShowSkillDetails(true);
    }

    if (!profile) return <div className="home-container"><MagicMouse /><p style={{ color: '#a8a8b3' }}>Carregando perfil...</p></div>;

    return (
        <div className="home-container">
            <MagicMouse />

            {/* Modal Detalhes do Item */}
            <Modal
                isOpen={showDetails}
                title={selectedItem?.nome || 'Detalhes do Item'}
                onCancel={() => setShowDetails(false)}
                cancelText="Fechar"
            >
                {selectedItem && (
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                            <span className="role-badge" style={{ backgroundColor: '#323238', color: '#ccc', width: 'fit-content', fontSize: '1rem' }}>
                                {selectedItem.tipo === 'Arma' ? '⚔️' : selectedItem.tipo === 'Poção' ? '🧪' : selectedItem.tipo === 'Armadura' ? '🛡️' : selectedItem.tipo === 'Relíquia' ? '🔮' : '📦'} {selectedItem.tipo}
                            </span>
                            <span style={{ color: '#04d361', fontWeight: 'bold' }}>
                                ⚡ Poder: {selectedItem.poder}
                            </span>
                        </div>

                        <div style={{ marginTop: '15px', borderTop: '1px solid #323238', paddingTop: '15px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#e1e1e6' }}>📜 Lenda / Descrição</h4>
                            <p style={{ color: '#a8a8b3', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                {selectedItem.lore || "Este item não possui inscrições sobre sua origem..."}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Detalhes da Skill */}
            <Modal
                isOpen={showSkillDetails}
                title={selectedSkill?.nome || 'Detalhes da Habilidade'}
                onCancel={() => setShowSkillDetails(false)}
                cancelText="Fechar"
            >
                {selectedSkill && (
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {selectedSkill.tipo && (
                                <span className="role-badge" style={{ backgroundColor: '#202024', border: '1px solid #323238', fontSize: '0.9rem' }}>
                                    {selectedSkill.tipo === 'Cura' ? '💖' : selectedSkill.tipo === 'Defesa' ? '🛡️' : selectedSkill.tipo === 'Ataque' ? '⚔️' : selectedSkill.tipo === 'Buff' ? '✨' : selectedSkill.tipo === 'Debuff' ? '💀' : '⚡'} {selectedSkill.tipo}
                                </span>
                            )}
                            <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>
                                ⚔️ Dano: {selectedSkill.dano}
                            </span>
                            <span style={{
                                background: 'linear-gradient(135deg, #8257e5 0%, #6833e4 100%)',
                                color: '#fff',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                ⭐ Nível {selectedSkill.UserSkill?.nivel || 1}
                            </span>
                        </div>

                        <div style={{ marginTop: '15px', borderTop: '1px solid #323238', paddingTop: '15px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#e1e1e6' }}>📜 Descrição / Efeito</h4>
                            <p style={{ color: '#a8a8b3', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                {selectedSkill.descricao || "Uma magia misteriosa..."}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Header com info do perfil */}
            <div className="home-header">
                <h1>📜 Perfil do Aventureiro</h1>

                <div className="user-info">
                    <div className="user-details">
                        <span className="user-name">{profile.nome}</span>
                        <span className={`role-badge role-${profile.role.toLowerCase()}`}>{profile.role}</span>
                    </div>
                    <button className="btn-logout" onClick={() => navigate(-1)}>← Voltar</button>
                </div>
            </div>

            <div className="content-area">
                <div className="inventory-layout">
                    {/* Coluna do Inventário */}
                    <div className="inventory-column">
                        <h2>🎒 Inventário de {profile.nome}</h2>
                        {profile?.Artefatos?.length > 0 ? (
                            <div className="cards-grid">
                                {profile.Artefatos.map(item => (
                                    <div className="inventory-card" key={item.id || item.nome} onClick={() => abrirDetalhes(item)} style={{ cursor: 'pointer' }}>
                                        <div className="inventory-header">
                                            <div className="inventory-icon">
                                                {item.tipo === 'Arma' ? '⚔️' : item.tipo === 'Poção' ? '🧪' : item.tipo === 'Armadura' ? '🛡️' : item.tipo === 'Relíquia' ? '🔮' : '📦'}
                                            </div>
                                            <div className="inventory-power">
                                                ⚡ {item.poder}
                                            </div>
                                        </div>

                                        <div className="inventory-body">
                                            <h3 className="inventory-title">{item.nome}</h3>
                                            <span className="inventory-type">{item.tipo}</span>

                                            {item.lore && (
                                                <p className="inventory-lore">
                                                    "{item.lore.length > 60 ? item.lore.substring(0, 60) + '...' : item.lore}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="cards-grid">
                                <div className="empty-card">
                                    <h3>Mochila Vazia</h3>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Coluna das Habilidades */}
                    <div className="inventory-column">
                        <h2>✨ Habilidades de {profile.nome}</h2>
                        {profile?.skills?.length > 0 ? (
                            <div className="cards-grid">
                                {profile.skills.map(skill => (
                                    <div className="inventory-card" key={skill.id} onClick={() => abrirDetalhesSkill(skill)} style={{ cursor: 'pointer' }}>
                                        <div className="inventory-header">
                                            <div className="inventory-icon" style={{ color: '#8257e5' }}>
                                                {skill.tipo === 'Cura' ? '💖' : skill.tipo === 'Defesa' ? '🛡️' : skill.tipo === 'Ataque' ? '⚔️' : skill.tipo === 'Buff' ? '✨' : skill.tipo === 'Debuff' ? '💀' : '⚡'}
                                            </div>
                                            <div className="inventory-power" style={{ display: 'flex', gap: '10px' }}>
                                                <span style={{ color: '#ff4d4d' }}>⚔️ {skill.dano}</span>
                                            </div>
                                        </div>

                                        <div className="inventory-body">
                                            <h3 className="inventory-title">{skill.nome}</h3>
                                            <span style={{
                                                background: 'linear-gradient(135deg, #8257e5 0%, #6833e4 100%)',
                                                color: '#fff',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                display: 'inline-block',
                                                boxShadow: '0 2px 8px rgba(130, 87, 229, 0.3)'
                                            }}>
                                                ⭐ Nível {skill.UserSkill?.nivel || 1}
                                            </span>

                                            {skill.descricao && (
                                                <p className="inventory-lore">
                                                    "{skill.descricao.length > 60 ? skill.descricao.substring(0, 60) + '...' : skill.descricao}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="cards-grid">
                                <div className="empty-card">
                                    <h3>Nenhuma Habilidade</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#7c7c8a', marginTop: '10px' }}>Este aventureiro ainda não aprendeu magias.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
