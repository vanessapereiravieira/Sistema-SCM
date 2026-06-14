// ========== VARIÁVEIS PRÓPRIAS ==========
var API_URL = "http://localhost:3000";

// ========== VERIFICAR LOGIN ==========
var usuarioSalvo = localStorage.getItem('usuarioLogado');

if (!usuarioSalvo) {
    window.location.href = '../../pages/login/login.html';
}

var USUARIO = JSON.parse(usuarioSalvo);
var USUARIO_ID = USUARIO.id;
var USUARIO_ROLE = USUARIO.role;

console.log({
    id: USUARIO_ID,
    role: USUARIO_ROLE,
});

// Verificar se é admin
if (USUARIO_ROLE !== 'admin') {
    window.location.href = '../../pages/perfil-user/nova_manutencao_user.html';
}

// ========== VARIÁVEIS DO FORMULÁRIO ==========
var manutencaoEditandoId = null;

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

// ========== FUNÇÃO PARA FORMATAR DATA PARA INPUT ==========
function formatarDataParaInput(data) {
    if (!data) {
        return '';
    }
    
    if (data.indexOf('T') !== -1) {
        return data.split('T')[0];
    }
    
    return data;
}

// ========== FUNÇÃO PARA CONFIGURAR OBRIGATORIEDADE DA IMAGEM ==========
function configurarObrigatoriedadeImagem() {
    var campoImagem = document.getElementById('imagem');
    if (!campoImagem) return;
    
    if (manutencaoEditandoId === null) {
        // Modo criação: imagem é obrigatória
        campoImagem.setAttribute('required', 'required');
        console.log("Modo criação: imagem obrigatória");
    } else {
        // Modo edição: imagem é opcional
        campoImagem.removeAttribute('required');
        console.log("Modo edição: imagem opcional");
    }
}

// ========== FUNÇÃO PARA ATUALIZAR AS OPÇÕES DO SELECT DE SALA/LABORATÓRIO ==========
function atualizarOpcoesSala() {
    const campoLocalTipo = document.getElementById('localTipo');
    const campoNomeSala = document.getElementById('nomeSala');
    const grupoNomeSala = document.getElementById('nomeSalaGroup');
    const labelNomeSala = document.getElementById('nomeSalaLabel');
    
    if (!campoLocalTipo) return;
    
    const tipoSelecionado = campoLocalTipo.value;
    
    if (tipoSelecionado === '') {
        if (grupoNomeSala) {
            grupoNomeSala.style.display = 'none';
        }
        if (campoNomeSala) {
            campoNomeSala.removeAttribute('required');
        }
        if (campoNomeSala) {
            campoNomeSala.value = '';
        }
        return;
    }
    
    if (grupoNomeSala) {
        grupoNomeSala.style.display = 'block';
    }
    if (campoNomeSala) {
        campoNomeSala.setAttribute('required', 'required');
    }
    
    // Atualiza o label e as opções baseado no tipo selecionado
    if (tipoSelecionado === 'sala') {
        if (labelNomeSala) {
            labelNomeSala.textContent = 'Número da sala *';
        }
        if (campoNomeSala) {
            campoNomeSala.innerHTML = `
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
        if (labelNomeSala) {
            labelNomeSala.textContent = 'Laboratório *';
        }
        if (campoNomeSala) {
            campoNomeSala.innerHTML = `
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

// ========== FUNÇÃO PARA LIMPAR FORMULÁRIO ==========
function limparFormulario() {
    var formulario = document.getElementById('manutencaoForm');
    var grupoNomeSala = document.getElementById('nomeSalaGroup');
    
    if (formulario) {
        formulario.reset();
    }
    
    manutencaoEditandoId = null;
    
    // ========== VOLTAR IMAGEM PARA OBRIGATÓRIA ==========
    configurarObrigatoriedadeImagem();
    
    var campoImagem = document.getElementById('imagem');
    if (campoImagem) {
        campoImagem.value = '';
    }
    
    // Remove o preview da imagem
    var previewContainer = document.getElementById('imagemPreviewContainer');
    if (previewContainer) {
        previewContainer.style.display = 'none';
        var imagemPreview = document.getElementById('imagemPreview');
        if (imagemPreview) {
            imagemPreview.src = '';
        }
    }
    
    // Esconde o grupo do select novamente
    if (grupoNomeSala) {
        grupoNomeSala.style.display = 'none';
    }
}

// ========== FUNÇÃO PARA VALIDAR FORMULÁRIO ==========
function validarFormulario() {
    var campoEquipamento = document.getElementById('equipamento');
    var campoResponsavel = document.getElementById('responsavel');
    var campoLocalTipo = document.getElementById('localTipo');
    var campoNomeSala = document.getElementById('nomeSala');
    var campoCategoria = document.getElementById('categoria');
    var campoPeriodicidade = document.getElementById('periodicidade');
    var campoDataUltima = document.getElementById('dataUltima');
    var campoDataProxima = document.getElementById('dataProxima');
    var campoUrgencia = document.getElementById('urgencia');
    var campoImagem = document.getElementById('imagem');
    
    if (!campoEquipamento.value.trim()) {
        mostrarMensagem("Informe o equipamento", true);
        return false;
    }
    
    if (!campoResponsavel.value.trim()) {
        mostrarMensagem("Informe o responsável pela manutenção", true);
        return false;
    }
    
    if (!campoLocalTipo.value) {
        mostrarMensagem("Selecione o tipo de local", true);
        return false;
    }
    
    if (!campoNomeSala.value) {
        mostrarMensagem("Selecione o local específico", true);
        return false;
    }
    
    if (!campoCategoria.value) {
        mostrarMensagem("Selecione a categoria", true);
        return false;
    }
    
    if (!campoPeriodicidade.value) {
        mostrarMensagem("Selecione a periodicidade", true);
        return false;
    }
    
    if (!campoDataUltima.value) {
        mostrarMensagem("Informe a data da última manutenção", true);
        return false;
    }
    
    if (!campoDataProxima.value) {
        mostrarMensagem("Informe a data da próxima manutenção", true);
        return false;
    }
    
    var dataUltima = new Date(campoDataUltima.value);
    var dataProxima = new Date(campoDataProxima.value);
    
    if (dataProxima <= dataUltima) {
        mostrarMensagem("A data da próxima manutenção deve ser posterior à última manutenção", true);
        return false;
    }
    
    if (!campoUrgencia.value) {
        mostrarMensagem("Selecione o nível de urgência", true);
        return false;
    }
    
    // ========== VALIDAÇÃO DE IMAGEM CORRIGIDA ==========
    // Na criação (manutencaoEditandoId === null), imagem é obrigatória
    // Na edição (manutencaoEditandoId !== null), imagem é opcional
    if (manutencaoEditandoId === null) {
        // Só obriga imagem se for criação
        if (!campoImagem.files[0]) {
            mostrarMensagem("Selecione uma imagem do equipamento", true);
            return false;
        } else {
            // Valida a imagem na criação
            var arquivo = campoImagem.files[0];
            var tamanhoMaximo = 5 * 1024 * 1024;
            
            if (arquivo.size > tamanhoMaximo) {
                mostrarMensagem("A imagem não pode exceder 5MB", true);
                return false;
            }
            
            var tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            var tipoPermitido = false;
            
            for (var i = 0; i < tiposPermitidos.length; i++) {
                if (arquivo.type === tiposPermitidos[i]) {
                    tipoPermitido = true;
                    break;
                }
            }
            
            if (!tipoPermitido) {
                mostrarMensagem("Formato de imagem não permitido. Use JPG, PNG ou GIF", true);
                return false;
            }
        }
    } else {
        // Na edição, imagem é opcional
        // Se o usuário selecionou um arquivo, valida o formato e tamanho
        if (campoImagem.files[0]) {
            var arquivo = campoImagem.files[0];
            var tamanhoMaximo = 5 * 1024 * 1024;
            
            if (arquivo.size > tamanhoMaximo) {
                mostrarMensagem("A imagem não pode exceder 5MB", true);
                return false;
            }
            
            var tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            var tipoPermitido = false;
            
            for (var i = 0; i < tiposPermitidos.length; i++) {
                if (arquivo.type === tiposPermitidos[i]) {
                    tipoPermitido = true;
                    break;
                }
            }
            
            if (!tipoPermitido) {
                mostrarMensagem("Formato de imagem não permitido. Use JPG, PNG ou GIF", true);
                return false;
            }
        }
        // Se não selecionou arquivo, mantém a imagem atual (não valida nada)
    }
    
    return true;
}

// ========== FUNÇÃO PARA ENVIAR MANUTENÇÃO ==========
async function enviarManutencao(evento) {
    evento.preventDefault();
    console.log("SUBMIT INTERCEPTADO");

    if (!validarFormulario()) {
        return;
    }

    var botaoSubmit = document.querySelector('#manutencaoForm button[type="submit"]');
    var textoOriginal = botaoSubmit.textContent;

    botaoSubmit.disabled = true;

    var campoEquipamento = document.getElementById('equipamento');
    var campoResponsavel = document.getElementById('responsavel');
    var campoLocalTipo = document.getElementById('localTipo');
    var campoNomeSala = document.getElementById('nomeSala');
    var campoCategoria = document.getElementById('categoria');
    var campoPeriodicidade = document.getElementById('periodicidade');
    var campoDataUltima = document.getElementById('dataUltima');
    var campoDataProxima = document.getElementById('dataProxima');
    var campoUrgencia = document.getElementById('urgencia');
    var campoObservacoes = document.getElementById('observacoes');
    var campoImagem = document.getElementById('imagem');

    var formData = new FormData();
    formData.append('equipamento', campoEquipamento.value.trim());
    formData.append('responsavel', campoResponsavel.value.trim());
    formData.append('localTipo', campoLocalTipo.value);
    formData.append('nomeSala', campoNomeSala.value);
    formData.append('categoria', campoCategoria.value);
    formData.append('periodicidade', campoPeriodicidade.value);
    formData.append('dataUltima', campoDataUltima.value);
    formData.append('dataProxima', campoDataProxima.value);
    formData.append('urgencia', campoUrgencia.value);
    formData.append('usuario_id', USUARIO_ID);
    formData.append('status', 'Aberto');

    var observacoes = campoObservacoes.value.trim();

    if (observacoes !== '') {
        formData.append('observacoes', observacoes);
    }

    if (campoImagem.files[0]) {
        formData.append('imagem', campoImagem.files[0]);
    }

    try {
        var url;
        var metodo;
        var isEdicao = false;

        if (manutencaoEditandoId !== null) {
            url = API_URL + '/nova-manutencao/' + manutencaoEditandoId;
            metodo = 'PUT';
            isEdicao = true;
        } else {
            url = API_URL + '/nova-manutencao';
            metodo = 'POST';
        }

        var resposta = await fetch(url, {
            method: metodo,
            body: formData
        });

        var resultado = await resposta.json();

        if (resposta.ok) {
            
            if (isEdicao) {
            mostrarMensagem("Manutenção atualizada com sucesso", false);
            
            // Timeout específico para edição
            setTimeout(function() {
                window.location.href = "minhas_manutencoes_user.html";
            }, 2000);

        } else {
        
        mostrarMensagem("Manutenção criada com sucesso", false);
        window.location.href = "minhas_manutencoes_user.html";
    }

    manutencaoEditandoId = null;
    
    } else {
            var mensagemErro = resultado.mensagem || "Erro ao processar manutenção";

            mostrarMensagem(mensagemErro, true);

            botaoSubmit.textContent = textoOriginal;
            botaoSubmit.disabled = false;
        }

    } catch (error) {
        console.error("Erro detalhado:", error);

        mostrarMensagem(
            "Erro de conexão com o servidor: " + error.message,
            true
        );

        botaoSubmit.textContent = textoOriginal;
        botaoSubmit.disabled = false;
    }
}

// ========== FUNÇÃO PARA CARREGAR MANUTENÇÃO PARA EDIÇÃO ==========
async function carregarManutencaoParaEdicao() {
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('editar');
    
    if (!id) {
        // Modo criação - garantir que imagem é obrigatória
        configurarObrigatoriedadeImagem();
        return;
    }
    
    try {
        var url = API_URL + '/minhas-manutencoes?usuario_id=' + USUARIO_ID;
        var resposta = await fetch(url);
        
        if (!resposta.ok) {
            throw new Error("Erro ao carregar manutencoes");
        }
        
        var manutencoes = await resposta.json();
        var manutencao = null;
        
        for (var i = 0; i < manutencoes.length; i++) {
            if (manutencoes[i].id == id) {
                manutencao = manutencoes[i];
                break;
            }
        }
        
        if (!manutencao) {
            mostrarMensagem("Manutenção não encontrada", true);
            return;
        }
        
        manutencaoEditandoId = manutencao.id;
        
        // ========== CONFIGURAR IMAGEM COMO OPCIONAL NA EDIÇÃO ==========
        configurarObrigatoriedadeImagem();
        
        // Preencher campos básicos
        document.getElementById('equipamento').value = manutencao.equipamento || '';
        document.getElementById('responsavel').value = manutencao.responsavel || '';
        
        // Converter local para o valor do select
        var localTipoMap = { 'Sala': 'sala', 'Laboratório': 'laboratorio' };
        var localTipoSelecionado = localTipoMap[manutencao.local] || 'sala';
        document.getElementById('localTipo').value = localTipoSelecionado;
        
        // Atualizar as opções do select baseado no tipo de local
        atualizarOpcoesSala();
        
        // Aguarda o select ser preenchido
        setTimeout(function() {
            var campoNomeSala = document.getElementById('nomeSala');
            if (campoNomeSala && manutencao.nome_sala) {
                campoNomeSala.value = manutencao.nome_sala;
            }
        }, 100);
        
        document.getElementById('categoria').value = manutencao.categoria || '';
        
        // Preencher periodicidade
        var periodicidadeValue = manutencao.periodicidade || '';
        var campoPeriodicidade = document.getElementById('periodicidade');
        if (campoPeriodicidade && periodicidadeValue) {
            var opcoes = campoPeriodicidade.options;
            var encontrou = false;
            
            for (var j = 0; j < opcoes.length; j++) {
                if (opcoes[j].value.toLowerCase().trim() === periodicidadeValue.toLowerCase().trim()) {
                    campoPeriodicidade.value = opcoes[j].value;
                    encontrou = true;
                    break;
                }
            }
            
            if (!encontrou) {
                campoPeriodicidade.value = periodicidadeValue;
            }
        }
        
        document.getElementById('dataUltima').value = formatarDataParaInput(manutencao.data_ultima);
        document.getElementById('dataProxima').value = formatarDataParaInput(manutencao.data_proxima);
        
        // Preencher urgencia
        var urgenciaValue = manutencao.urgencia || 'Média';
        var campoUrgencia = document.getElementById('urgencia');
        if (campoUrgencia) {
            var urgenciaNormalizada = urgenciaValue.toLowerCase().trim();
            if (urgenciaNormalizada === 'baixa') {
                campoUrgencia.value = 'Baixa';
            } else if (urgenciaNormalizada === 'media' || urgenciaNormalizada === 'média') {
                campoUrgencia.value = 'Média';
            } else if (urgenciaNormalizada === 'alta') {
                campoUrgencia.value = 'Alta';
            } else {
                campoUrgencia.value = urgenciaValue;
            }
        }
        
        document.getElementById('observacoes').value = manutencao.observacoes || '';
        
        // Mostrar a imagem atual
        if (manutencao.imagem) {
            var imagemUrl = API_URL + manutencao.imagem;
            var imagemPreview = document.getElementById('imagemPreview');
            
            if (!imagemPreview) {
                var imagemInput = document.getElementById('imagem');
                if (imagemInput) {
                    var previewContainer = document.createElement('div');
                    previewContainer.id = 'imagemPreviewContainer';
                    previewContainer.style.marginTop = '10px';
                    previewContainer.style.position = 'relative';
                    previewContainer.style.display = 'inline-block';
                    
                    imagemPreview = document.createElement('img');
                    imagemPreview.id = 'imagemPreview';
                    imagemPreview.style.maxWidth = '200px';
                    imagemPreview.style.maxHeight = '200px';
                    imagemPreview.style.borderRadius = '8px';
                    imagemPreview.style.border = '1px solid #ddd';
                    imagemPreview.style.padding = '5px';
                    
                    var btnRemoverImagem = document.createElement('button');
                    btnRemoverImagem.textContent = '✕';
                    btnRemoverImagem.style.position = 'absolute';
                    btnRemoverImagem.style.top = '-10px';
                    btnRemoverImagem.style.right = '-10px';
                    btnRemoverImagem.style.backgroundColor = '#e74c3c';
                    btnRemoverImagem.style.color = 'white';
                    btnRemoverImagem.style.border = 'none';
                    btnRemoverImagem.style.borderRadius = '50%';
                    btnRemoverImagem.style.width = '25px';
                    btnRemoverImagem.style.height = '25px';
                    btnRemoverImagem.style.cursor = 'pointer';
                    btnRemoverImagem.style.fontSize = '14px';
                    btnRemoverImagem.style.fontWeight = 'bold';
                    btnRemoverImagem.style.title = 'Remover imagem';
                    
                    btnRemoverImagem.onclick = function() {
                        imagemPreview.src = '';
                        previewContainer.style.display = 'none';
                        document.getElementById('imagem').value = '';
                        mostrarMensagem("Imagem removida. Selecione uma nova se desejar.", false);
                    };
                    
                    previewContainer.appendChild(imagemPreview);
                    previewContainer.appendChild(btnRemoverImagem);
                    
                    imagemInput.parentNode.insertBefore(previewContainer, imagemInput.nextSibling);
                }
            }
            
            if (imagemPreview) {
                imagemPreview.src = imagemUrl;
                var previewContainer = document.getElementById('imagemPreviewContainer');
                if (previewContainer) {
                    previewContainer.style.display = 'inline-block';
                }
            }
        }
        
        // Mudar o texto do botão
        var botaoSubmit = document.querySelector('#manutencaoForm button[type="submit"]');
        if (botaoSubmit) {
            botaoSubmit.textContent = 'Enviar';
        }
        
        // Mudar o título da página
        var titulo = document.querySelector('h1');
        if (titulo) {
            titulo.textContent = 'Editar Manutenção';
        }
        
        
    } catch (erro) {
        console.error("Erro detalhado:", erro);
        mostrarMensagem("Erro ao carregar manutenção: " + erro.message, true);
    }
}

// ========== FUNÇÃO PARA CONFIGURAR VALIDAÇÃO DE DATAS ==========
function configurarValidacaoDatas() {
    var dataUltima = document.getElementById('dataUltima');
    var dataProxima = document.getElementById('dataProxima');
    
    if (dataUltima && dataProxima) {
        dataUltima.addEventListener('change', function() {
            if (this.value) {
                var dataMinima = new Date(this.value);
                dataMinima.setDate(dataMinima.getDate() + 1);
                var dataMinimaStr = dataMinima.toISOString().split('T')[0];
                dataProxima.min = dataMinimaStr;
                
                if (dataProxima.value) {
                    var dataProximaObj = new Date(dataProxima.value);
                    var dataUltimaObj = new Date(this.value);
                    
                    if (dataProximaObj <= dataUltimaObj) {
                        dataProxima.value = '';
                        mostrarMensagem("A data da próxima manutenção deve ser posterior à última", true);
                    }
                }
            } else {
                dataProxima.min = '';
            }
        });
        
        dataProxima.addEventListener('change', function() {
            if (dataUltima.value && this.value) {
                var dataProximaObj = new Date(this.value);
                var dataUltimaObj = new Date(dataUltima.value);
                
                if (dataProximaObj <= dataUltimaObj) {
                    mostrarMensagem("A data da próxima manutenção deve ser posterior à última manutenção", true);
                    this.value = '';
                }
            }
        });
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', function() {
    var formularioManutencao = document.getElementById('manutencaoForm');
    var campoLocalTipo = document.getElementById('localTipo');
    
    if (campoLocalTipo) {
        campoLocalTipo.addEventListener('change', atualizarOpcoesSala);
        atualizarOpcoesSala();
    }
    
    if (formularioManutencao) {
        formularioManutencao.addEventListener('submit', enviarManutencao);
        carregarManutencaoParaEdicao();
        configurarValidacaoDatas();
    }
});