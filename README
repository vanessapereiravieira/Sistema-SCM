📌 SCM - Sistema de Controle e Manutenção

O SCM (Sistema de Controle e Manutenção) é uma aplicação web desenvolvida para centralizar e gerenciar solicitações internas de manutenção dentro de uma empresa.
O sistema permite que funcionários registrem chamados e que a equipe administrativa acompanhe, organize e resolva essas demandas de forma eficiente.

----

🚀 Funcionalidades

👤 Usuário
- Escolher perfil e fazer login
- Abrir chamados ou solicitações de manutenção
- Descrever o problema
- Acompanhar status dos chamados
- Visualizar histórico de solicitações

🛠️ Administrador
- Visualizar todos os chamados e manutenções
- Alterar status (Aberto, Em andamento, Concluído, Pendente e Cancelado)
- Gerenciar solicitações dos usuários
- Filtrar demandas por status e prioridade
- Acesso completo ao sistema

----

🧱 Tecnologias Utilizadas

Backend
- Node.js
- Express.js ^5
- MySQL / MySQL2
- Express Session
- Multer
- CORS
- Dotenv

Frontend
- HTML5
- CSS3
- JavaScript

----

📦 Instalação das dependências

As dependências do projeto já estão definidas no arquivo package.json.
Para instalar todas automaticamente, execute dentro da pasta backend:

</> Bash
npm install
----

🧱 Dependências utilizadas no projeto
. express (^5.2.1) → servidor backend
. mysql2 (^3.22.3) → conexão com banco de dados MySQL
. dotenv (^17.4.2) → variáveis de ambiente (.env)
. cors (^2.8.6) → comunicação entre frontend e backend
. express-session (^1.19.0) → autenticação por sessão
. multer (^2.1.1) → upload de arquivos

---

⚙️ Instalação manual

</> Bash
npm install express mysql2 dotenv cors express-session multer
---

📁 Estrutura do Projeto

SCM
│
├── backend
│   ├── config
│   ├── middlewares
│   ├── routes
│   ├── server
│   ├── uploads
│   │   └── manutencao
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package-lock.json
│   └── package.json
│
├── frontend
│   ├── images
│   ├── js
│   │   ├── funcoes-base
│   │   ├── login
│   │   ├── perfil-admin
│   │   └── perfil-user
│   │
│   ├── pages
│   │   ├── login
│   │   ├── perfil-admin
│   │   └── perfil-user
│   │
│   └── styles
│       ├── login
│       ├── perfil-admin
│       └── perfil-user
│
├── database
│   └── scm.sql
│
└── README.md

---

⚙️ Como executar o projeto

1️⃣ Clonar o repositório

</> Bash
git clone https://github.com/vanessapereiravieira/Sistema-SCM.git
-----

2️⃣ Acessar o projeto

</> Bash
cd Sistema-SCM
----

3️⃣ Instalar dependências do backend

</> Bash
cd backend
npm install
-----

⚙️ Configuração do banco de dados (MySQL)

4️⃣ Criar o banco de dados

</> SQL
CREATE DATABASE scm;
----

5️⃣ Importar o arquivo .sql

✔️ Terminal:
- mysql -u root -p scm < database/scm.sql

✔️ MySQL Workbench:
- Server > Data Import
- Selecionar scm.sql
- Escolher banco scm
- Start Import

6️⃣ Configurar variáveis de ambiente (.env)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=scm
DB_PORT=3306

SESSION_SECRET=sua_chave_secreta
PORT=3000

7️⃣ Rodar o servidor

</> Bash
node server.js
----

8️⃣ Acessar o sistema

Abra no navegador:
http://localhost:3000

---

🔐 Autenticação

O sistema utiliza autenticação baseada em session + localStorage.

---

🔐 Usuários de teste (ambiente local)

Após importar o banco de dados (scm.sql), o sistema já vem com usuários pré-cadastrados para testes.

👤 Usuário comum

- email: contato.vanessapereira06@gmail.com
- senha: Nessa@06

🛠️ Administrador

- email: iedro.santos@ba.estudante.senai.br
- senha: iedro@01

⚠️ Observação: Esses usuários são utilizados apenas em ambiente local (banco de testes).

---

🎯 Objetivo do Projeto
- Desenvolvimento full-stack
- Integração frontend e backend
- Uso de MySQL em sistemas reais
- Organização de sistema de chamados

---

👨‍💻 Equipe
Back-End: Vanessa Pereira
Front-End: Iedro Lucas
Documentação: Maivily Nascimento