var API_URL = "http://localhost:3000";

// Verificar login
const usuarioSalvo = localStorage.getItem('usuarioLogado');
if (!usuarioSalvo) {
    window.location.href = '../../pages/login/login.html';
}
const USUARIO = JSON.parse(usuarioSalvo);
const USUARIO_ID = USUARIO.id;
const USUARIO_ROLE = USUARIO.role;
const USUARIO_SETOR = USUARIO.setor;

// Verificar se é user
if (USUARIO_ROLE !== 'user') {
    window.location.href = '../../pages/perfil-admin/home_admin.html';
}

// ========== ELEMENTOS DO DOM ==========
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const overlay = document.getElementById('overlay');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// ========== FUNÇÕES DO MENU MOBILE ==========
function toggleMobileMenu() {
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

function configurarMenuMobile() {
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
}

// ========== FUNÇÕES DO DROPDOWN ==========
function toggleDropdown(evento) {
    evento.stopPropagation();
    if (dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
    } else {
        dropdownMenu.classList.add('show');
    }
}

function fecharDropdown() {
    dropdownMenu.classList.remove('show');
}

function configurarDropdown() {
    if (profileBtn) {
        profileBtn.addEventListener('click', toggleDropdown);
    }
    document.addEventListener('click', fecharDropdown);
}

// ========== FUNÇÕES DE TEMA ==========
function carregarTema() {
    const temaSalvo = localStorage.getItem('theme');
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
}

function configurarTema() {
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

// ========== FUNÇÃO DE LOGOUT ==========
function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = '../../pages/login/login.html';
}

function configurarLogout() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
}

// ========== REDIMENSIONAMENTO ==========
function aoRedimensionar() {
    if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
        closeMobileMenu();
    }
}

function configurarRedimensionamento() {
    window.addEventListener('resize', aoRedimensionar);
}

// ========== LINKS MOBILE ==========
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

// ========== INICIALIZAR ==========
function inicializar() {
    carregarTema();
    configurarTema();
    configurarMenuMobile();
    configurarDropdown();
    configurarLogout();
    configurarRedimensionamento();
    configurarLinksMobile();
}

inicializar();

// Exportar variáveis e funções para outros scripts
window.API_URL = API_URL;
window.USUARIO = USUARIO;
window.USUARIO_ID = USUARIO_ID;
window.USUARIO_ROLE = USUARIO_ROLE;
window.USUARIO_SETOR = USUARIO_SETOR;
window.fazerLogout = fazerLogout;