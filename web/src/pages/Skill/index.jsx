import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axios';
import '../Home/Home.css';
import '../Guilda/Guilda.css';
import Modal from '../../components/Modal';
import MagicMouse from '../../components/MagicMouse';

export default function Skill() {

    const navigate = useNavigate();

    const [user] = useState(() => {
        const localUser = localStorage.getItem('user');
        return localUser ? JSON.parse(localUser) : null;
    });

    const [skills, setSkills] = useState([]);
    const [buscarId, setBuscarId] = useState('');

    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const [dano, setDano] = useState('');
    const [custo, setCusto] = useState('');
    const [descricao, setDescricao] = useState('');

    const [logado, setLogado] = useState(false);
    const [idEditar, setIdEditar] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [skillToDelete, setSkillToDelete] = useState(null);

    const [showDetails, setShowDetails] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);

    const [showModalLearn, setShowModalLearn] = useState(false);
    const [skillToLearn, setSkillToLearn] = useState(null);

    const [learnedSkillIds, setLearnedSkillIds] = useState(() => {
        const userSkills = user?.UserSkill || [];
        return userSkills.map(us => us.skill_id);
    });

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
                    // Busca todas as skills
                    const skillsResponse = await axios.get('/skills', { headers });
                    setSkills(skillsResponse.data);

                    // Busca os dados do usuário para pegar as skills que ele já aprendeu
                    const usuarioResponse = await axios.get(`/users/${user.id}`, { headers });
                    const skillsDoUsuario = usuarioResponse.data.skills || [];
                    const idsAprendidos = skillsDoUsuario.map(skill => skill.id);
                    setLearnedSkillIds(idsAprendidos);
                }
            } catch (error) {
                console.log("Erro ao carregar skills:", error);
                const errors = error.response?.data?.errors || [];
                if (errors.length > 0) errors.map(err => toast.error(err));
                else toast.error("Erro ao carregar skills.");
            }
        }
        loadData();
    }, [user]);

    function limparFormulario() {
        setNome('');
        setTipo('');
        setDano('');
        setCusto('');
        setDescricao('');
        setIdEditar(null);
    }

    function lidandoComCancelar() {
        limparFormulario();
        toast.info('Edição cancelada');
    }

    function lidandoComEditar(id, nome, tipo, dano, custo, descricao) {
        setIdEditar(id);
        setNome(nome);
        setTipo(tipo);
        setDano(dano);
        setCusto(custo);
        setDescricao(descricao);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(`Editando habilidade: ${nome}`);
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
                const response = await axios.put(`/skills/${idEditar}`, {
                    nome, tipo, dano, custo_mana: custo, descricao
                }, { headers });


                const novaLista = skills.map(skill => {
                    if (skill.id === idEditar) {
                        return {
                            ...skill,
                            nome: nome,
                            tipo: tipo,
                            dano: dano,
                            custo_mana: custo,
                            descricao: descricao,
                        }
                    }
                    return skill;
                });
                setSkills(novaLista);
                toast.success(response.data.msg);
                limparFormulario();

            } else {
                const response = await axios.post('/skills', {
                    nome: nome,
                    tipo: tipo,
                    dano: dano,
                    custo_mana: custo,
                    descricao: descricao,
                }, { headers });
                toast.success(response.data.msg);
                setSkills([...skills, response.data.skill || response.data]);
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

    function abrirModalDelete(skill) {
        setSkillToDelete(skill);
        setShowModal(true);
    }

    async function confirmDelete() {
        if (!skillToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/skills/${skillToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
            const novaLista = skills.filter(skill => skill.id !== skillToDelete.id);
            setSkills(novaLista);
            toast.success(response.data.msg);
        } catch (err) {
            const errors = err.response?.data?.errors || [];
            if (errors.length > 0) errors.map(error => toast.error(error));
        } finally {
            setShowModal(false);
            setSkillToDelete(null);
        }
    }

    function abrirModalLearn(skill) {
        setSkillToLearn(skill);
        setShowModalLearn(true);
    }

    async function confirmLearn() {
        if (!skillToLearn) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/skills/${skillToLearn.id}/aprender`, {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(response.data.msg);
            setLearnedSkillIds(prev => [...prev, skillToLearn.id]);
        } catch (err) {
            const errors = err.response?.data?.errors || [];
            if (errors.length > 0) errors.map(error => toast.error(error));
        } finally {
            setShowModalLearn(false);
            setSkillToLearn(null);
        }
    }

    function abrirDetalhes(skill) {
        setSelectedSkill(skill);
        setShowDetails(true);
    }

    async function lidandoComBuscaPorId() {
        if (!buscarId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/skills/${buscarId}`, { headers: { Authorization: `Bearer ${token}` } });
            setSkills([res.data]);
        } catch (e) {
            console.log(e);
            const errors = e.response?.data?.errors || [];
            if (errors.length > 0) errors.map(err => toast.error(err));
            else toast.error("Habilidade não encontrada");
        }
    }

    async function lidandoComLimparBusca() {
        setBuscarId('');
        const token = localStorage.getItem('token');
        const res = await axios.get('/skills', { headers: { Authorization: `Bearer ${token}` } });
        setSkills(res.data);
    }

    if (!user) return <></>;

    return (
        <div className="home-container">
            <MagicMouse />

            <Modal
                isOpen={showModal}
                title="Esquecer Habilidade?"
                onConfirm={confirmDelete}
                onCancel={() => setShowModal(false)}
                confirmText="Sim, Esquecer!"
                cancelText="Cancelar"
            >
                <p>Tem certeza que deseja apagar a habilidade <strong>{skillToDelete?.nome}</strong> dos registros do reino?</p>
                <p style={{ fontSize: '0.9rem', color: '#a8a8b3', marginTop: '10px' }}>Nenhum aventureiro poderá aprendê-la novamente.</p>
            </Modal>


            <Modal
                isOpen={showDetails}
                title={selectedSkill?.nome || 'Detalhes da Magia'}
                onCancel={() => setShowDetails(false)}
                cancelText="Fechar"
            >
                {selectedSkill && (
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                            {selectedSkill.tipo && (
                                <span className="role-badge" style={{ backgroundColor: '#202024', border: '1px solid #323238', fontSize: '0.9rem' }}>
                                    {selectedSkill.tipo === 'Cura' ? '💖' : selectedSkill.tipo === 'Defesa' ? '🛡️' : selectedSkill.tipo === 'Ataque' ? '⚔️' : selectedSkill.tipo === 'Buff' ? '✨' : selectedSkill.tipo === 'Debuff' ? '💀' : '⚡'} {selectedSkill.tipo}
                                </span>
                            )}
                            <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>
                                ⚔️ Dano: {selectedSkill.dano}
                            </span>
                            <span style={{ color: '#04d361', fontWeight: 'bold' }}>
                                💧 Mana: {selectedSkill.custo_mana !== undefined ? selectedSkill.custo_mana : selectedSkill.custo}
                            </span>
                        </div>

                        <div style={{ marginTop: '15px', borderTop: '1px solid #323238', paddingTop: '15px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#e1e1e6' }}>📜 Descrição / Efeito</h4>
                            <p style={{ color: '#a8a8b3', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                {selectedSkill.descricao || "Uma magia misteriosa..."}
                            </p>
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#444' }}>
                            ID: {selectedSkill.id}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={showModalLearn}
                title="Confirmar Aprendizagem"
                onConfirm={confirmLearn}
                onCancel={() => setShowModalLearn(false)}
                confirmText="Sim, Aprender!"
                cancelText="Cancelar"
            >
                <p>Tem certeza que deseja aprender a habilidade <strong>{skillToLearn?.nome}</strong>?</p>
            </Modal>


            <div className="home-header">
                <div className="header-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="SudoGestor" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                    <h1>✨ Grimório de Habilidades</h1>
                </div>
                <button onClick={() => navigate('/dashboard')} className="btn-logout" style={{ borderColor: '#fff', color: '#fff' }}>
                    ⬅ Voltar para Dashboard
                </button>
            </div>

            <div className="content-area">

                {isAdmin && (
                    <>
                        <div className="recruit-section">
                            <h2>{idEditar ? `✍️ Reescrevendo Pergaminho` : `📜 Criar Nova Magia`}</h2>

                            <form onSubmit={lidandoComCadastro} className="form-grid">


                                <div className="input-group">
                                    <label className="form-label">Nome da Habilidade</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Bola de Fogo"
                                        className="input-dark"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                    />
                                </div>


                                <div className="input-group">
                                    <label className="form-label">Tipo / Elemento</label>
                                    <select
                                        className="input-dark"
                                        value={tipo}
                                        onChange={e => setTipo(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Ataque">⚔️ Ataque</option>
                                        <option value="Defesa">🛡️ Defesa</option>
                                        <option value="Cura">💖 Cura</option>
                                        <option value="Buff">✨ Buff (Melhoria)</option>
                                        <option value="Debuff">💀 Debuff (Maldição)</option>
                                    </select>
                                </div>


                                <div className="input-group">
                                    <label className="form-label">Poder de Dano</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="input-dark"
                                        value={dano}
                                        onChange={e => setDano(e.target.value)}
                                    />
                                </div>


                                <div className="input-group">
                                    <label className="form-label">Custo de Mana</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="input-dark"
                                        value={custo}
                                        onChange={e => setCusto(e.target.value)}
                                    />
                                </div>


                                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Descrição / Efeito</label>
                                    <textarea
                                        className="input-dark"
                                        placeholder="Descreva o que essa magia faz..."
                                        rows="3"
                                        style={{ resize: 'vertical', minHeight: '80px' }}
                                        value={descricao}
                                        onChange={e => setDescricao(e.target.value)}
                                    />
                                </div>


                                <div className="form-actions">
                                    <button type="submit" className="btn-recruit" disabled={logado}>
                                        {logado ? 'Encantando...' : (idEditar ? 'Salvar Alterações' : 'Criar Habilidade')}
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
                        placeholder="ID da Skill"
                        className="input-dark"
                        style={{ width: '120px' }}
                        value={buscarId}
                        onChange={e => setBuscarId(e.target.value)}
                    />
                    <button onClick={lidandoComBuscaPorId} className="btn-recruit" style={{ padding: '0 15px' }}>🔍</button>
                    <button onClick={lidandoComLimparBusca} className="btn-cancel">Limpar</button>
                </div>


                {skills.length > 0 ? (
                    <div className="members-grid">
                        {skills.map((skill) => {
                            const jaAprendi = learnedSkillIds.includes(skill.id);

                            return (
                                <div key={skill.id} className="member-card" onClick={() => abrirDetalhes(skill)} style={{ cursor: 'pointer' }}>


                                    <div className="member-avatar" style={{ color: '#8257e5', borderColor: '#8257e5' }}>
                                        {skill.tipo === 'Cura' ? '💖' : skill.tipo === 'Defesa' ? '🛡️' : skill.tipo === 'Ataque' ? '⚔️' : skill.tipo === 'Buff' ? '✨' : skill.tipo === 'Debuff' ? '💀' : '⚡'}
                                    </div>


                                    <div className="member-info">
                                        <small>ID: {skill.id}</small>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong>{skill.nome}</strong>
                                            {skill.tipo && (
                                                <span className="role-badge" style={{ backgroundColor: '#202024', border: '1px solid #323238', fontSize: '0.7rem' }}>
                                                    {skill.tipo}
                                                </span>
                                            )}
                                        </div>


                                        <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>
                                                ⚔️ {skill.dano}
                                            </span>
                                            <span style={{ color: '#04d361', fontWeight: 'bold' }}>
                                                💧 {skill.custo_mana !== undefined ? skill.custo_mana : skill.custo}
                                            </span>
                                        </div>

                                        <p style={{ fontSize: '0.8rem', color: '#7c7c8a', marginTop: '8px', fontStyle: 'italic', lineHeight: '1.4' }}>
                                            "{skill.descricao ? (skill.descricao.length > 50 ? skill.descricao.substring(0, 50) + '...' : skill.descricao) : "Uma magia misteriosa..."}"
                                        </p>
                                    </div>


                                    <div className="member-actions" onClick={(e) => e.stopPropagation()}>
                                        {isKing && (
                                            <>
                                                <button className="btn-action edit" title="Editar" onClick={() => lidandoComEditar(skill.id, skill.nome, skill.tipo, skill.dano, skill.custo_mana, skill.descricao)}>✏️</button>
                                                <button className="btn-action delete" title="Excluir" onClick={() => abrirModalDelete(skill)}>🗑️</button>
                                            </>
                                        )}

                                        {jaAprendi ? (
                                            <button className="btn-action learn" title="Já aprendida" disabled>
                                                🧐
                                            </button>
                                        ) : (
                                            <button className="btn-action learn" title="Aprender" onClick={() => abrirModalLearn(skill)}>
                                                🧠
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="cards-grid">
                        <div className="empty-card" style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            background: 'rgba(32, 32, 36, 0.6)',
                            borderRadius: '12px',
                            border: '1px dashed #8257e5'
                        }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>📖</span>
                            {isAdmin ? (
                                <>
                                    <h3 style={{ color: '#e1e1e6', marginBottom: '10px' }}>Nenhuma habilidade encontrada</h3>
                                    <p style={{ color: '#7c7c8a', fontSize: '0.95rem' }}>
                                        O grimório está em branco... Cadastre uma nova skill para começar!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 style={{ color: '#e1e1e6', marginBottom: '10px' }}>Aguardando novos feitiços</h3>
                                    <p style={{ color: '#7c7c8a', fontSize: '0.95rem' }}>
                                        Nenhuma habilidade disponível no momento. Aguarde o Mestre ensinar novas magias!
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