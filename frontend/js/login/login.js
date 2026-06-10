var API_URL = "http://localhost:3000";

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('password');
const erroDiv = document.getElementById('errorMessage');
const tipoBtns = document.querySelectorAll('.type-btn');

function mesagemErro(mensagem) {
    erroDiv.textContent = mensagem;
    erroDiv.style.display = 'block';
    setTimeout(() => {
        erroDiv.style.display = 'none';
    }, 4500);
}

function loading(ativo) {
    const btn = document.querySelector('.btn-login');
    if (ativo) {
        btn.textContent = "Carregando...";
        btn.disabled = true;
    } else {
        btn.textContent = 'Entrar';
        btn.disabled = false;
    }
}

function ConfigurarUser() {
    for (let i = 0; i < tipoBtns.length; i++) {
        tipoBtns[i].addEventListener('click', function() {
            for (let j = 0; j < tipoBtns.length; j++) {
                tipoBtns[j].classList.remove('active');
            }
            this.classList.add('active');
        });
    }
}

function verificarLogin() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
        const usuario = JSON.parse(usuarioSalvo);
        const agora = new Date().getTime();
        const tempoLogado = agora - usuario.loginTime;
        const limite = 24 * 60 * 60 * 1000;
        
        if (tempoLogado < limite) {
            if (usuario.role === 'admin') {
                window.location.href = '../perfil-admin/home_admin.html';
            } else {
                window.location.href = '../perfil-user/home_user.html';
            }
        } else {
            localStorage.removeItem('usuarioLogado');
        }
    }
}

async function login(evento) {
    evento.preventDefault();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    
    let tipoUsuario = 'user';
    const ativo = document.querySelector('.type-btn.active');
    if (ativo) {
        tipoUsuario = ativo.dataset.type;
    }

    if (email === "" || senha === "") {
        mesagemErro("Preencha todos os campos");
        return;
    }

    loading(true);

    try {
        const resposta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha, tipoUsuario })
        });

        const dados = await resposta.json();

        if (resposta.status === 200 && dados.sucesso === true) {
            localStorage.setItem('usuarioLogado', JSON.stringify({
                id: dados.usuario.id,
                nome: dados.usuario.nome,
                email: dados.usuario.email,
                role: dados.usuario.role,
                setor: dados.usuario.setor,
                loginTime: new Date().getTime()
            }));

            if (dados.usuario.role === 'admin') {
                window.location.href = '../perfil-admin/home_admin.html';
            } else {
                window.location.href = '../perfil-user/home_user.html';
            }
        } else if (resposta.status === 403) {
            loading(false);
            mesagemErro("Este usuário não é administrador");
            senhaInput.value = "";
            emailInput.value = "";
        } else if (resposta.status === 401) {
            loading(false);
            mesagemErro("E-mail ou senha incorretos");
            senhaInput.value = "";
            emailInput.value = "";
        } else {
            loading(false);
            mesagemErro(dados.mensagem || "Erro ao realizar login");
        }
    } catch (erro) {
        loading(false);
        mesagemErro("Servidor Offline");
    }
}

if (form) {
    form.addEventListener('submit', login);
    ConfigurarUser();
    verificarLogin();
}