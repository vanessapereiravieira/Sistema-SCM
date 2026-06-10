// ========== VARIÁVEIS PRÓPRIAS ==========
var API_URL = "http://localhost:3000";

// ========== VERIFICAR LOGIN ==========
const usuarioSalvo = localStorage.getItem('usuarioLogado');
if (!usuarioSalvo) {
    window.location.href = '../../pages/login/login.html';
}
const USUARIO = JSON.parse(usuarioSalvo);
const USUARIO_ID = USUARIO.id;
const USUARIO_ROLE = USUARIO.role;

// Verificar se é user
if (USUARIO_ROLE !== 'user') {
    window.location.href = '../../pages/perfil-admin/novo_chamado_admin.html';
}


// ========== FUNÇÕES DO FORMULÁRIO ==========
let chamadoEditandoId = null;

function mostrarMensagem(mensagem, ehErro) {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMsg';
        toast.className = 'toast-message';
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.classList.remove('error', 'show');
    if (ehErro) {
        toast.classList.add('error');
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function atualizarOpcoesLocal() {
    const campoLocalTipo = document.getElementById('localTipo');
    const campoLocalOpcao = document.getElementById('localOpcao');
    const grupoLocalOpcao = document.getElementById('localOpcaoGroup');
    const labelLocalOpcao = document.getElementById('localOpcaoLabel');
    
    if (!campoLocalTipo) return;
    
    const tipoSelecionado = campoLocalTipo.value;
    
    if (tipoSelecionado === '') {
        if (grupoLocalOpcao) {
            grupoLocalOpcao.style.display = 'none';
        }
        if (campoLocalOpcao) {
            campoLocalOpcao.removeAttribute('required');
        }
        if (campoLocalOpcao) {
            campoLocalOpcao.value = '';
        }
        return;
    }
    
    if (grupoLocalOpcao) {
        grupoLocalOpcao.style.display = 'block';
    }
    if (campoLocalOpcao) {
        campoLocalOpcao.setAttribute('required', 'required');
    }
    
    if (tipoSelecionado === 'sala') {
        if (labelLocalOpcao) {
            labelLocalOpcao.textContent = 'Número da sala *';
        }
        if (campoLocalOpcao) {
            campoLocalOpcao.innerHTML = `
                <option value="" disabled selected>Selecione a sala</option>
                <option value="Sala 10">Sala 10</option>
                <option value="Sala 11">Sala 11</option>
                <option value="Sala 12">Sala 12</option>
                <option value="Sala 13">Sala 13</option>
                <option value="Sala 14">Sala 14</option>
                <option value="Sala 15">Sala 15</option>
            `;
        }
    } else if (tipoSelecionado === 'laboratorio') {
        if (labelLocalOpcao) {
            labelLocalOpcao.textContent = 'Laboratório *';
        }
        if (campoLocalOpcao) {
            campoLocalOpcao.innerHTML = `
                <option value="" disabled selected>Selecione o laboratório</option>
                <option value="Laboratório de Informática">Laboratório de Informática</option>
                <option value="Laboratório de Química">Laboratório de Química</option>
                <option value="Laboratório de Logística">Laboratório de Logística</option>
                <option value="Laboratório Maker">Laboratório Maker</option>
                <option value="Laboratório de Eletrotécnica">Laboratório de Eletrotécnica</option>
            `;
        }
    }
}

function limparFormulario() {
    const formularioChamado = document.getElementById('chamadoForm');
    const grupoLocalOpcao = document.getElementById('localOpcaoGroup');
    
    if (formularioChamado) {
        formularioChamado.reset();
    }
    chamadoEditandoId = null;
    if (grupoLocalOpcao) {
        grupoLocalOpcao.style.display = 'none';
    }
}

function validarFormulario() {
    const campoNomeChamado = document.getElementById('nomeChamado');
    const campoCategoria = document.getElementById('categoria');
    const campoDescricao = document.getElementById('descricao');
    const campoLocalTipo = document.getElementById('localTipo');
    const campoLocalOpcao = document.getElementById('localOpcao');
    const campoUrgencia = document.getElementById('urgencia');
    
    if (!campoNomeChamado.value.trim()) { 
        mostrarMensagem("Informe o nome do chamado", true); 
        return false; 
    }
    if (!campoCategoria.value) { 
        mostrarMensagem("Selecione uma categoria", true); 
        return false; 
    }
    if (!campoDescricao.value.trim()) { 
        mostrarMensagem("Descreva o problema", true); 
        return false; 
    }
    if (!campoLocalTipo.value) { 
        mostrarMensagem("Selecione o tipo de local", true); 
        return false; 
    }
    if (!campoLocalOpcao.value) { 
        mostrarMensagem("Selecione o local específico", true); 
        return false; 
    }
    if (!campoUrgencia.value) { 
        mostrarMensagem("Selecione a urgência", true); 
        return false; 
    }
    return true;
}

async function enviarChamado(evento) {
    evento.preventDefault();
    if (!validarFormulario()) return;

    const campoNomeChamado = document.getElementById('nomeChamado');
    const campoCategoria = document.getElementById('categoria');
    const campoDescricao = document.getElementById('descricao');
    const campoLocalTipo = document.getElementById('localTipo');
    const campoLocalOpcao = document.getElementById('localOpcao');
    const campoUrgencia = document.getElementById('urgencia');

    const dados = {
    nomeChamado: campoNomeChamado.value.trim(),
    categoria: campoCategoria.value,
    descricao: campoDescricao.value.trim(),
    tipoLocal: campoLocalTipo.value,
    nome_sala: campoLocalOpcao.value,
    urgencia: campoUrgencia.value,
    usuario_id: USUARIO_ID
    };

    console.log("Dados enviados:", dados);

    try {
        let url;
        let metodo;
        
        if (chamadoEditandoId) {
            url = `${API_URL}/novo-chamado/${chamadoEditandoId}`;
            metodo = 'PUT';
        } else {
            url = `${API_URL}/novo-chamado`;
            metodo = 'POST';
        }
        
        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        const resultado = await resposta.json();
        
        if (resposta.ok) {
            mostrarMensagem(resultado.mensagem);
            limparFormulario();
            setTimeout(() => window.location.href = 'meus_chamados_user.html', 1500);
        } else {
            let mensagemErro = resultado.mensagem;
            if (!mensagemErro) {
                mensagemErro = "Erro ao processar chamado";
            }
            mostrarMensagem(mensagemErro, true);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro de conexão com o servidor', true);
    }
}

async function carregarChamadoParaEdicao() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('editar');

    if (!id) return;

    try {
        const resposta = await fetch(
            `${API_URL}/meus-chamados?usuario_id=${USUARIO_ID}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao carregar chamados");
        }

        const chamados = await resposta.json();
        const chamado = chamados.find(c => c.id == id);

        if (!chamado) {
            mostrarMensagem("Chamado não encontrado", true);
            return;
        }

        chamadoEditandoId = chamado.id;

        document.getElementById('nomeChamado').value = chamado.nome || '';
        document.getElementById('descricao').value = chamado.descricao || '';
        document.getElementById('categoria').value = chamado.categoria || '';
        document.getElementById('urgencia').value = chamado.urgencia || '';

        // Define o tipo de local
        const campoLocalTipo = document.getElementById('localTipo');

        if (chamado.local) {
            campoLocalTipo.value = chamado.local.toLowerCase();
        }

        // Atualiza opções do select de local
        atualizarOpcoesLocal();

        // Aguarda o select ser preenchido
        setTimeout(() => {
            const campoLocalOpcao = document.getElementById('localOpcao');

            if (campoLocalOpcao && chamado.nome_sala) {
                campoLocalOpcao.value = chamado.nome_sala;
            }
        }, 100);

        console.log("Chamado carregado:", chamado);

    } catch (erro) {
        console.error("Erro:", erro);
        mostrarMensagem("Erro ao carregar chamado", true);
    }
}

// ========== CONFIGURAR EVENTOS QUANDO O DOM CARREGAR ==========
document.addEventListener('DOMContentLoaded', function() {
    const campoLocalTipo = document.getElementById('localTipo');
    const formularioChamado = document.getElementById('chamadoForm');
    
    if (campoLocalTipo) {
        campoLocalTipo.addEventListener('change', atualizarOpcoesLocal);
    } else {
        console.log('Elemento localTipo não encontrado, mas pode ser normal se não houver formulário');
    }
    
    if (formularioChamado) {
        formularioChamado.addEventListener('submit', enviarChamado);
        carregarChamadoParaEdicao();
    }
});