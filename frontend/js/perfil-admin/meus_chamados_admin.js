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

// Verificar se é admin
if (USUARIO_ROLE !== 'admin') {
    window.location.href = '../../pages/perfil-user/meus_chamados_user.html';
}

// ========== VARIAVEIS PRINCIPAIS ==========
let chamados = [];
let filtroStatusAtual = null;

// Carrega o contador de excluídos do localStorage ou inicia como 0
let contadorExcluidos = localStorage.getItem('contadorExcluidos_admin');
if (contadorExcluidos === null) {
    contadorExcluidos = 0;
} else {
    contadorExcluidos = parseInt(contadorExcluidos);
}

// Array para armazenar os chamados excluídos
let chamadosExcluidos = localStorage.getItem('chamadosExcluidos_admin');
if (chamadosExcluidos === null) {
    chamadosExcluidos = [];
} else {
    chamadosExcluidos = JSON.parse(chamadosExcluidos);
}

// ========== FUNÇÃO PARA PEGAR CLASSE DE STATUS ==========
function getStatusClass(status) {
    if (status === "Aberto") {
        return "status-aberto";
    } else if (status === "Em andamento") {
        return "status-andamento";
    } else if (status === "Concluído") {
        return "status-concluido";
    } else if (status === "Cancelado") {
        return "status-cancelado";
    } else if (status === "Excluído") {
        return "status-excluido";
    }
    return "";
}

// ========== FUNÇÃO PARA PEGAR CLASSE DE URGÊNCIA ==========
function getUrgenciaClass(urgencia) {
    if (urgencia === "Baixa") {
        return "urgencia-baixa";
    } else if (urgencia === "Média") {
        return "urgencia-media";
    } else if (urgencia === "Alta") {
        return "urgencia-alta";
    }
    return "";
}

// ========== MOSTRAR ESTATISTICAS (CONTADORES) ==========
function mostrarEstatisticas() {
    const statsContainer = document.getElementById('statsContainer');
    
    if (statsContainer === null) {
        return;
    }
    
    let total = 0;
    let abertos = 0;
    let emAndamento = 0;
    let concluidos = 0;
    let cancelados = 0;
    
    for (let i = 0; i < chamados.length; i++) {
        const status = chamados[i].status;
        
        total = total + 1;
        
        if (status === "Aberto") {
            abertos = abertos + 1;
        } else if (status === "Em andamento") {
            emAndamento = emAndamento + 1;
        } else if (status === "Concluído") {
            concluidos = concluidos + 1;
        } else if (status === "Cancelado") {
            cancelados = cancelados + 1;
        }
    }
    
    statsContainer.innerHTML = `
        <div class="stat-card" onclick="filtrarPorStatus(null)">
            <div class="stat-number" style="color: #afafaf;">${total}</div>
            <div class="stat-label">Total</div>
        </div>
        <div class="stat-card" onclick="filtrarPorStatus('Aberto')">
            <div class="stat-number" style="color: #2196f3;">${abertos}</div>
            <div class="stat-label">Aberto</div>
        </div>
        <div class="stat-card" onclick="filtrarPorStatus('Em andamento')">
            <div class="stat-number" style="color: #ffc107;">${emAndamento}</div>
            <div class="stat-label">Em andamento</div>
        </div>
        <div class="stat-card" onclick="filtrarPorStatus('Concluído')">
            <div class="stat-number" style="color: #2ecc71;">${concluidos}</div>
            <div class="stat-label">Concluído</div>
        </div>
        <div class="stat-card" onclick="filtrarPorStatus('Cancelado')">
            <div class="stat-number" style="color: #ff9800;">${cancelados}</div>
            <div class="stat-label">Cancelado</div>
        </div>
        <div class="stat-card" onclick="filtrarPorStatus('Excluído')">
            <div class="stat-number" style="color: #e74c3c;">${contadorExcluidos}</div>
            <div class="stat-label">Excluído</div>
        </div>
    `;
    
    const statCards = document.querySelectorAll('.stat-card');
    if (filtroStatusAtual === null) {
        if (statCards[0]) {
            statCards[0].classList.add('stat-card-ativo');
        }
    } else {
        const index = getStatusIndex(filtroStatusAtual);
        if (statCards[index]) {
            statCards[index].classList.add('stat-card-ativo');
        }
    }
}

function getStatusIndex(status) {
    if (status === 'Aberto') {
        return 1;
    } else if (status === 'Em andamento') {
        return 2;
    } else if (status === 'Concluído') {
        return 3;
    } else if (status === 'Cancelado') {
        return 4;
    } else if (status === 'Excluído') {
        return 5;
    } else {
        return 0;
    }
}

// ========== FUNÇÃO PARA FILTRAR POR STATUS ==========
function filtrarPorStatus(status) {
    filtroStatusAtual = status;
    
    const statCards = document.querySelectorAll('.stat-card');
    for (let i = 0; i < statCards.length; i++) {
        statCards[i].classList.remove('stat-card-ativo');
    }
    
    if (status === null) {
        if (statCards[0]) {
            statCards[0].classList.add('stat-card-ativo');
        }
    } else {
        const index = getStatusIndex(status);
        if (statCards[index]) {
            statCards[index].classList.add('stat-card-ativo');
        }
    }
    
    aplicarFiltroStatus();
}

// ========== APLICAR FILTRO NOS CHAMADOS ==========
function aplicarFiltroStatus() {
    const grid = document.getElementById("chamadosGrid");
    
    if (filtroStatusAtual === "Excluído") {
        if (chamadosExcluidos.length === 0) {
            grid.innerHTML = `<div class="sem-chamados">Nenhum chamado excluído encontrado</div>`;
            return;
        }
        
        let html = "";
        for (let i = 0; i < chamadosExcluidos.length; i++) {
            const c = chamadosExcluidos[i];
            
            const data = new Date(c.criado_em);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            const dataExclusao = new Date(c.data_exclusao);
            const dataExclusaoFormatada = dataExclusao.toLocaleDateString('pt-BR');
            
            const statusClass = getStatusClass("Excluído");
            
            html = html + `
                <div class="chamado-card excluido-card">
                    <div class="card-header">
                        <span class="status-badge ${statusClass}">Status: Excluído</span>
                        <span class="urgencia-badge ${getUrgenciaClass(c.urgencia)}">Urgência: ${c.urgencia}</span>
                    </div>
                    <div class="chamado-id">#${c.id}</div>
                    <div class="chamado-titulo">${c.nome}</div>
                    <div class="chamado-data">Criado: ${dataFormatada}</div>
                    <div class="chamado-descricao">${c.descricao}</div>
                    <div class="excluido-info">
                        <span class="tag-local">Excluído em: ${dataExclusaoFormatada}</span>
                    </div>
                    <div class="tags-container">
                        <span class="tag-local">Local: ${c.local}: ${c.nome_sala}</span>
                        <span class="tag-categoria">Categoria: ${c.categoria}</span>
                    </div>
                </div>
            `;
        }
        
        grid.innerHTML = html;
        return;
    }
    
    let chamadosFiltrados = chamados;
    
    if (filtroStatusAtual !== null) {
        chamadosFiltrados = [];
        for (let i = 0; i < chamados.length; i++) {
            if (chamados[i].status === filtroStatusAtual) {
                chamadosFiltrados.push(chamados[i]);
            }
        }
    }
    
    let html = "";
    let contador = 0;
    
    for (let i = 0; i < chamadosFiltrados.length; i++) {
        contador = contador + 1;
        const c = chamadosFiltrados[i];
        
        const data = new Date(c.criado_em);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        const statusClass = getStatusClass(c.status);
        const urgenciaClass = getUrgenciaClass(c.urgencia);
        
        let disabledAttr = "";
        
        if (c.status === "Cancelado" || c.status === "Concluído") {
            disabledAttr = "disabled style='opacity:0.5;cursor:not-allowed'";
        }
        
        html = html + `
            <div class="chamado-card">
                <div class="card-header">
                    <span class="status-badge ${statusClass}">Status: ${c.status}</span>
                    <span class="urgencia-badge ${urgenciaClass}">Urgência: ${c.urgencia}</span>
                </div>
                <div class="chamado-id">#${c.id}</div>
                <div class="chamado-titulo">${c.nome}</div>
                <div class="chamado-data">${dataFormatada}</div>
                <div class="chamado-descricao">${c.descricao}</div>
                <div class="tags-container">
                    <span class="tag-local">Local: ${c.nome_sala}</span>
                    <span class="tag-categoria">Categoria: ${c.categoria}</span>
                </div>
                <div class="card-botoes">
                    <button class="btn-card btn-excluir" onclick="excluirChamado(${c.id})">Excluir</button>
                    <button class="btn-card btn-editar" onclick="editarChamado(${c.id})" ${disabledAttr}>Editar</button>
                </div>
            </div>
        `;
    }
    
    if (contador === 0) {
        let mensagem = "";
        if (filtroStatusAtual !== null) {
            mensagem = `Nenhum chamado com status "${filtroStatusAtual}" encontrado`;
        } else {
            mensagem = "Nenhum chamado encontrado";
        }
        grid.innerHTML = `<div class="sem-chamados">${mensagem}</div>`;
    } else {
        grid.innerHTML = html;
    }
}

function mostrarChamados() {
    filtroStatusAtual = null;
    aplicarFiltroStatus();
}

// ========== CARREGAR CHAMADOS ==========
async function carregarChamados() {
    if (!USUARIO_ID) {
        alert("Faça login para ver seus chamados");
        window.location.href = "../../pages/login/login.html";
        return;
    }
    
    try {
        const resposta = await fetch(`${API_URL}/meus-chamados?usuario_id=${USUARIO_ID}`, {
            method: 'GET'
        });
        
        if (!resposta.ok) {
            throw new Error("Erro ao carregar chamados");
        }
        
        chamados = await resposta.json();
        
        console.log("Chamados carregados:", chamados);
        
        mostrarEstatisticas();
        mostrarChamados();
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao carregar chamados");
    }
}

// ========== EXCLUIR CHAMADO ==========
async function excluirChamado(id) {
    const confirmado = confirm("Tem certeza que deseja excluir permanentemente este chamado? Esta ação não pode ser desfeita.");
    
    if (!confirmado) {
        return;
    }
    
    try {
        const resposta = await fetch(`${API_URL}/novo-chamado/${id}`, {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: USUARIO_ID })
        });
        
        const resultado = await resposta.json();
        
        if (resposta.ok) {
            let chamadoRemovido = null;
            for (let i = 0; i < chamados.length; i++) {
                if (chamados[i].id === id) {
                    chamadoRemovido = chamados[i];
                    break;
                }
            }
            
            if (chamadoRemovido !== null) {
                chamadoRemovido.data_exclusao = new Date().toISOString();
                chamadosExcluidos.push(chamadoRemovido);
                contadorExcluidos = contadorExcluidos + 1;
                
                localStorage.setItem('contadorExcluidos_admin', contadorExcluidos);
                localStorage.setItem('chamadosExcluidos_admin', JSON.stringify(chamadosExcluidos));
            }
            
            const novosChamados = [];
            for (let i = 0; i < chamados.length; i++) {
                if (chamados[i].id !== id) {
                    novosChamados.push(chamados[i]);
                }
            }
            chamados = novosChamados;
            
            alert(resultado.mensagem);
            
            mostrarEstatisticas();
            aplicarFiltroStatus();
        } else {
            alert(resultado.mensagem);
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao excluir chamado");
    }
}

// ========== EDITAR CHAMADO ==========
function editarChamado(id) {
    window.location.href = `novo_chamado_admin.html?editar=${id}`;
}


// ========== AGUARDAR DOM CARREGAR ==========
document.addEventListener('DOMContentLoaded', function() {
    carregarChamados();
});

// Exportar funções para o escopo global
window.excluirChamado = excluirChamado;
window.editarChamado = editarChamado;
window.filtrarPorStatus = filtrarPorStatus;
