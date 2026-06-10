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

// Verificar se é user
if (USUARIO_ROLE !== 'user') {
    window.location.href = '../../pages/perfil-admin/manutencoes_encaminhadas_admin.html';
}

// ========== VARIAVEIS PRINCIPAIS ==========
let manutencoes = [];
let filtroStatusAtual = null;

// ========== FUNÇÃO PARA FORMATAR DATA ==========
function formatarData(data) {
    if (!data) {
        return 'Data nao informada';
    }
    const date = new Date(data);
    if (isNaN(date.getTime())) {
        return 'Data invalida';
    }
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
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
    } else if (status === "Pendente") {
        return "status-pendente";
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

// ========== FUNÇÃO PARA OBTER TEXTO DE PERIODICIDADE ==========
function getPeriodicidadeText(periodicidade) {
    var periodicidadeLower = "";
    
    if (periodicidade) {
        periodicidadeLower = periodicidade.toLowerCase();
    }
    
    if (periodicidadeLower === "unica" || periodicidadeLower === "unico") {
        return "Unica";
    } else if (periodicidadeLower === "semanal") {
        return "Semanal";
    } else if (periodicidadeLower === "mensal") {
        return "Mensal";
    } else if (periodicidadeLower === "trimestral") {
        return "Trimestral";
    } else if (periodicidadeLower === "semestral") {
        return "Semestral";
    } else if (periodicidadeLower === "anual") {
        return "Anual";
    } else if (periodicidade) {
        return periodicidade;
    }
    
    return "Nao definida";
}

// ========== MOSTRAR ESTATISTICAS (CONTADORES) ==========
function mostrarEstatisticas() {
    const statsContainer = document.getElementById('statsContainer');
    
    if (!statsContainer) {
        return;
    }
    
    let total = manutencoes.length;
    let abertos = 0;
    let emAndamento = 0;
    let concluidos = 0;
    let cancelados = 0;
    let pendentes = 0;
    
    for (let i = 0; i < manutencoes.length; i++) {
        const m = manutencoes[i];
        if (m.status === "Aberto") {
            abertos++;
        } else if (m.status === "Em andamento") {
            emAndamento++;
        } else if (m.status === "Concluído") {
            concluidos++;
        } else if (m.status === "Cancelado") {
            cancelados++;
        } else if (m.status === "Pendente") {
            pendentes++;
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
        <div class="stat-card" onclick="filtrarPorStatus('Pendente')">
            <div class="stat-number" style="color: #9c27b0;">${pendentes}</div>
            <div class="stat-label">Pendente</div>
        </div>
        <div class="stat-card" onclick="filtrarPorStatus('Concluído')">
            <div class="stat-number" style="color: #2ecc71;">${concluidos}</div>
            <div class="stat-label">Concluido</div>
        </div>
        <div class="stat-card" onclick="filtrarPorStatus('Cancelado')">
            <div class="stat-number" style="color: #ff9800;">${cancelados}</div>
            <div class="stat-label">Cancelado</div>
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
    }
    if (status === 'Em andamento') {
        return 2;
    }
    if (status === 'Pendente') {
        return 3;
    }
    if (status === 'Concluído') {
        return 4;
    }
    if (status === 'Cancelado') {
        return 5;
    }
    return 0;
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

// ========== ABRIR MODAL DA IMAGEM ==========
function abrirModalImagem(url) {
    let modal = document.getElementById('modalImagem');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalImagem';
        modal.className = 'modal-imagem';
        modal.innerHTML = '<img id="modalImagemImg" src="" alt="Imagem ampliada">';
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    }
    
    const img = document.getElementById('modalImagemImg');
    if (img) {
        img.src = url;
    }
    modal.classList.add('show');
}

// ========== ESCAPE HTML ==========
function escapeHtml(texto) {
    if (!texto) {
        return '';
    }
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ========== APLICAR FILTRO NAS MANUTENÇÕES ==========
function aplicarFiltroStatus() {
    const grid = document.getElementById("manutencoesGrid");
    
    if (!grid) {
        console.error("Grid não encontrado");
        return;
    }
    
    let manutencoesFiltradas = [];
    
    if (filtroStatusAtual === null) {
        manutencoesFiltradas = manutencoes;
    } else {
        for (let i = 0; i < manutencoes.length; i++) {
            if (manutencoes[i].status === filtroStatusAtual) {
                manutencoesFiltradas.push(manutencoes[i]);
            }
        }
    }
    
    if (manutencoesFiltradas.length === 0) {
        grid.innerHTML = '<div class="sem-manutencoes">Nenhuma manutencao encontrada</div>';
        return;
    }
    
    let html = "";
    
    for (let i = 0; i < manutencoesFiltradas.length; i++) {
        const m = manutencoesFiltradas[i];
        const statusClass = getStatusClass(m.status);
        const urgenciaClass = getUrgenciaClass(m.urgencia);
        
        let statusTexto = "Aberto";
        if (m.status) {
            statusTexto = m.status;
        }
        
        let urgenciaTexto = "Media";
        if (m.urgencia) {
            urgenciaTexto = m.urgencia;
        }
        
        // ========== IMAGEM COM ESTILO .manutencao-imagem ==========
        let imagemHtml = '';
        if (m.imagem) {
            const imagemUrl = API_URL + m.imagem;
            imagemHtml = `
                <div class="manutencao-imagem">
                    <img src="${imagemUrl}" alt="Imagem do equipamento" onclick="abrirModalImagem('${imagemUrl}')">
                </div>
            `;
        } else {
            imagemHtml = `
                <div class="manutencao-imagem">
                    <span style="color: #999; font-size: 0.85rem;">📷 Nenhuma imagem disponível</span>
                </div>
            `;
        }
        
        let criadorNome = "Usuario";
        if (m.criador_nome) {
            criadorNome = m.criador_nome;
        }
        
        let criadorSetor = "N/A";
        if (m.criador_setor) {
            criadorSetor = m.criador_setor;
        }
        
        let equipamentoTexto = "Equipamento nao informado";
        if (m.equipamento) {
            equipamentoTexto = escapeHtml(m.equipamento);
        }
        
        let localTexto = "";
        if (m.local) {
            localTexto = m.local;
        }
        
        let nomeSalaTexto = "";
        if (m.nome_sala) {
            nomeSalaTexto = "- " + m.nome_sala;
        }
        
        let categoriaTexto = "";
        if (m.categoria) {
            categoriaTexto = m.categoria;
        }
        
        let responsavelTexto = "Nao informado";
        if (m.responsavel) {
            responsavelTexto = escapeHtml(m.responsavel);
        }
        
        // ========== OBSERVAÇÕES COM ESTILO ATUALIZADO ==========
        let observacoesHtml = "";
        if (m.observacoes && m.observacoes.trim() !== "") {
            observacoesHtml = `
                <div class="manutencao-observacoes">${escapeHtml(m.observacoes)}</div>
            `;
        }
                
        html += `
            <div class="manutencao-card">
                ${imagemHtml}
                <div class="card-header">
                    <span class="status-badge ${statusClass}">${statusTexto}</span>
                    <span class="urgencia-badge ${urgenciaClass}">Urgencia: ${urgenciaTexto}</span>
                </div>
                <div class="manutencao-id">#${m.id}</div>
                <div class="manutencao-equipamento">${equipamentoTexto}</div>
                <div class="manutencao-info">
                    <span>Criado por: ${criadorNome} (${criadorSetor})</span>
                    <span>${formatarData(m.criado_em)}</span>
                </div>
                <div class="tags-container">
                    <span class="tag-local">Local: ${localTexto} ${nomeSalaTexto}</span>
                    <span class="tag-categoria">Categoria: ${categoriaTexto}</span>
                    <span class="tag-periodicidade">Periodicidade: ${getPeriodicidadeText(m.periodicidade)}</span>
                </div>
                ${observacoesHtml}
                <div class="responsavel-container">
                    <span class="tag-responsavel">👤 Responsável: ${responsavelTexto}</span>
                </div>
                <div class="datas-container">
                    <span class="data-ultima">Ultima: ${formatarData(m.data_ultima)}</span>
                    <span class="data-proxima">Proxima: ${formatarData(m.data_proxima)}</span>
                </div>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

// ========== CARREGAR MANUTENÇÕES ENCAMINHADAS ==========
async function carregarManutencoesEncaminhadas() {
    try {
        const url = API_URL + "/manutencoes-encaminhadas?usuario_id=" + USUARIO_ID + "&role=" + USUARIO_ROLE + "&setor=" + USUARIO_SETOR;
        console.log('Buscando manutencoes encaminhadas:', url);
        
        const resposta = await fetch(url);
        
        if (!resposta.ok) {
            throw new Error("Erro ao carregar manutencoes");
        }
        
        manutencoes = await resposta.json();
        console.log("Manutencoes encaminhadas carregadas:", manutencoes);
        
        mostrarEstatisticas();
        aplicarFiltroStatus();
        
    } catch (erro) {
        console.error("Erro:", erro);
        const grid = document.getElementById("manutencoesGrid");
        if (grid) {
            grid.innerHTML = '<div class="sem-manutencoes">Erro ao carregar manutencoes</div>';
        }
    }
}

// ========== INICIAR ==========
function inicializar() {
    carregarManutencoesEncaminhadas();
}

// Aguardar o DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

// Exportar funções para o escopo global
window.filtrarPorStatus = filtrarPorStatus;
window.abrirModalImagem = abrirModalImagem;