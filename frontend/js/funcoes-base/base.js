// =====================================================
// ARQUIVO DE ESTILIZAÇÃO - FUNÇÕES DE MENU, TEMA E DROPDOWN
// =====================================================

// ========== AGUARDAR DOM CARREGAR ==========
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== ELEMENTOS DO DOM ==========
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const overlay = document.getElementById('overlay');
    const profileBtn = document.getElementById('profileBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    // ========== FUNÇÕES DO MENU MOBILE ==========
    function toggleMobileMenu() {
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            document.body.style.overflow = '';
        } else if (sidebar) {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
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
        if (dropdownMenu && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        } else if (dropdownMenu) {
            dropdownMenu.classList.add('show');
        }
    }

    function fecharDropdown() {
        if (dropdownMenu) {
            dropdownMenu.classList.remove('show');
        }
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
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', fazerLogout);
        }
    }

    // ========== REDIMENSIONAMENTO ==========
    function aoRedimensionar() {
        if (window.innerWidth > 768 && sidebar && sidebar.classList.contains('open')) {
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

    // ========== INICIALIZAR ESTILIZAÇÃO ==========
    function inicializarEstilo() {
        carregarTema();
        configurarTema();
        configurarMenuMobile();
        configurarDropdown();
        configurarLogout();
        configurarRedimensionamento();
        configurarLinksMobile();
    }

    inicializarEstilo();
    
    // Exportar funções para uso global
    window.fazerLogout = fazerLogout;
    window.toggleTheme = toggleTheme;
    
});