import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import '../Home/Home.css';
import './Guilda.css';
import Modal from '../../components/Modal';
import MagicMouse from '../../components/MagicMouse';

export default function Guilda() {
    const navigate = useNavigate();

    const [user] = useState(() => {
        const localUser = localStorage.getItem('user');
        return localUser ? JSON.parse(localUser) : null;
    });

    const [membrosGuilda, setMembrosGuilda] = useState([]);
    const [buscarId, setBuscarId] = useState('');

    const [novoNome, setNovoNome] = useState('');
    const [novoEmail, setNovoEmail] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [novoRole, setNovoRole] = useState('ADVENTURER');

    const [logado, setLogado] = useState(false);
    const [idEditar, setIdEditar] = useState(null);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);

    const isAdmin = user?.role === 'KING' || user?.role === 'MASTER';

    const editingMe = user?.id === idEditar;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!isAdmin) {
            toast.error("Acesso negado. Apenas para a alta cúpula.");
            navigate('/dashboard');
        }
    }, [user, isAdmin, navigate]);

    useEffect(() => {
        async function loadData() {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };

            try {
                if (isAdmin) {
                    const responseList = await axios.get('/users', { headers });
                    setMembrosGuilda(responseList.data);
                }
            } catch (error) {
                console.log("Erro ao carregar guilda:", error);
                const errors = error.response?.data?.errors || [];
                if (errors.length > 0) errors.map(err => toast.error(err));
                else toast.error("Erro ao carregar lista de membros.");
            }
        }
        loadData();
    }, [isAdmin]);

    function limparFormulario() {
        setIdEditar(null);
        setNovoNome('');
        setNovoEmail('');
        setNovoRole('ADVENTURER');
        setNovaSenha('');
    }

    function lidandoComCancelar() {
        limparFormulario();
        toast.info("Edição cancelada.");
    }

    function lidandoComEditar(id, nome, email, role) {
        setIdEditar(id);
        setNovoNome(nome);
        setNovoEmail(email);
        setNovoRole(role);
        setNovaSenha('');

        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(`Editando ${nome}.`);
    }

    async function lidandoComCadastro(e) {
        e.preventDefault();
        setLogado(true);

        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (idEditar) {
                const response = await axios.put(`/users/${idEditar}`, {
                    nome: novoNome,
                    email: novoEmail,
                    role: novoRole,
                    ...(novaSenha ? { password: novaSenha } : {})
                }, { headers });

                const novaLista = membrosGuilda.map(member => {
                    if (member.id === idEditar) {
                        return { ...member, nome: novoNome, email: novoEmail, role: novoRole };
                    }
                    return member;
                });
                setMembrosGuilda(novaLista);
                toast.success(response.data.msg);
                limparFormulario();
            } else {
                const response = await axios.post('/users', {
                    nome: novoNome,
                    email: novoEmail,
                    password: novaSenha,
                    role: novoRole
                }, { headers });

                toast.success(response.data.msg);
                setMembrosGuilda([...membrosGuilda, response.data.adventurer || response.data]);
                limparFormulario();
            }
        } catch (err) {
            const errors = err.response?.data?.errors || [];
            if (errors.length > 0) errors.map(error => toast.error(error));
            else toast.error('Erro ao salvar.');
        } finally {
            setLogado(false);
        }
    }

    // Opens the modal
    function abrirModalDelete(member) {
        setMemberToDelete(member);
        setShowModal(true);
    }

    // Confirms deletion
    async function confirmDelete() {
        if (!memberToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/users/${memberToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const novaLista = membrosGuilda.filter(member => member.id !== memberToDelete.id);
            setMembrosGuilda(novaLista);
            toast.success(response.data.msg);
        } catch (err) {
            const errors = err.response?.data?.errors || [];
            if (errors.length > 0) errors.map(error => toast.error(error));
        } finally {
            setShowModal(false);
            setMemberToDelete(null);
        }
    }

    async function lidandoComBuscaPorId() {
        if (!buscarId) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/users/${buscarId}`, { headers: { Authorization: `Bearer ${token}` } });
            setMembrosGuilda([res.data]);
        } catch (e) {
            console.log(e);
            const errors = e.response?.data?.errors || [];
            if (errors.length > 0) errors.map(err => toast.error(err));
            else toast.error("Membro não encontrado");
        }
    }

    async function lidandoComLimparBusca() {
        setBuscarId('');
        const token = localStorage.getItem('token');
        const res = await axios.get('/users', { headers: { Authorization: `Bearer ${token}` } });
        setMembrosGuilda(res.data);
    }

    if (!user) return <></>;

    return (
        <div className="home-container">
            <MagicMouse />
            <Modal
                isOpen={showModal}
                title="Banir Membro?"
                onConfirm={confirmDelete}
                onCancel={() => setShowModal(false)}
                confirmText="Sim, Banir!"
                cancelText="Cancelar"
            >
                <p>Tem certeza que deseja banir o {memberToDelete?.role === 'KING' ? 'Rei' : memberToDelete?.role === 'MASTER' ? 'Mestre' : 'Aventureiro'} <strong>{memberToDelete?.nome}</strong> da guilda?</p>
                <p style={{ fontSize: '0.9rem', color: '#a8a8b3', marginTop: '10px' }}>Essa ação não pode ser desfeita.</p>
            </Modal>

            <div className="home-header">
                <div className="header-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="SudoGestor" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                    <h1>🏰 Gestão da Guilda</h1>
                </div>
                <button onClick={() => navigate('/dashboard')} className="btn-logout" style={{ borderColor: '#fff', color: '#fff' }}>
                    ⬅ Voltar para Home
                </button>
            </div>

            <div className="content-area">
                <div className="recruit-section">
                    <h2>{idEditar ? `✏️ Editando Membro` : `📜 Recrutar Novo Membro`}</h2>
                    <form onSubmit={lidandoComCadastro} className="form-grid">

                        <div className="input-group">
                            <label className="form-label">Nome</label>
                            <input type="text" placeholder="Nome do aventureiro" className="input-dark" value={novoNome} onChange={e => setNovoNome(e.target.value)} />
                        </div>

                        {!editingMe && (
                            <>
                                <div className="input-group">
                                    <label className="form-label">E-mail</label>
                                    <input type="email" placeholder="email@exemplo.com" className="input-dark" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} />
                                </div>


                                <div className="input-group">
                                    <label className="form-label">Nova Senha</label>
                                    <input type="password" placeholder={idEditar ? "Deixe vazio para manter" : "Senha secreta"} className="input-dark" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <label className="form-label">Cargo</label>
                            <select className="input-dark" value={novoRole} onChange={e => setNovoRole(e.target.value)} disabled={editingMe}>
                                <option value="ADVENTURER">Aventureiro</option>
                                {(user.role === 'KING' || (user.role === 'MASTER' && editingMe)) && <option value="MASTER">Mestre</option>}
                                {user.role === 'KING' && <option value="KING">Rei</option>}
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-recruit" disabled={logado}>
                                {logado ? 'Processando...' : (idEditar ? 'Salvar Alterações' : 'Recrutar Membro')}
                            </button>
                            {idEditar && (
                                <button type="button" className="btn-cancel" onClick={lidandoComCancelar}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <input type="number" placeholder="ID" className="input-dark" style={{ width: '80px' }} value={buscarId} onChange={e => setBuscarId(e.target.value)} />
                    <button onClick={lidandoComBuscaPorId} className="btn-recruit" style={{ padding: '0 15px' }}>🔍</button>
                    <button onClick={lidandoComLimparBusca} className="btn-cancel">Limpar</button>
                </div>

                <div className="members-grid">
                    {membrosGuilda.map(member => (
                        <div key={member.id} className="member-card">
                            <div className="member-avatar">
                                {member.role === 'KING' ? '🤴' : member.role === 'MASTER' ? '🧙' : '🧝'}
                            </div>
                            <div className="member-info">
                                <small>ID: {member.id}</small>
                                <strong>{member.nome}</strong>
                                <span className={`role-badge role-${member.role.toLowerCase()}`}>{member.role}</span>
                                <span className="member-email">{member.email}</span>
                            </div>
                            <div className="member-actions">
                                <button
                                    className="btn-action edit"
                                    title={
                                        (user.role === 'MASTER' && (member.role === 'KING' || (member.role === 'MASTER' && member.id !== user.id))) ||
                                            (user.role === 'KING' && member.role === 'KING' && member.id !== user.id)
                                            ? 'Sem permissão' : 'Editar'
                                    }
                                    onClick={() => lidandoComEditar(member.id, member.nome, member.email, member.role)}
                                    disabled={
                                        (user.role === 'MASTER' && (member.role === 'KING' || (member.role === 'MASTER' && member.id !== user.id))) ||
                                        (user.role === 'KING' && member.role === 'KING' && member.id !== user.id)
                                    }
                                    style={
                                        (user.role === 'MASTER' && (member.role === 'KING' || (member.role === 'MASTER' && member.id !== user.id))) ||
                                            (user.role === 'KING' && member.role === 'KING' && member.id !== user.id)
                                            ? { opacity: 0.4, cursor: 'not-allowed' } : {}
                                    }
                                >✏️</button> 

                                <button
                                    className="btn-action delete"
                                    title={
                                        (user.role === 'MASTER' && (member.role === 'KING' || member.role === 'MASTER')) ||
                                            (user.role === 'KING' && member.role === 'KING')
                                            ? 'Sem permissão' : 'Excluir'
                                    }
                                    onClick={() => abrirModalDelete(member)}
                                    disabled={
                                        (user.role === 'MASTER' && (member.role === 'KING' || member.role === 'MASTER')) ||
                                        (user.role === 'KING' && member.role === 'KING')
                                    }
                                    style={
                                        (user.role === 'MASTER' && (member.role === 'KING' || member.role === 'MASTER')) ||
                                            (user.role === 'KING' && member.role === 'KING')
                                            ? { opacity: 0.4, cursor: 'not-allowed' } : {}
                                    }
                                >🗑️</button>
                                <button className="btn-action view" title="Ver Perfil" onClick={() => navigate(`/users/${member.id}`)}>👁️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}