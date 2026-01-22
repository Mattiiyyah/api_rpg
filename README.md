# 🏰 API RPG - The Backend Grimoire

> *"Onde requisições viram missões e dados se tornam lendas."*

[![Status](https://img.shields.io/badge/Status-Backend_Completed-success?style=for-the-badge&logo=check)](https://github.com/seu-usuario/seu-repo)
[![Node.js](https://img.shields.io/badge/Node.js-green?style=flat&logo=node.js)](https://nodejs.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-blue?style=flat&logo=sequelize)](https://sequelize.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-orange?style=flat&logo=mysql)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-black?style=flat&logo=json-web-tokens)](https://jwt.io/)

## 🚧 Obra em Andamento (Work in Progress)

O "Motor do Reino" (Backend) está finalizado e funcional! ⚙️✅

No entanto, a **Interface Visual** (o portal mágico onde os jogadores clicarão nos botões) ainda não foi construída.
**O próximo passo desta jornada será o desenvolvimento do Frontend utilizando REACT.JS.** ⚛️

## 📖 Sobre o Projeto

Este projeto não é apenas uma API RESTful comum. É uma **gamificação de conceitos avançados de Backend**.

Ao invés de criar um sistema entediante de "Admin" e "Funcionário", transformamos a lógica de negócios em um Reino Medieval. O objetivo foi estudar e implementar relacionamentos complexos de banco de dados, validações robustas e sistemas de segurança (ACL) de uma forma divertida e intuitiva.

### 🧠 A Filosofia (Por que RPG?)
Backend é sobre gerenciar regras e recursos. Um RPG é a representação perfeita disso:
* **Segurança (ACL):** Quem manda no reino? (Rei vs Súdito).
* **Relacionamento 1:N:** Um herói tem vários itens na mochila (Artefatos).
* **Relacionamento N:N:** Vários magos aprendem a mesma magia, mas cada um tem seu nível de proficiência (Skills).

---

## 🛡️ A Hierarquia do Reino (Roles & ACL)

O sistema de segurança utiliza **JWT (JSON Web Tokens)** e um middleware personalizado de verificação de cargos. Para testar todas as funcionalidades, você deve entender as classes sociais do sistema:

| Cargo (Role) | Descrição | Permissões |
| :--- | :--- | :--- |
| **👑 KING** | O Admin Supremo. | Pode Criar, Editar e **Excluir** qualquer dado (Itens, Skills, Usuários). É o único que pode "alterar a realidade" (Deletar/Editar Skills). |
| **🧙‍♂️ MASTER** | O Gerente do Jogo. | Pode **Criar** novos Artefatos e Skills para o mundo, mas não pode apagá-los (apenas o Rei bane magias do grimório). |
| **⚔️ ADVENTURER** | O Usuário Padrão. | Pode ver itens, ver skills e **aprender/equipar** coisas. Não pode criar itens globais, apenas gerenciar seu próprio inventário. |

> **⚠️ Importante:** O campo `role` no banco de dados espera as strings exatas: `'KING'`, `'MASTER'` ou `'ADVENTURER'`.

---

## ⚔️ Funcionalidades Técnicas

### 1. Sistema de Inventário (1:N)
* Relacionamento **Um-para-Muitos**.
* Um Usuário pode possuir vários **Artefatos**.
* **Cascade:** Ao deletar o usuário, os itens ficam "dropados" (sem dono) no banco (`SET NULL`), simulando um drop de loot.

### 2. O Grimório de Habilidades (N:N)
* Relacionamento **Muitos-para-Muitos** completo.
* Tabela pivô `user_skills` contendo atributos extras (Nível de Maestria).
* Lógica de "Aprender Magia":
    * Verifica se a magia existe.
    * Verifica se o usuário já sabe a magia (impede duplicidade).
    * Registra o aprendizado na tabela de junção com validações de nível.

### 3. "Inspect" System (Privacidade)
* Rota de visualização de perfil inteligente (`GET /users/:id`).
* **Lógica de Visão:**
    * Se você olha seu próprio perfil ou é Admin (Master/King): Vê tudo (incluindo E-mail).
    * Se você olha o perfil de outro jogador: Vê apenas Nome, Cargo, Artefatos e Skills (O E-mail é ocultado automaticamente para privacidade).

---

## 🛠️ Instalação e Configuração

Siga os passos abaixo para levantar o reino na sua máquina:

### 1. Clone o repositório
```bash
git clone https://github.com/Mattiiyyah/api_rpg
cd api-rpg
```
### 2. Instale as dependências
```bash
npm install
```
### 3. Configure o Ambiente (.env)
Crie um arquivo .env na raiz do projeto (use o .env.example como base) e configure seu banco de dados MySQL:
```bash
DATABASE=rpg_db
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=sua_senha
TOKEN_SECRET=um_segredo_muito_forte_aqui
TOKEN_EXPIRATION=7d
```

### 4. Crie o Banco de Dados
```bash
# Cria a estrutura das tabelas no MySQL
npx sequelize db:migrate
```
### 5. Crie o Primeiro Rei (Seed)
```bash
INSERT INTO users (nome, email, password_hash, role, created_at, updated_at) 
VALUES ('Arthur', 'rei@reino.com', 'HASH_DA_SENHA', 'KING', NOW(), NOW());
```

### 6. Rode a API
```bash
npm run dev
```

## 🧪 Rotas Principais (Insomnia/Postman)

### 🚪 Autenticação
* `POST /tokens`: Fazer Login (Recebe Token JWT).

### 👤 Usuários
* `POST /users`: Criar conta (Nasce como ADVENTURER).
* `GET /users/:id`: Ver perfil (Sistema de Inspect).
* `PUT /users`: Editar próprios dados.

### 🎒 Artefatos
* `POST /artefatos`: Criar Item (Requer MASTER ou KING).
* `GET /artefatos`: Listar todos os itens e seus donos.

### 📜 Skills (Habilidades)
* `POST /skills`: Criar nova Magia (Requer MASTER ou KING).
* `PUT /skills/:id`: Editar Magia (Requer KING).
* `POST /skills/:id/aprender`: Usuário atual aprende a magia (Relacionamento N:N).

---

## 👨‍💻 Autor

Desenvolvido por **Matheus** 🛡️  
*Focado em Arquitetura Limpa, Segurança e Lógica Relacional.*

> *"Todo código é uma magia, todo programador é um mago."* 🧙‍♂️✨