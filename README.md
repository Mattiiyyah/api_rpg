# 🏰 SudoGestor - The RPG Backend Grimoire

> *"Onde o código se torna lei e os dados viram lendas."*

<div align="center">

[![Backend Status](https://img.shields.io/badge/Backend-Node.js%20%7C%20Sequelize-2ea44f?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL-00758f?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Frontend Status](https://img.shields.io/badge/Frontend-React%20%7C%20AI%20Augmented-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Security](https://img.shields.io/badge/Security-JWT%20%7C%20ACL-e34c26?style=for-the-badge&logo=json-web-tokens)](https://jwt.io/)

</div>

---

## 📜 O Pergaminho de Introdução

O **SudoGestor** não é apenas uma API, é um **Ecossistema de Gestão de RPG** completo. Ele transforma a lógica fria de banco de dados em uma experiência imersiva, onde cada rota é uma magia e cada erro é uma maldição.

O projeto também representa uma jornada de **Desenvolvimento Aumentado por IA (AI-Augmented)**: o backend foi arquitetado com lógica humana robusta, enquanto o frontend e templates de e-mail foram refinados com mentoria de IA, acelerando o aprendizado e a entrega de valor.

---

---

## 🗺️ Mapa do Tesouro (Estrutura)

Aventure-se pelos diretórios do sistema:

```
api_rpg/
├── 📂 src/
│   ├── 📂 config/          # Configurações do Banco e E-mail
│   ├── 📂 controllers/     # A lógica dos Magos (Regras de Negócio)
│   ├── 📂 database/        # Migrations e Seeds (Gênese do Mundo)
│   ├── 📂 middlewares/     # Guardiões dos Portões (Autenticação)
│   ├── 📂 models/          # Representação das Entidades
│   └── 📂 routes/          # Caminhos do Reino (Endpoints)
├── 📂 web/                 # O Portal Visual (React Frontend)
└── 📄 .env.example         # Molde das Chaves Secretas
```

---

## 📖 Grimório de Rotas (API Docs)

Principais encantamentos disponíveis para consumo:

### 👤 Usuários (Users)
| Método | Rota | Descrição | Permissão |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/register` | Cria o primeiro **Rei** 👑 | *Livre* |
| `POST` | `/users` | Cria Aventureiros ou Mestres (Mestre somente podem ser criados e editados por REIS, REIS podem ser criados por outros REIS porém não podem ser editados por outros REIS.) | *King/Master* |
| `GET` | `/users/:id` | Vê detalhes de um herói | *King/Master/Self* |
| `PUT` | `/users/:id` | Atualiza dados do herói | *King/Master/Self* |
| `DELETE` | `/users/:id` | Bane uma alma do reino | *King/Master* |
| `PATCH` | `/users/:id/skills/:id` | Upa o nível de uma skill | *King* |

### 🏺 Artefatos (Items)
| Método | Rota | Descrição | Permissão |
| :--- | :--- | :--- | :--- |
| `GET` | `/artefatos` | Lista todos os itens do mundo | *Livre* |
| `POST` | `/artefatos` | Forja um novo item lendário | *Master/King* |
| `PUT` | `/artefatos/:id` | Altera a essência de um item | *King* |
| `DELETE` | `/artefatos/:id` | Desencanta um item (Destrói) | *King* |
| `PATCH` | `/artefatos/loot/:id` | **Saqueia** um item sem dono | *Todos (Autenticado)* |

### ✨ Habilidades (Skills)
| Método | Rota | Descrição | Permissão |
| :--- | :--- | :--- | :--- |
| `POST` | `/skills` | Cria uma nova magia | *Master/King* |
| `PUT` | `/skills/:id` | Refina uma magia existente | *King* |
| `DELETE` | `/skills/:id` | Apaga o conhecimento (Destrói) | *King* |
| `POST` | `/skills/:id/aprender` | Aprende uma habilidade | *Todos (Autenticado)* |

---

## 🛡️ A Hierarquia do Poder (ACL)

O reino é regido por leis estritas (Middlewares) que determinam quem pode alterar a realidade.

<div align="center">

| 🗡️ Classe (Role) | 🛡️ Título | 📜 Permissões & Poderes |
| :--- | :--- | :--- |
| 👑 **KING** | *O Supremo* | **Deus do Servidor**. Pode criar, editar e DESTRUIR qualquer coisa. É o único capaz de apagar Artefatos e Skills da existência. Pode promover ou rebaixar outros usuários. |
| 🧙‍♂️ **MASTER** | *O Criador* | **Arquiteto do Mundo**. Pode forjar novos Artefatos e criar novas Skills para os jogadores usarem. Mas cuidado: o que ele cria, ele não pode destruir. |
| 🧝 **ADVENTURER** | *O Jogador* | **O Herói**. Pode explorar o mundo, saquear (`loot`) artefatos sem dono, aprender (`learn`) novas habilidades e evoluir seu perfil. |

</div>

> **🧙‍♂️ Curiosidade do Código:** Se um *Mestre* tenta deletar um item, a API responde: *"Uma barreira mágica repele suas mãos! Apenas a magia do Rei pode destruir artefatos."*

---

## ⚔️ Funcionalidades de Batalha (Features)

### 1. Sistema de Loot Realista (1:N)
Diferente de sistemas comuns, aqui os itens são **únicos**.
- Se um Martelo Lendário existe, apenas **um** jogador pode tê-lo.
- Rota `POST /artefatos/:id/loot`: Se o item não tiver dono (`user_id: NULL`), ele passa para o inventário do jogador. Se já tiver dono, o roubo falha!

### 2. Grimório de Habilidades (N:N)
Um sistema complexo de aprendizado.
- Um mago pode saber "Bola de Fogo".
- Um guerreiro pode saber "Bola de Fogo".
- Mas cada um tem seu próprio nível de maestria na tabela pivot (`user_skills`).

### 3. O "Fofoqueiro Real" (Auditoria Automática)
O sistema de e-mails (`Nodemailer`) é proativo e temático:
- **Mudança de Cargo**: Se você vira Rei, recebe um e-mail Dourado 🟡. Se é rebaixado, um e-mail Verde 🟢 consolador.
- **Segurança**: Alterou a senha? O sistema avisa imediatamente. Se foi um Admin que alterou sua senha, o aviso é vermelho 🔴 alerta total.

### 4. Visão Mística (Privacidade)
- **Olhos de Águia**: Reis e Mestres veem todos os detalhes dos usuários (incluindo E-mails).
- **Névoa de Guerra**: Aventureiros veem apenas o nome, cargo e equipamentos dos outros. Dados sensíveis são ocultados magicamente na resposta JSON.

---

## 🚀 Instalando o Reino (Localhost)

Siga os passos para invocar o servidor em sua máquina.

### Pré-requisitos
*   Node.js (O Motor de Mana)
*   MySQL (O Cofre do Tesouro)

### Invocação

1.  **Clone o Grimório**
    ```bash
    git clone https://github.com/Mattiiyyah/api_rpg.git
    cd api_rpg
    ```

2.  **Prepare os Ingredientes (Instalar)**
    ```bash
    npm install       # Backend
    cd web && npm install # Frontend
    ```

3.  **Configure o Ambiente (.env)**
    Crie um arquivo `.env` na raiz com as segredos do seu banco de dados (use `.env.example`).

4.  **Materialize o Mundo (Banco de Dados)**
    ```bash
    npx sequelize-cli db:create    # Cria o banco
    npx sequelize-cli db:migrate   # Cria as tabelas
    ```

5.  **Execute o Ritual**
    ```bash
    # Terminal 1 (Backend)
    npm start

    # Terminal 2 (Frontend)
    cd web && npm start
    ```

---

## 👨‍💻 O Mago Criador

Desenvolvido por **Matheus** 🛡️
> *Focado em Arquitetura Limpa, Segurança e Lógica Relacional.*

---
<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-Magic-purple?style=flat-square" alt="Made with Magic" />
</p>