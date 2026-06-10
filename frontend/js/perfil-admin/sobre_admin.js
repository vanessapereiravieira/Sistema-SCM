const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const overlay = document.getElementById('overlay');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');


// Função para abrir/fechar menu mobile
function toggleMobileMenu() {

    // Verificar se o menu está aberto
    if (sidebar.classList.contains('open')) {
        // Fechar menu
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    } else {
        // Abrir menu
        sidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Função para forçar fechamento do menu mobile
function closeMobileMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}


// Função para carregar tema salvo
function carregarTema() {

    // Verificar preferência salva no localStorage
    const temaSalvo = localStorage.getItem('theme');
    
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Função para alternar o tema
function toggleTheme() {

    // Verificar se está no modo escuro
    if (document.body.classList.contains('dark-mode')) {
        
        // Mudar para modo claro
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {

        // Mudar para modo escuro
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
}


// Função para gerenciar dropdown do perfil
function toggleDropdown(evento) {
    evento.stopPropagation();
    
    // Verificar se o dropdown está aberto
    if (dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
    } else {
        dropdownMenu.classList.add('show');
    }
}

// Função para fechar dropdown
function fecharDropdown() {
    dropdownMenu.classList.remove('show');
}


// Função para fazer logout
function fazerLogout() {
    window.location.href = '../../pages/login/login.html';
}


// Função para redimensionamento da janela
function aoRedimensionar() {
    // Se a tela for maior que 768px e o menu estiver aberto
    if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
        closeMobileMenu();
    }
}

// Função para fechar menu ao clicar em link (mobile)
function configurarLinksMobile() {
    const navItems = document.querySelectorAll('.nav-item');
    
    for (let i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    }
}

// ========== CONFIGURAÇÕES INICIAIS ==========

// Configurar eventos do menu mobile
function configurarMenuMobile() {
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
}

// Configurar dropdown do perfil
function configurarDropdown() {
    if (profileBtn) {
        profileBtn.addEventListener('click', toggleDropdown);
    }
    
    // Fechar dropdown ao clicar em qualquer lugar da página
    document.addEventListener('click', fecharDropdown);
}

// Configurar botão de logout
function configurarLogout() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
}

// Configurar botão de tema
function configurarTema() {
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

// Configurar redimensionamento
function configurarRedimensionamento() {
    window.addEventListener('resize', aoRedimensionar);
}


// ========== EXECUTAR CONFIGURAÇÕES ==========

carregarTema();    
configurarTema();
configurarMenuMobile();
configurarDropdown();
configurarLogout();
configurarRedimensionamento();


