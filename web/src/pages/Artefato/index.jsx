import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import '../Home/Home.css';
import '../Guilda/Guilda.css';
import Modal from '../../components/Modal';
import MagicMouse from '../../components/MagicMouse';

export default function Artefato() {

    const navigate = useNavigate();

    const [user] = useState(() => {
        const localUser = localStorage.getItem('user');
        return localUser ? JSON.parse(localUser) : null;
    });

    const [artefatos, setArtefatos] = useState([]);
    const [buscarId, setBuscarId] = useState('');

    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('Arma');
    const [poder, setPoder] = useState('');
    const [lore, setLore] = useState('');


    const [logado, setLogado] = useState(false);
    const [idEditar, setIdEditar] = useState(null);
    const [artefatoToDelete, setArtefatoToDelete] = useState(null);

    const [showDetails, setShowDetails] = useState(false);
    const [selectedArtefato, setSelectedArtefato] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [showLootModal, setShowLootModal] = useState(false);
    const [lootItem, setLootItem] = useState(null);


    const isAdmin = user?.role === 'KING' || user?.role === 'MASTER';
    const isKing = user?.role === 'KING';

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    useEffect(() => {
        async function loadData() {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = {
                Authorization: `Bearer ${token}`,
            };
            try {
                if (user) {
                    const response = await axios.get('/artefatos', { headers });
                    setArtefatos(response.data);
                }
            } catch (error) {
                console.log("Erro ao carregar artefatos:", error);
                const errors = error.response?.data?.errors || [];
                if (errors.length > 0) errors.map(err => toast.error(err));
                else toast.error("Erro ao carregar artefatos.");
            }
        }
        loadData();
    }, [user]);

    function limparFormulario() {
        setNome('');
        setTipo('Arma');
        setPoder('');
        setLore('');
        setIdEditar(null);
    }

    function lidandoComCancelar() {
        limparFormulario();
        toast.info("Edição cancelada.");
    }

    function lidandoComEditar(id, nome, tipo, poder, lore) {
        setIdEditar(id);
        setNome(nome);
        setTipo(tipo);
        setPoder(poder);
        setLore(lore);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(`Editando artefato ${nome}`);
    }

    async function lidandoComCadastro(e) {
        e.preventDefault();
        setLogado(true);

        const token = localStorage.getItem('token');
        if (!token) return;
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        try {
            if (idEditar) {
                const response = await axios.put(`/artefatos/${idEditar}`, {
                    nome: nome,
                    tipo: tipo,
                    poder: poder,
                    lore: lore
                }, { headers });

                const novaLista = artefatos.map(item => {
                    if (item.id === idEditar) {
                        return {
                            ...item,
                            nome: nome,
                            tipo: tipo,
                            poder: poder,
                            lore: lore
                        }
                    }
                    return item;
                });
                setArtefatos(novaLista);
                toast.success(response.data.msg);
                limparFormulario();
            } else {
                const response = await axios.post('/artefatos', {
                    nome: nome,
                    tipo: tipo,
                    poder: poder,
                    lore: lore
                }, { headers });

                toast.success(response.data.msg);
                setArtefatos([...artefatos, response.data.artefato || response.data]);
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

    function abrirModalDelete(item) {
        setArtefatoToDelete(item);
        setShowModal(true);
    }

    async function confirmDelete() {
        if (!artefatoToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/artefatos/${artefatoToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const novaLista = artefatos.filter(item => item.id !== artefatoToDelete.id);
            setArtefatos(novaLista);
            toast.success(response.data.msg);
        } catch (err) {
            const errors = err.response?.data?.errors || [];
            if (errors.length > 0) errors.map(error => toast.error(error));
        } finally {
            setShowModal(false);
            setArtefatoToDelete(null);
        }
    }

    function abrirModalLoot(item) {
        setLootItem(item);
        setShowLootModal(true);
    }

    async function confirmLoot() {
        if (!lootItem) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`/artefatos/loot/${lootItem.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });

            const novaLista = artefatos.map(item => {
                if (item.id === lootItem.id) {
                    return { ...item, User: user };
                }
                return item;
            });

            setArtefatos(novaLista);
            toast.success(response.data.msg);
        } catch (err) {
            const errors = err.response?.data?.errors || [];
            if (errors.length > 0) errors.map(error => toast.error(error));
        } finally {
            setShowLootModal(false);
            setLootItem(null);
        }
    }

    function abrirDetalhes(item) {
        setSelectedArtefato(item);
        setShowDetails(true);
    }

    async function lidandoComBuscaPorId() {
        if (!buscarId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/artefatos/${buscarId}`, { headers: { Authorization: `Bearer ${token}` } });
            setArtefatos([res.data]);
        } catch (e) {
            console.log(e);
            const errors = e.response?.data?.errors || [];
            if (errors.length > 0) errors.map(err => toast.error(err));
            else toast.error("Artefato não encontrado");
        }
    }

    async function lidandoComLimparBusca() {
        setBuscarId('');
        const token = localStorage.getItem('token');
        const res = await axios.get('/artefatos', { headers: { Authorization: `Bearer ${token}` } });
        setArtefatos(res.data);
    }

    if (!user) return <></>;

    return (
        <div className="home-container">
            <MagicMouse />

            <Modal
                isOpen={showModal}
                title="Deletar Artefato?"
                onConfirm={confirmDelete}
                onCancel={() => setShowModal(false)}
                confirmText="Sim, Deletar!"
                cancelText="Cancelar"
            >
                <p>Tem certeza que deseja deletar o artefato <strong>{artefatoToDelete?.nome}</strong>?</p>
                <p style={{ fontSize: '0.9rem', color: '#a8a8b3', marginTop: '10px' }}>Essa ação não pode ser desfeita.</p>
            </Modal>

            <Modal
                isOpen={showDetails}
                title={selectedArtefato?.nome || 'Detalhes do Artefato'}
                onCancel={() => setShowDetails(false)}
                cancelText="Fechar"
            >
                {selectedArtefato && (
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                            <span className="role-badge" style={{ backgroundColor: '#323238', color: '#ccc', width: 'fit-content', fontSize: '1rem' }}>
                                {selectedArtefato.tipo === 'Arma' ? '⚔️' : selectedArtefato.tipo === 'Poção' ? '🧪' : selectedArtefato.tipo === 'Armadura' ? '🛡️' : selectedArtefato.tipo === 'Relíquia' ? '🔮' : '📦'} {selectedArtefato.tipo}
                            </span>
                            <span style={{ color: '#04d361', fontWeight: 'bold' }}>
                                ⚡ Poder: {selectedArtefato.poder}
                            </span>
                        </div>

                        <div style={{ marginTop: '15px', borderTop: '1px solid #323238', paddingTop: '15px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#e1e1e6' }}>📜 Lenda / Descrição</h4>
                            <p style={{ color: '#a8a8b3', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                {selectedArtefato.lore || "Este artefato não possui inscrições sobre sua origem..."}
                            </p>
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#444' }}>
                            ID: {selectedArtefato.id}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={showLootModal}
                title="Coletar Artefato?"
                onConfirm={confirmLoot}
                onCancel={() => setShowLootModal(false)}
                confirmText="Sim, Coletar!"
                cancelText="Cancelar"
            >
                <p>Deseja adicionar <strong>{lootItem?.nome}</strong> ao seu inventário?</p>
                <p style={{ fontSize: '0.9rem', color: '#a8a8b3', marginTop: '10px' }}>
                    O item ficará vinculado à sua conta e não poderá ser coletado por outros.
                </p>
            </Modal>


            <div className="home-header">
                <div className="header-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="SudoGestor" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                    <h1>⚒️ Forja de Artefatos</h1>
                </div>
                <button onClick={() => navigate('/dashboard')} className="btn-logout" style={{ borderColor: '#fff', color: '#fff' }}>
                    ⬅ Voltar para Home
                </button>
            </div>

            <div className="content-area">

                {isAdmin && (
                    <>
                        <div className="recruit-section">
                            <h2>{idEditar ? `✨ Reforjando Item` : `🔥 Forjar Novo Artefato`}</h2>

                            <form onSubmit={lidandoComCadastro} className="form-grid">

                                <div className="input-group">
                                    <label className="form-label">Nome do Artefato</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Espada do Destino"
                                        className="input-dark"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                    />
                                </div>


                                <div className="input-group">
                                    <label className="form-label">Tipo</label>
                                    <select className="input-dark" value={tipo} onChange={e => setTipo(e.target.value)}>
                                        <option value="Arma">⚔️ Arma</option>
                                        <option value="Armadura">🛡️ Armadura</option>
                                        <option value="Poção">🧪 Poção</option>
                                        <option value="Relíquia">🔮 Relíquia</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="form-label">Pontos de Poder</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="input-dark"
                                        value={poder}
                                        onChange={e => setPoder(e.target.value)}
                                    />
                                </div>

                                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Lenda / Descrição</label>
                                    <textarea
                                        className="input-dark"
                                        placeholder="Conte a história deste item..."
                                        rows="3"
                                        style={{ resize: 'vertical', minHeight: '80px' }}
                                        value={lore}
                                        onChange={e => setLore(e.target.value)}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-recruit" disabled={logado}>
                                        {logado ? 'Forjando...' : (idEditar ? 'Reforjar Item' : 'Criar Artefato')}
                                    </button>

                                    {idEditar && (
                                        <button type="button" className="btn-cancel" onClick={lidandoComCancelar}>
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </>
                )}

                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                    <input
                        type="number"
                        placeholder="ID do Item"
                        className="input-dark"
                        style={{ width: '120px' }}
                        value={buscarId}
                        onChange={e => setBuscarId(e.target.value)}
                    />

                    <button
                        onClick={lidandoComBuscaPorId}
                        className="btn-recruit"
                        style={{ padding: '0 15px' }}
                        title="Buscar por ID"
                    >
                        🔍
                    </button>

                    <button
                        onClick={lidandoComLimparBusca}
                        className="btn-cancel"
                        title="Limpar filtros"
                    >
                        Limpar
                    </button>
                </div>



                {artefatos.length > 0 ? (
                    <div className="members-grid">
                        {artefatos.map(item => (
                            <div key={item.id} className="member-card" onClick={() => abrirDetalhes(item)} style={{ cursor: 'pointer' }}>
                                <div className="member-avatar" style={{ color: '#fba94c', borderColor: '#fba94c' }}>
                                    {item.tipo === 'Arma' ? '⚔️' : item.tipo === 'Poção' ? '🧪' : item.tipo === 'Armadura' ? '🛡️' : item.tipo === 'Relíquia' ? '🔮' : '📦'}
                                </div>

                                <div className="member-info">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{item.nome}</strong>
                                        <small style={{ color: '#04d361' }}>⚡ {item.poder}</small>
                                    </div>

                                    <span className="role-badge" style={{ backgroundColor: '#323238', color: '#ccc', width: 'fit-content' }}>
                                        {item.tipo}
                                    </span>

                                    <p style={{ fontSize: '0.8rem', color: '#7c7c8a', marginTop: '5px', fontStyle: 'italic' }}>
                                        "{item.lore ? item.lore.substring(0, 50) + '...' : 'Sem história.'}"
                                    </p>
                                </div>

                                <div className="member-actions" onClick={(e) => e.stopPropagation()}>
                                    {isKing && (
                                        <>
                                            <button className="btn-action edit" title="Editar" onClick={() => lidandoComEditar(item.id, item.nome, item.tipo, item.poder, item.lore)}>✏️</button>
                                            <button className="btn-action delete" title="Excluir" onClick={() => abrirModalDelete(item)}>🗑️</button>
                                        </>
                                    )}
                                    {item.User ? (
                                        <button
                                            className="btn-action"
                                            title={`Pertence a ${item.User.nome}`}
                                            style={{ cursor: 'not-allowed', opacity: 0.6 }}
                                            onClick={() => toast.error(`Este item já pertence ao aventureiro ${item.User.nome}.`)}
                                        >
                                            🔒
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-action loot"
                                            title="Coletar"
                                            onClick={() => abrirModalLoot(item)}
                                        >
                                            🖐️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="cards-grid">
                        <div className="empty-card" style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            background: 'rgba(32, 32, 36, 0.6)',
                            borderRadius: '12px',
                            border: '1px dashed #424249'
                        }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>📦</span>
                            {isAdmin ? (
                                <>
                                    <h3 style={{ color: '#e1e1e6', marginBottom: '10px' }}>Nenhum artefato encontrado</h3>
                                    <p style={{ color: '#7c7c8a', fontSize: '0.95rem' }}>
                                        Os baús estão vazios... Cadastre um novo item para começar!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 style={{ color: '#e1e1e6', marginBottom: '10px' }}>Aguardando novos itens</h3>
                                    <p style={{ color: '#7c7c8a', fontSize: '0.95rem' }}>
                                        Nenhum artefato disponível no momento. Aguarde o Mestre adicionar novos tesouros!
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}