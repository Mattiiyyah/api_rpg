import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import './Home.css';
import Modal from '../../components/Modal';
import MagicMouse from '../../components/MagicMouse';

export default function Home() {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        const localUser = localStorage.getItem('user');
        return localUser ? JSON.parse(localUser) : null;
    });

    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [novoNome, setNovoNome] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Inventory Details State
    const [showDetails, setShowDetails] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Skill Details State
    const [showSkillDetails, setShowSkillDetails] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);

    const isAdmin = user?.role === 'KING' || user?.role === 'MASTER';

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    useEffect(() => {
        async function loadUserData() {
            const token = localStorage.getItem('token');
            if (!token || !user?.id) return;

            try {
                const response = await axios.get(`/users/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(prev => ({ ...prev, ...response.data }));
            } catch (error) {
                console.log("Erro ao atualizar dados do usuário:", error);
                if (error.response?.status === 401) {
                    localStorage.clear();
                    navigate('/');
                }
            }
        }
        loadUserData();
    }, [user?.id, navigate]);

    const lidandoComLogout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/');
    };

    function abrirModalLogout() {
        setShowLogoutModal(true);
    }

    function abrirEdicao() {
        setEditandoPerfil(true);
        setNovoNome(user.nome);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function salvarPerfil(e) {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put(`/users/${user.id}`, {
                nome: novoNome,
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success(response.data.msg);
            setUser(prev => ({ ...prev, nome: novoNome }));
            setEditandoPerfil(false);
        } catch (err) {
            const errors = err.response?.data?.errors || [];
            if (errors.length > 0) errors.map(error => toast.error(error));
            else toast.error("Erro ao atualizar perfil.");
        } finally {
            setIsLoading(false);
        }
    }

    function excluirConta() {
        setShowDeleteModal(true);
    }

    async function confirmDelete() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/users/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.info(response.data.msg);
            lidandoComLogout();
        } catch (err) {
            console.log(err);
            const errors = err.response?.data?.errors || [];
            if (errors.length > 0) errors.map(error => toast.error(error));
            else toast.error("Erro ao excluir conta.");
        } finally {
            setShowDeleteModal(false);
        }
    }

    function abrirDetalhes(item) {
        setSelectedItem(item);
        setShowDetails(true);
    }

    function abrirDetalhesSkill(skill) {
        setSelectedSkill(skill);
        setShowSkillDetails(true);
    }

    if (!user) return <></>;

    return (
        <div className="home-container">
            <MagicMouse />
            <Modal
                isOpen={showDeleteModal}
                title="Excluir Conta?"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Excluir Para Sempre"
                cancelText="Cancelar"
            >
                <p>Tem certeza que deseja apagar sua conta? Todas as suas conquistas, itens e histórias serão perdidas no Vazio Digital. 💀</p>
                <p style={{ fontSize: '0.9rem', color: '#a8a8b3', marginTop: '10px' }}>Essa ação é irreversível.</p>
            </Modal>

            <Modal
                isOpen={showLogoutModal}
                title="🚪 Deixar a Guilda?"
                onConfirm={lidandoComLogout}
                onCancel={() => setShowLogoutModal(false)}
                confirmText="Partir em Jornada"
                cancelText="Ficar mais um pouco"
            >
                <p>{user?.role}, <strong>{user?.nome}</strong>, você realmente deseja deixar a Guilda por agora?</p>
                <p style={{ fontSize: '0.9rem', color: '#a8a8b3', marginTop: '10px' }}>O portal se fechará e você precisará provar sua identidade novamente para retornar. ✨</p>
            </Modal>
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

            <div className="home-header">
                <h1>SudoGestor 🎲</h1>

                <div className="header-actions">
                    {isAdmin && (
                        <>
                            <button onClick={() => navigate('/guilda')} className="btn-recruit" style={{ background: '#8257e5', border: 'none' }}>
                                👥 Gerenciar Mesa
                            </button>
                        </>
                    )}
                    <button onClick={() => navigate('/artefatos')} className="btn-recruit" style={{ background: '#2563eb', border: 'none' }}>
                        🔮 Artefatos
                    </button>
                    <button onClick={() => navigate('/skills')} className="btn-recruit" style={{ background: '#d97706', border: 'none' }}>
                        ⚡ Skills
                    </button>
                </div>


                <div className="user-info">
                    <div className="user-details">
                        <span className="user-name">
                            {user.role === 'KING' ? '🤴' : user.role === 'MASTER' ? '🧙' : '🧝'} {user.nome}
                        </span>
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
                    </div>

                    <button className="btn-edit" onClick={abrirEdicao}>⚙️ Editar</button>
                    <button className="btn-delete-account" onClick={excluirConta} title="Excluir Minha Conta">💀</button>
                    <button onClick={abrirModalLogout} className="btn-logout">Sair</button>
                </div>
            </div>

            <div className="content-area">

                {editandoPerfil && (
                    <div className="recruit-section">
                        <h2>⚙️ Editando Seu Perfil</h2>
                        <form onSubmit={salvarPerfil} className="recruit-form">
                            <div>
                                <label>Nome</label>
                                <input type="text" className="input-dark" value={novoNome} onChange={e => setNovoNome(e.target.value)} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-recruit" disabled={isLoading}>{isLoading ? '...' : 'Salvar Alterações'}</button>
                                <button type="button" className="btn-cancel" onClick={() => setEditandoPerfil(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="inventory-layout">
                    {/* Coluna do Inventário */}
                    <div className="inventory-column">
                        <h2>🎒 Seu Inventário</h2>
                        {user?.Artefatos?.length > 0 ? (
                            <div className="cards-grid">
                                {user.Artefatos.map((item, index) => (
                                    <div className="inventory-card" key={item.id || `item-${index}`} onClick={() => abrirDetalhes(item)} style={{ cursor: 'pointer' }}>
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
                        <h2>✨ Suas Habilidades</h2>
                        {user?.skills?.length > 0 ? (
                            <div className="cards-grid">
                                {user.skills.map((skill, index) => (
                                    <div className="inventory-card" key={skill.id || `skill-${index}`} onClick={() => abrirDetalhesSkill(skill)} style={{ cursor: 'pointer' }}>
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
                                    <p style={{ fontSize: '0.9rem', color: '#7c7c8a', marginTop: '10px' }}>Visite o Grimório!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}