// CETIS 131 - JavaScript Premium Unificado
// Versión: 3.1 - Sistema Completo 2025 (CORREGIDO)

(function() {
    'use strict';

    // ===========================
    // INICIALIZACIÓN
    // ===========================
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('%c🎓 CETIS 131 - Sistema Premium', 'color: #8B1538; font-size: 18px; font-weight: bold;');
        console.log('%cVersión: 3.1 | Desarrollado con ❤️', 'color: #D4AF37; font-size: 14px;');
        
        // Inicializar todos los módulos
        initRevealOnScroll();
        initStickyHeader();
        initMobileMenu();
        initSmoothScroll();
        initEventCards();
        initFAQ();
        initTabs();
        initClubsModals();
        initFormValidation();
        initScrollToTop();
        initLazyLoading();
        initAnimations();
        
        // Log de inicialización
        console.log('✅ Todos los módulos inicializados correctamente');
    });

    // ===========================
    // REVEAL ON SCROLL - CORREGIDO
    // ===========================
    
    function initRevealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        
        if (reveals.length === 0) {
            console.log('ℹ️ No hay elementos .reveal en esta página');
            return;
        }
        
        console.log(`🔍 Encontrados ${reveals.length} elementos .reveal`);
        
        const observerOptions = {
            threshold: 0.05, // Reducido para activar más temprano
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Agregar clase active con un pequeño delay para la animación
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, 100);
                    
                    console.log('✨ Elemento revelado:', entry.target);
                    
                    // Opcional: dejar de observar después de revelar
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        reveals.forEach(reveal => {
            observer.observe(reveal);
            console.log('👁️ Observando elemento:', reveal);
        });
    }

    // ===========================
    // STICKY HEADER
    // ===========================
    
    function initStickyHeader() {
        const header = document.querySelector('header');
        const hero = document.querySelector('.hero');
        
        if (!hero || !header) {
            console.log('ℹ️ No se encontró hero o header para sticky');
            return;
        }
        
        const headerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                header.classList.toggle('sticky', !entry.isIntersecting);
            });
        }, { 
            threshold: 0.06,
            rootMargin: '0px'
        });
        
        headerObserver.observe(hero);
        console.log('✅ Sticky header inicializado');
    }

    // ===========================
    // MOBILE MENU
    // ===========================
    
    function initMobileMenu() {
        const navLinks = document.querySelectorAll('.nav-menu > li > a');
        const mq = window.matchMedia('(max-width: 768px)');
        
        function isSmall() {
            return mq.matches;
        }

        navLinks.forEach(link => {
            const submenu = link.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                // Accesibilidad
                link.setAttribute('aria-haspopup', 'true');
                link.setAttribute('aria-expanded', 'false');

                // Click en móvil
                link.addEventListener('click', (e) => {
                    if (isSmall()) {
                        e.preventDefault();
                        const parent = link.parentElement;
                        const wasActive = parent.classList.contains('active');
                        
                        // Cerrar todos los demás
                        document.querySelectorAll('.nav-menu li.active').forEach(li => {
                            if (li !== parent) {
                                li.classList.remove('active');
                                const a = li.querySelector('a');
                                if (a) a.setAttribute('aria-expanded', 'false');
                            }
                        });
                        
                        // Toggle del actual
                        parent.classList.toggle('active');
                        link.setAttribute('aria-expanded', !wasActive ? 'true' : 'false');
                    }
                });

                // Teclado
                link.addEventListener('keydown', (e) => {
                    if (isSmall() && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        link.click();
                    }
                });
            }
        });

        // Cerrar menús al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!isSmall()) return;
            if (!e.target.closest('.nav-menu')) {
                document.querySelectorAll('.nav-menu li.active').forEach(li => {
                    li.classList.remove('active');
                    const a = li.querySelector('a');
                    if (a) a.setAttribute('aria-expanded', 'false');
                });
            }
        });

        // Cerrar menús al cambiar a desktop
        window.addEventListener('resize', () => {
            if (!isSmall()) {
                document.querySelectorAll('.nav-menu li.active').forEach(li => {
                    li.classList.remove('active');
                    const a = li.querySelector('a');
                    if (a) a.setAttribute('aria-expanded', 'false');
                });
            }
        });
        
        console.log('✅ Mobile menu inicializado');
    }

    // ===========================
    // SMOOTH SCROLL
    // ===========================
    
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 100;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Cerrar menú móvil si está abierto
                    const parent = this.closest('.nav-menu li');
                    if (parent && parent.classList.contains('active')) {
                        parent.classList.remove('active');
                    }
                }
            });
        });
        
        console.log('✅ Smooth scroll inicializado');
    }

    // ===========================
    // EVENT CARDS
    // ===========================
    
    function initEventCards() {
        const eventImages = document.querySelectorAll('.event-image');
        
        if (eventImages.length === 0) {
            console.log('ℹ️ No hay event cards en esta página');
            return;
        }
        
        eventImages.forEach(image => {
            image.addEventListener('click', function() {
                const eventId = this.getAttribute('data-event-id');
                const details = document.getElementById(`event-details-${eventId}`);
                if (!details) return;

                // Cerrar todos los demás detalles
                document.querySelectorAll('.event-details.active').forEach(d => {
                    if (d !== details) {
                        d.classList.remove('active');
                    }
                });

                // Toggle del seleccionado
                const wasActive = details.classList.contains('active');
                details.classList.toggle('active');
                
                // Scroll suave si se abre
                if (!wasActive) {
                    setTimeout(() => {
                        details.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'nearest' 
                        });
                    }, 300);
                }
            });
            
            // Accesibilidad: permitir Enter y Space
            image.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
            
            // Hacer focusable
            image.setAttribute('tabindex', '0');
            image.setAttribute('role', 'button');
            image.setAttribute('aria-label', 'Ver detalles del evento');
        });
        
        console.log(`✅ ${eventImages.length} event cards inicializados`);
    }

    // ===========================
    // FAQ ACCORDION
    // ===========================
    
    function initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        if (faqItems.length === 0) {
            console.log('ℹ️ No hay FAQs en esta página');
            return;
        }
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    const wasActive = item.classList.contains('active');
                    
                    // Opcional: cerrar otros FAQs
                    // document.querySelectorAll('.faq-item.active').forEach(otherItem => {
                    //     if (otherItem !== item) {
                    //         otherItem.classList.remove('active');
                    //     }
                    // });
                    
                    item.classList.toggle('active');
                    
                    // Accesibilidad
                    question.setAttribute('aria-expanded', !wasActive);
                });
                
                // Accesibilidad inicial
                question.setAttribute('role', 'button');
                question.setAttribute('aria-expanded', 'false');
                question.setAttribute('tabindex', '0');
                
                // Soporte de teclado
                question.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        question.click();
                    }
                });
            }
        });
        
        console.log(`✅ ${faqItems.length} FAQs inicializados`);
    }

    // ===========================
    // TABS SYSTEM
    // ===========================
    
    function initTabs() {
        // Exponer función global para HTML inline
        window.showTab = function(tabName, el) {
            // Ocultar todos los contenidos
            const contents = document.querySelectorAll('.tab-content');
            contents.forEach(content => content.classList.remove('active'));

            // Remover active de todos los tabs
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));

            // Mostrar el contenido seleccionado
            const selectedContent = document.getElementById(tabName);
            if (selectedContent) {
                selectedContent.classList.add('active');
                
                // Scroll suave al contenido
                setTimeout(() => {
                    selectedContent.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 100);
            }

            // Activar el tab clickeado
            if (el && el.classList) {
                el.classList.add('active');
            }
            
            // Guardar en localStorage
            try {
                localStorage.setItem('activeTab', tabName);
            } catch (e) {
                console.log('localStorage no disponible');
            }
        };
        
        // Restaurar tab activo desde localStorage
        try {
            const activeTab = localStorage.getItem('activeTab');
            if (activeTab && document.getElementById(activeTab)) {
                const tabButton = document.querySelector(`[onclick*="${activeTab}"]`);
                if (tabButton) {
                    showTab(activeTab, tabButton);
                }
            }
        } catch (e) {
            console.log('No se pudo restaurar tab activo');
        }
        
        const tabsExist = document.querySelectorAll('.tab').length > 0;
        if (tabsExist) {
            console.log('✅ Sistema de tabs inicializado');
        }
    }

    // ===========================
    // CLUBS MODALS
    // ===========================
    
    function initClubsModals() {
        // Exponer funciones globales
        window.openModal = function(id) {
            const modal = document.getElementById(id);
            if (modal) {
                modal.style.display = "block";
                document.body.style.overflow = "hidden";
                
                // Accesibilidad
                modal.setAttribute('aria-hidden', 'false');
                
                // Focus en el botón de cerrar
                const closeBtn = modal.querySelector('.close');
                if (closeBtn) {
                    setTimeout(() => closeBtn.focus(), 100);
                }
            }
        };

        window.closeModal = function(id) {
            const modal = document.getElementById(id);
            if (modal) {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
                
                // Accesibilidad
                modal.setAttribute('aria-hidden', 'true');
            }
        };

        // Cerrar modal al hacer clic fuera
        window.onclick = function(event) {
            const modals = document.getElementsByClassName('modal');
            for (let modal of modals) {
                if (event.target == modal) {
                    modal.style.display = "none";
                    document.body.style.overflow = "auto";
                    modal.setAttribute('aria-hidden', 'true');
                }
            }
        };
        
        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal[style*="display: block"]');
                modals.forEach(modal => {
                    modal.style.display = "none";
                    document.body.style.overflow = "auto";
                    modal.setAttribute('aria-hidden', 'true');
                });
            }
        });

        // Menu toggle para clubs
        window.toggleMenu = function() {
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                navMenu.classList.toggle('active');
            }
        };
        
        const modalsExist = document.querySelectorAll('.modal').length > 0;
        if (modalsExist) {
            console.log('✅ Modals inicializados');
        }
    }

    // ===========================
    // FORM VALIDATION
    // ===========================
    
    function initFormValidation() {
        const preregistroForm = document.getElementById('preregistroForm');
        
        if (preregistroForm) {
            window.handleSubmit = function(event) {
                event.preventDefault();
                
                // Obtener valores
                const nombre = document.getElementById('nombre')?.value;
                const email = document.getElementById('email')?.value;
                const curp = document.getElementById('curp')?.value;
                const especialidadSelect = document.getElementById('especialidad');
                const especialidad = especialidadSelect ? 
                    especialidadSelect.options[especialidadSelect.selectedIndex].text : '';
                
                // Validaciones
                if (!validateEmail(email)) {
                    showNotification('Por favor ingresa un email válido', 'error');
                    return;
                }
                
                if (curp && curp.length !== 18) {
                    showNotification('El CURP debe tener 18 caracteres', 'error');
                    return;
                }
                
                // Mostrar mensaje de éxito
                showNotification(
                    `¡Pre-registro exitoso!\n\nGracias ${nombre},\n\nHemos recibido tu solicitud para ${especialidad}.\n\nRecibirás un correo en ${email} con los siguientes pasos.`,
                    'success'
                );
                
                // Limpiar formulario
                preregistroForm.reset();
                
                // Scroll al inicio del formulario
                preregistroForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            
            console.log('✅ Validación de formulario inicializada');
        }
        
        // Validación en tiempo real para CURP
        const curpInput = document.getElementById('curp');
        if (curpInput) {
            curpInput.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
                if (this.value.length === 18) {
                    this.style.borderColor = '#28a745';
                } else if (this.value.length > 0) {
                    this.style.borderColor = '#ffc107';
                } else {
                    this.style.borderColor = '';
                }
            });
        }
        
        // Validación en tiempo real para email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value && !validateEmail(this.value)) {
                    this.style.borderColor = '#dc3545';
                    showNotification('Email inválido', 'error');
                } else if (this.value) {
                    this.style.borderColor = '#28a745';
                }
            });
        }
    }

    // ===========================
    // SCROLL TO TOP
    // ===========================
    
    function initScrollToTop() {
        // Crear botón si no existe
        if (!document.querySelector('.scroll-to-top')) {
            const button = document.createElement('button');
            button.className = 'scroll-to-top';
            button.innerHTML = '↑';
            button.setAttribute('aria-label', 'Volver arriba');
            button.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #8B1538 0%, #5A0F2A 100%);
                color: white;
                border: none;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(139, 21, 56, 0.3);
                z-index: 1000;
            `;
            
            button.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
            
            document.body.appendChild(button);
            
            // Mostrar/ocultar según scroll
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    button.style.opacity = '1';
                    button.style.visibility = 'visible';
                } else {
                    button.style.opacity = '0';
                    button.style.visibility = 'hidden';
                }
            });
            
            // Hover effect
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-5px) scale(1.1)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
            });
            
            console.log('✅ Botón scroll-to-top creado');
        }
    }

    // ===========================
    // LAZY LOADING
    // ===========================
    
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if (lazyImages.length === 0) {
            console.log('ℹ️ No hay imágenes lazy en esta página');
            return;
        }
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
            console.log(`✅ ${lazyImages.length} imágenes lazy inicializadas`);
        } else {
            // Fallback para navegadores sin soporte
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    // ===========================
    // ANIMATIONS
    // ===========================
    
    function initAnimations() {
        // Animar cards en scroll que NO tienen clase .reveal
        const cards = document.querySelectorAll('.card:not(.reveal)');
        
        if (cards.length > 0) {
            const cardObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('reveal', 'active');
                        }, index * 100);
                    }
                });
            }, { threshold: 0.1 });
            
            cards.forEach(card => {
                card.classList.add('reveal');
                cardObserver.observe(card);
            });
            
            console.log(`✅ ${cards.length} cards animados`);
        }
        
        // Contador animado para stats
        animateCounters();
    }

    // ===========================
    // UTILIDADES
    // ===========================
    
    // Validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Formatear fechas
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('es-MX', options);
    }

    // Scroll a elemento
    function scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Mostrar notificación
    function showNotification(message, type = 'info') {
        // Crear notificación si no existe
        let notification = document.querySelector('.custom-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'custom-notification';
            document.body.appendChild(notification);
            
            // Estilos inline
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                padding: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                transform: translateX(500px);
                transition: transform 0.3s ease;
                border-left: 4px solid #8B1538;
            `;
        }
        
        // Tipo de notificación
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        notification.style.borderLeftColor = colors[type] || colors.info;
        notification.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="font-size: 24px;">
                    ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
                </div>
                <div style="flex: 1; white-space: pre-line; color: #333; line-height: 1.6;">
                    ${message}
                </div>
                <button onclick="this.parentElement.parentElement.style.transform='translateX(500px)'" 
                        style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">
                    ×
                </button>
            </div>
        `;
        
        // Mostrar
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(500px)';
        }, 5000);
    }

    // Animar contadores
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number, .stat-number-large');
        
        if (counters.length === 0) {
            console.log('ℹ️ No hay contadores en esta página');
            return;
        }
        
        counters.forEach(counter => {
            // Solo si el contenido es numérico
            const text = counter.textContent;
            const number = parseInt(text.replace(/\D/g, ''));
            
            if (!isNaN(number) && number > 0) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animateValue(counter, 0, number, 2000);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(counter);
            }
        });
        
        console.log(`✅ ${counters.length} contadores inicializados`);
    }

    function animateValue(element, start, end, duration) {
        const originalText = element.textContent;
        const hasPlus = originalText.includes('+');
        const hasPercent = originalText.includes('%');
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            
            let displayValue = value.toString();
            if (hasPlus) displayValue += '+';
            if (hasPercent) displayValue += '%';
            
            element.textContent = displayValue;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Debounce para resize
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Exportar funciones globales
    window.formatDate = formatDate;
    window.validateEmail = validateEmail;
    window.scrollToElement = scrollToElement;
    window.showNotification = showNotification;

    // Performance monitoring
    if (window.performance && window.performance.measure) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`⏱️ Tiempo de carga: ${pageLoadTime}ms`);
            }, 0);
        });
    }

})();