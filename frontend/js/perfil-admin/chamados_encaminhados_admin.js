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
const USUARIO_SETOR = USUARIO.setor;

console.log({
    id: USUARIO_ID,
    role: USUARIO_ROLE,
    setor: USUARIO_SETOR
});

// Verificar se é admin
if (USUARIO_ROLE !== 'admin') {
    window.location.href = '../../pages/user/chamados_encaminhados_user.html';
}

// ========== VARIAVEIS PRINCIPAIS ==========
let chamados = [];
let filtroStatusAtual = null;

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
    
    if (!statsContainer) return;
    
    let total = chamados.length;
    let abertos = chamados.filter(c => c.status === "Aberto").length;
    let emAndamento = chamados.filter(c => c.status === "Em andamento").length;
    let concluidos = chamados.filter(c => c.status === "Concluído").length;
    let cancelados = chamados.filter(c => c.status === "Cancelado").length;
    
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
    `;
    
    const statCards = document.querySelectorAll('.stat-card');
    if (filtroStatusAtual === null) {
        if (statCards[0]) statCards[0].classList.add('stat-card-ativo');
    } else {
        const index = getStatusIndex(filtroStatusAtual);
        if (statCards[index]) statCards[index].classList.add('stat-card-ativo');
    }
}

function getStatusIndex(status) {
    if (status === 'Aberto') return 1;
    if (status === 'Em andamento') return 2;
    if (status === 'Concluído') return 3;
    if (status === 'Cancelado') return 4;
    return 0;
}

// ========== FUNÇÃO PARA FILTRAR POR STATUS ==========
function filtrarPorStatus(status) {
    filtroStatusAtual = status;
    
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => card.classList.remove('stat-card-ativo'));
    
    if (status === null) {
        if (statCards[0]) statCards[0].classList.add('stat-card-ativo');
    } else {
        const index = getStatusIndex(status);
        if (statCards[index]) statCards[index].classList.add('stat-card-ativo');
    }
    
    aplicarFiltroStatus();
}

// ========== APLICAR FILTRO NOS CHAMADOS ==========
function aplicarFiltroStatus() {
    const grid = document.getElementById("chamadosGrid");
    
    let chamadosFiltrados = chamados;
    if (filtroStatusAtual !== null) {
        chamadosFiltrados = chamados.filter(c => c.status === filtroStatusAtual);
    }
    
    if (chamadosFiltrados.length === 0) {
        grid.innerHTML = `<div class="sem-chamados">Nenhum chamado encontrado</div>`;
        return;
    }
    
    let html = "";
    for (const c of chamadosFiltrados) {
        const data = new Date(c.criado_em);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        const statusClass = getStatusClass(c.status);
        const urgenciaClass = getUrgenciaClass(c.urgencia);
        
        html += `
            <div class="chamado-card">
                <div class="card-header">
                    <span class="status-badge ${statusClass}">${c.status}</span>
                    <span class="urgencia-badge ${urgenciaClass}">Urgência: ${c.urgencia}</span>
                </div>
                <div class="chamado-id">#${c.id}</div>
                <div class="chamado-titulo">${c.nome}</div>
                <div class="chamado-info">
                    <span>Criado por: ${c.criador_nome || 'Usuário'} (${c.criador_setor || 'N/A'})</span>
                    <span>${dataFormatada}</span>
                </div>
                <div class="chamado-descricao">${c.descricao}</div>
                <div class="tags-container">
                    <span class="tag-local">Local: ${c.nome_sala}</span>
                    <span class="tag-categoria">Categoria: ${c.categoria}</span>
                    <span class="tag-destino">Destino: ${c.setor_destino}</span>
                </div>
                <div class="admin-actions">
                    <div class="form-group-status">
                        <label for="status-${c.id}">Status:</label>
                        <select id="status-${c.id}" class="status-select" onchange="alterarStatus(${c.id}, this.value)">
                            <option value="Aberto" ${c.status === "Aberto" ? 'selected' : ''}>Aberto</option>
                            <option value="Em andamento" ${c.status === "Em andamento" ? 'selected' : ''}>Em andamento</option>
                            <option value="Concluído" ${c.status === "Concluído" ? 'selected' : ''}>Concluído</option>
                            <option value="Cancelado" ${c.status === "Cancelado" ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

// ========== ALTERAR STATUS DO CHAMADO ==========
async function alterarStatus(chamadoId, novoStatus) {
    // Verificar se o status realmente mudou
    const chamado = chamados.find(c => c.id === chamadoId);
    if (chamado && chamado.status === novoStatus) {
        return; // Não faz nada se for o mesmo status
    }
    
    // Confirmação antes de alterar (opcional)
    const confirmar = confirm(`Deseja alterar o status do chamado #${chamadoId} para "${novoStatus}"?`);
    if (!confirmar) {
        // Se cancelar, recarregar o select para o valor original
        const select = document.getElementById(`status-${chamadoId}`);
        if (select && chamado) {
            select.value = chamado.status;
        }
        return;
    }
    
    try {
        const resposta = await fetch(`${API_URL}/novo-chamado/${chamadoId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: novoStatus,
                role: USUARIO_ROLE
            })
        });
        
        if (resposta.ok) {
            const resultado = await resposta.json();
            alert(resultado.mensagem || 'Status atualizado com sucesso');
            // Recarregar a lista de chamados
            await carregarTodosChamados();
        } else {
            const erro = await resposta.json();
            alert(erro.mensagem || 'Erro ao atualizar status');
            // Recarregar para voltar ao status original
            await carregarTodosChamados();
        }
    } catch (erro) {
        console.error("Erro ao alterar status:", erro);
        alert('Erro ao conectar com o servidor');
        // Recarregar para voltar ao status original
        await carregarTodosChamados();
    }
}

// ========== CARREGAR TODOS OS CHAMADOS (ADMIN) ==========
async function carregarTodosChamados() {
    try {
        // Usando o endpoint correto que já trata admin vs user
        const url = `${API_URL}/chamados-encaminhados?usuario_id=${USUARIO_ID}&role=${USUARIO_ROLE}&setor=${USUARIO_SETOR}`;
        console.log('Admin buscando todos os chamados:', url);
        
        const resposta = await fetch(url);
        
        if (!resposta.ok) {
            throw new Error("Erro ao carregar chamados");
        }
        
        chamados = await resposta.json();
        console.log("Todos os chamados carregados:", chamados);
        
        mostrarEstatisticas();
        aplicarFiltroStatus();
        
    } catch (erro) {
        console.error("Erro:", erro);
        document.getElementById("chamadosGrid").innerHTML = 
            '<div class="sem-chamados">Erro ao carregar chamados</div>';
    }
}

// ========== INICIAR ==========
function inicializar() {
    carregarTodosChamados();
}

// Aguardar o DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

// Exportar funções para o escopo global
window.filtrarPorStatus = filtrarPorStatus;
window.alterarStatus = alterarStatus;