import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import './Home.css';
import Modal from '../../components/Modal';

export default function Home() {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        const localUser = localStorage.getItem('user');
        return localUser ? JSON.parse(localUser) : null;
    });

    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [novoNome, setNovoNome] = useState('');
    const [novoEmail, setNovoEmail] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isAdmin = user?.role === 'KING' || user?.role === 'MASTER';

    useEffect(() => {
        if (!user) navigate('/');
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

    function abrirEdicao() {
        setEditandoPerfil(true);
        setNovoNome(user.nome);
        setNovoEmail(user.email);
        setNovaSenha('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function salvarPerfil(e) {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put(`/users/${user.id}`, {
                nome: novoNome,
                email: novoEmail,
                ...(novaSenha ? { password: novaSenha } : {})
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success(response.data.msg);
            setUser(prev => ({ ...prev, nome: novoNome, email: novoEmail }));
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

    if (!user) return <></>;

    return (
        <div className="home-container">
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

            <div className="home-header">
                <h1>Guilda dos Devs 🛡️</h1>

                <div className="header-actions">
                    {isAdmin && (
                        <>
                            <button onClick={() => navigate('/guilda')} className="btn-recruit" style={{ background: '#8257e5', border: 'none' }}>
                                👥 Gerenciar Guilda
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
                        <span className="user-name">{user.nome}</span>
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
                    </div>

                    <button className="btn-edit" onClick={abrirEdicao}>⚙️ Editar</button>
                    <button className="btn-delete-account" onClick={excluirConta} title="Excluir Minha Conta">💀</button>
                    <button onClick={lidandoComLogout} className="btn-logout">Sair</button>
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

                            <div>
                                <label>E-mail</label>
                                <input type="email" className="input-dark" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} />
                            </div>

                            <div>
                                <label>Nova Senha (Opcional)</label>
                                <input type="password" placeholder="Nova Senha" className="input-dark" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
                            </div>

                            <div>
                                <label>Cargo</label>
                                <input type="text" className="input-dark" value={user.role} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-recruit" disabled={isLoading}>{isLoading ? '...' : 'Salvar Alterações'}</button>
                                <button type="button" className="btn-cancel" onClick={() => setEditandoPerfil(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                <h2>🎒 Seu Inventário</h2>
                <div className="cards-grid">
                    <div className="empty-card">
                        <h3>Mochila Vazia</h3>
                        <p>Você ainda não possui artefatos.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}