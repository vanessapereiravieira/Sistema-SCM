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
    window.location.href = '../../pages/perfil-admin/minhas_manutencoes_admin.html';
}

// ========== VARIAVEIS PRINCIPAIS ==========
let manutencoes = [];
let filtroStatusAtual = null;

// Carrega o contador de excluídos do localStorage ou inicia como 0
let contadorExcluidos = localStorage.getItem('contadorExcluidosManutencoes');
if (contadorExcluidos === null) {
    contadorExcluidos = 0;
} else {
    contadorExcluidos = parseInt(contadorExcluidos);
}

// Array para armazenar as manutenções excluídas
let manutencoesExcluidas = localStorage.getItem('manutencoesExcluidas');
if (manutencoesExcluidas === null) {
    manutencoesExcluidas = [];
} else {
    manutencoesExcluidas = JSON.parse(manutencoesExcluidas);
}

// ========== FUNÇÃO PARA MOSTRAR MENSAGENS ==========
function mostrarMensagem(mensagem, ehErro) {
    var toast = document.getElementById('toastMsg');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMsg';
        toast.className = 'toast-message';
        document.body.appendChild(toast);
    }
    
    toast.textContent = mensagem;
    toast.classList.remove('error');
    toast.classList.remove('show');
    
    if (ehErro === true) {
        toast.classList.add('error');
    }
    
    toast.classList.add('show');
    
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

// ========== FUNÇÃO PARA CONVERTER IMAGEM URL PARA BASE64 ==========
async function converterImagemParaBase64(imagemUrl) {
    if (!imagemUrl) {
        console.log("Sem URL de imagem para converter");
        return null;
    }
    
    // Se já for Base64, retorna como está
    if (imagemUrl.startsWith('data:image')) {
        console.log("Já é Base64");
        return imagemUrl;
    }
    
    try {
        console.log("Tentando converter imagem:", imagemUrl);
        
        // Faz o fetch da imagem
        const response = await fetch(imagemUrl);
        
        if (!response.ok) {
            console.error(`Erro ao buscar imagem: ${response.status}`);
            return null;
        }
        
        const blob = await response.blob();
        console.log(`Blob obtido: ${blob.size} bytes, tipo: ${blob.type}`);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log("Conversão para Base64 concluída");
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                console.error("Erro no FileReader:", error);
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Erro ao converter imagem para Base64:', error);
        return null;
    }
}

// ========== FUNÇÃO PARA OBTER URL DA IMAGEM ==========
function getImagemUrl(imagemPath) {
    if (!imagemPath) {
        return null;
    }
    
    // Se já for URL completa ou Base64
    if (imagemPath.startsWith('http') || imagemPath.startsWith('data:image')) {
        return imagemPath;
    }
    
    // Se começar com /uploads, concatena com API_URL
    if (imagemPath.startsWith('/uploads')) {
        return `${API_URL}${imagemPath}`;
    }
    
    // Fallback para outros casos
    return `${API_URL}/${imagemPath.replace(/\\/g, '/')}`;
}

// ========== FUNÇÃO PARA GERAR IMAGEM FALLBACK ==========
function gerarImagemFallback(equipamento = "", categoria = "") {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 200;

    const ctx = canvas.getContext("2d");
    
    // Texto
    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Nenhuma imagem disponível", canvas.width/2, canvas.height/2);

    return canvas.toDataURL("image/png");
}

// ========== FUNÇÃO PARA PEGAR IMAGEM DA MANUTENÇÃO ==========
function getImagemManutencao(manutencao) {
    // Se for uma manutenção excluída e já tem a imagem Base64 salva, usa ela
    if (manutencao.imagem_base64) {
        return manutencao.imagem_base64;
    }
    
    // Se tem URL salva
    if (manutencao.imagem_url) {
        return manutencao.imagem_url;
    }
    
    const imagemUrl = getImagemUrl(manutencao.imagem);
    
    if (imagemUrl) {
        return imagemUrl;
    }
    
    // Se não tem imagem, gera uma fallback
    return gerarImagemFallback(manutencao.equipamento, manutencao.categoria);
}

// ========== FUNÇÃO PARA PEGAR CLASSE DE STATUS ==========
function getStatusClass(status) {
    if (status === "Aberto") {
        return "status-aberto";
    } else if (status === "Em andamento") {
        return "status-andamento";
    } else if (status === "Pendente") {
        return "status-pendente";
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
    if (!urgencia) {
        return "urgencia-media";
    }
    
    const urgenciaNormalizada = urgencia.toLowerCase().trim();
    
    if (urgenciaNormalizada === "baixa") {
        return "urgencia-baixa";
    } else if (urgenciaNormalizada === "media" || urgenciaNormalizada === "média") {
        return "urgencia-media";
    } else if (urgenciaNormalizada === "alta") {
        return "urgencia-alta";
    }
    
    return "urgencia-media";
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
    let pendentes = 0;
    let concluidos = 0;
    let cancelados = 0;
    
    for (let i = 0; i < manutencoes.length; i++) {
        const status = manutencoes[i].status;
        
        total = total + 1;
        
        if (status === "Aberto") {
            abertos = abertos + 1;
        } else if (status === "Em andamento") {
            emAndamento = emAndamento + 1;
        } else if (status === "Pendente") {
            pendentes = pendentes + 1;
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
        <div class="stat-card" onclick="filtrarPorStatus('Pendente')">
            <div class="stat-number" style="color: #9c27b0;">${pendentes}</div>
            <div class="stat-label">Pendente</div>
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
    } else if (status === 'Pendente') {
        return 3;
    } else if (status === 'Concluído') {
        return 4;
    } else if (status === 'Cancelado') {
        return 5;
    } else if (status === 'Excluído') {
        return 6;
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

// ========== APLICAR FILTRO NAS MANUTENÇÕES ==========
function aplicarFiltroStatus() {
    const grid = document.getElementById("manutencoesGrid");
    
    if (filtroStatusAtual === "Excluído") {
        if (manutencoesExcluidas.length === 0) {
            grid.innerHTML = `<div class="sem-manutencoes">Nenhuma manutenção excluída encontrada</div>`;
            return;
        }
        
        let html = "";
        for (let i = 0; i < manutencoesExcluidas.length; i++) {
            const m = manutencoesExcluidas[i];
            
            const data = new Date(m.criado_em);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            const dataExclusao = new Date(m.data_exclusao);
            const dataExclusaoFormatada = dataExclusao.toLocaleDateString('pt-BR');
            
            const statusClass = getStatusClass("Excluído");
            const urgenciaClass = getUrgenciaClass(m.urgencia);
            const textoUrgencia = m.urgencia || 'Média';
            
            let imagemSrc = m.imagem_base64 || gerarImagemFallback(m.equipamento, m.categoria);
            
            html = html + `
                <div class="manutencao-card">
                    <div class="manutencao-imagem">
                        <img src="${imagemSrc}" alt="${m.equipamento}" 
                             onerror="this.onerror=null; this.src='${gerarImagemFallback(m.equipamento, m.categoria)}'">
                    </div>
                    <div class="card-header">
                        <span class="status-badge ${statusClass}">Status: Excluído</span>
                        <span class="urgencia-badge ${urgenciaClass}">Urgência: ${textoUrgencia}</span>
                    </div>
                    <div class="manutencao-id">#${m.id}</div>
                    <div class="manutencao-titulo">${m.equipamento}</div>
                    <div class="manutencao-data">Criado: ${dataFormatada}</div>
                    <div class="manutencao-descricao">${m.observacoes || 'Sem descrição'}</div>
                    <div class="excluido-info">
                        <span class="tag-local">Excluído em: ${dataExclusaoFormatada}</span>
                    </div>
                    <div class="tags-container">
                        <span class="tag-responsavel">👤 Responsável: ${m.responsavel || 'Não informado'}</span>
                        <span class="tag-local">Local: ${m.local}: ${m.nome_sala}</span>
                        <span class="tag-categoria">Categoria: ${m.categoria}</span>
                        <span class="tag-periodicidade">Período: ${m.periodicidade}</span>
                    </div>
                </div>
            `;
        }
        
        grid.innerHTML = html;
        return;
    }
    
    let manutencoesFiltradas = manutencoes;
    
    if (filtroStatusAtual !== null) {
        manutencoesFiltradas = [];
        for (let i = 0; i < manutencoes.length; i++) {
            if (manutencoes[i].status === filtroStatusAtual) {
                manutencoesFiltradas.push(manutencoes[i]);
            }
        }
    }
    
    let html = "";
    let contador = 0;
    
    for (let i = 0; i < manutencoesFiltradas.length; i++) {
        contador = contador + 1;
        const m = manutencoesFiltradas[i];
        
        const data = new Date(m.criado_em);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        const statusClass = getStatusClass(m.status);
        const urgenciaClass = getUrgenciaClass(m.urgencia);
        const textoUrgencia = m.urgencia || 'Média';
        
        const imagemSrc = getImagemManutencao(m);
        
        let disabledAttr = "";
        
        if (m.status === "Cancelado" || m.status === "Concluído") {
            disabledAttr = "disabled style='opacity:0.5;cursor:not-allowed'";
        }
        
        html = html + `
            <div class="manutencao-card">
                <div class="manutencao-imagem">
                    <img src="${imagemSrc}" alt="${m.equipamento}" 
                         onerror="this.onerror=null; this.src='${gerarImagemFallback(m.equipamento, m.categoria)}'">
                </div>
                <div class="card-header">
                    <span class="status-badge ${statusClass}">Status: ${m.status}</span>
                    <span class="urgencia-badge ${urgenciaClass}">Urgência: ${textoUrgencia}</span>
                </div>
                <div class="manutencao-id">#${m.id}</div>
                <div class="manutencao-titulo">${m.equipamento}</div>
                <div class="manutencao-data">${dataFormatada}</div>
                <div class="manutencao-descricao">${m.observacoes || 'Sem observações'}</div>
                <div class="tags-container">
                    <span class="tag-responsavel">👤 Responsável: ${m.responsavel || 'Não informado'}</span>
                    <span class="tag-local">Local: ${m.nome_sala}</span>
                    <span class="tag-categoria">Categoria: ${m.categoria}</span>
                    <span class="tag-periodicidade">Período: ${m.periodicidade}</span>
                </div>
                <div class="card-botoes">
                    <button class="btn-card btn-excluir" onclick="excluirManutencao(${m.id})">Excluir</button>
                    <button class="btn-card btn-editar" onclick="editarManutencao(${m.id})" ${disabledAttr}>Editar</button>
                </div>
            </div>
        `;
    }
    
    if (contador === 0) {
        let mensagem = "";
        if (filtroStatusAtual !== null) {
            mensagem = `Nenhuma manutenção com status "${filtroStatusAtual}" encontrada`;
        } else {
            mensagem = "Nenhuma manutenção encontrada";
        }
        grid.innerHTML = `<div class="sem-manutencoes">${mensagem}</div>`;
    } else {
        grid.innerHTML = html;
    }
}

function mostrarManutencoes() {
    filtroStatusAtual = null;
    aplicarFiltroStatus();
}

// ========== CARREGAR MANUTENÇÕES ==========
async function carregarManutencoes() {
    if (!USUARIO_ID) {
        alert("Faça login para ver suas manutenções");
        window.location.href = "../../pages/login/login.html";
        return;
    }
    
    try {
        const resposta = await fetch(`${API_URL}/minhas-manutencoes?usuario_id=${USUARIO_ID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!resposta.ok) {
            throw new Error("Erro ao carregar manutenções");
        }
        manutencoes = await resposta.json();
        
        mostrarEstatisticas();
        mostrarManutencoes();
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao carregar manutenções");
    }
}

// ========== EXCLUIR MANUTENÇÃO ==========
async function excluirManutencao(id) {
    const confirmado = confirm(
        "Tem certeza que deseja excluir permanentemente esta manutenção? Esta ação não pode ser desfeita."
    );

    if (!confirmado) {
        return;
    }

    try {
        // Encontrar a manutenção antes da exclusão
        let manutencaoRemovida = null;

        for (let i = 0; i < manutencoes.length; i++) {
            if (manutencoes[i].id === id) {
                manutencaoRemovida = JSON.parse(JSON.stringify(manutencoes[i]));
                break;
            }
        }

        if (manutencaoRemovida === null) {
            alert("Manutenção não encontrada");
            return;
        }

        // Salvar data da exclusão
        manutencaoRemovida.data_exclusao = new Date().toISOString();

        // CONVERTER IMAGEM PARA BASE64 ANTES DE EXCLUIR
        console.log("Convertendo imagem para Base64...");
        
        if (manutencaoRemovida.imagem) {
            // Construir URL completa da imagem
            const imagemUrl = `${API_URL}${manutencaoRemovida.imagem}`;
            console.log("URL da imagem:", imagemUrl);
            
            const imagemBase64 = await converterImagemParaBase64(imagemUrl);
            
            if (imagemBase64) {
                manutencaoRemovida.imagem_base64 = imagemBase64;
                console.log("Imagem convertida com sucesso");
            } else {
                console.log("Falha na conversão, usando fallback");
                manutencaoRemovida.imagem_base64 = gerarImagemFallback(
                    manutencaoRemovida.equipamento,
                    manutencaoRemovida.categoria
                );
            }
        } else {
            console.log("Manutenção sem imagem, usando fallback");
            manutencaoRemovida.imagem_base64 = gerarImagemFallback(
                manutencaoRemovida.equipamento,
                manutencaoRemovida.categoria
            );
        }

        // Agora exclui no banco e no servidor
        console.log("Excluindo do servidor...");
        const resposta = await fetch(
            `${API_URL}/nova-manutencao/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario_id: USUARIO_ID
                })
            }
        );

        const resultado = await resposta.json();

        if (resposta.ok) {
            // Adiciona ao histórico de excluídos
            manutencoesExcluidas.push(manutencaoRemovida);
            contadorExcluidos = contadorExcluidos + 1;

            localStorage.setItem(
                "contadorExcluidosManutencoes",
                contadorExcluidos
            );

            localStorage.setItem(
                "manutencoesExcluidas",
                JSON.stringify(manutencoesExcluidas)
            );

            // Remove da lista atual
            manutencoes = manutencoes.filter(m => m.id !== id);

            mostrarEstatisticas();
            aplicarFiltroStatus();

            mostrarMensagem(resultado.mensagem || "Manutenção excluída com sucesso");
        } else {
            mostrarMensagem(resultado.mensagem || "Erro ao excluir manutenção", true);
        }
    } catch (erro) {
        console.error("Erro ao excluir manutenção:", erro);
        mostrarMensagem("Erro ao excluir manutenção: " + erro.message, true);
    }
}

// ========== EDITAR MANUTENÇÃO ==========
function editarManutencao(id) {
    window.location.href = `nova_manutencao_user.html?editar=${id}`;
}

// ========== AGUARDAR DOM CARREGAR ==========
document.addEventListener('DOMContentLoaded', function() {
    carregarManutencoes();
});

// Exportar funções para o escopo global
window.excluirManutencao = excluirManutencao;
window.editarManutencao = editarManutencao;
window.filtrarPorStatus = filtrarPorStatus;