// CETIS 131 - Sistema de Especialidades
// Versión: 1.0 - Carruseles y Modales Premium

(function() {
    'use strict';

    // Estado de los carruseles
    const carouselStates = {
        programacion: { currentIndex: 0, totalSlides: 5 },
        administracion: { currentIndex: 0, totalSlides: 5 },
        smec: { currentIndex: 0, totalSlides: 5 },
        mantenimiento: { currentIndex: 0, totalSlides: 5 },
        ciberseguridad: { currentIndex: 0, totalSlides: 5 }
    };

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🎓 Sistema de Especialidades CETIS 131 inicializado');
        initializeCarouselIndicators();
        initializeAutoPlay();
    });

    // Crear indicadores de carrusel
    function initializeCarouselIndicators() {
        Object.keys(carouselStates).forEach(specialty => {
            const indicatorsContainer = document.getElementById(`indicators-${specialty}`);
            if (!indicatorsContainer) return;

            indicatorsContainer.innerHTML = '';
            const totalSlides = carouselStates[specialty].totalSlides;

            for (let i = 0; i < totalSlides; i++) {
                const indicator = document.createElement('span');
                indicator.className = 'indicator';
                if (i === 0) indicator.classList.add('active');
                indicator.onclick = () => goToSlide(specialty, i);
                indicatorsContainer.appendChild(indicator);
            }
        });
    }

    // Auto-play de carruseles
    function initializeAutoPlay() {
        Object.keys(carouselStates).forEach(specialty => {
            setInterval(() => {
                const modal = document.getElementById(`modal-${specialty}`);
                if (modal && modal.style.display === 'block') {
                    changeCarouselSlide(specialty, 1);
                }
            }, 5000);
        });
    }

    // Abrir modal de especialidad
    window.openSpecialtyModal = function(specialty) {
        const modal = document.getElementById(`modal-${specialty}`);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Reset al primer slide
            carouselStates[specialty].currentIndex = 0;
            updateCarousel(specialty);
            
            // Animación de entrada
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.animation = 'slideUp 0.4s ease';
            }
        }
    };

    // Cerrar modal de especialidad
    window.closeSpecialtyModal = function(specialty) {
        const modal = document.getElementById(`modal-${specialty}`);
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.animation = 'slideDown 0.3s ease';
            }
            
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    };

    // Cambiar slide del carrusel
    window.changeCarouselSlide = function(specialty, direction) {
        const state = carouselStates[specialty];
        if (!state) return;

        state.currentIndex += direction;

        // Loop infinito
        if (state.currentIndex >= state.totalSlides) {
            state.currentIndex = 0;
        }
        if (state.currentIndex < 0) {
            state.currentIndex = state.totalSlides - 1;
        }

        updateCarousel(specialty);
    };

    // Ir a un slide específico
    window.goToSlide = function(specialty, index) {
        const state = carouselStates[specialty];
        if (!state) return;

        state.currentIndex = index;
        updateCarousel(specialty);
    };

    // Actualizar visualización del carrusel
    function updateCarousel(specialty) {
        const state = carouselStates[specialty];
        if (!state) return;

        const carousel = document.getElementById(`carousel-${specialty}`);
        if (!carousel) return;

        // Mover el carrusel
        const offset = -state.currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;

        // Actualizar indicadores
        const indicators = document.querySelectorAll(`#indicators-${specialty} .indicator`);
        indicators.forEach((indicator, index) => {
            if (index === state.currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        if (event.target.classList.contains('specialty-modal')) {
            const modalId = event.target.id.replace('modal-', '');
            closeSpecialtyModal(modalId);
        }
    };

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            Object.keys(carouselStates).forEach(specialty => {
                const modal = document.getElementById(`modal-${specialty}`);
                if (modal && modal.style.display === 'block') {
                    closeSpecialtyModal(specialty);
                }
            });
        }
    });

    // Manejo de errores de imágenes
    window.addEventListener('load', () => {
        document.querySelectorAll('.carousel img').forEach(img => {
            img.onerror = () => {
                console.warn(`Error cargando imagen: ${img.src}`);
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"%3E%3Crect fill="%238B1538" width="800" height="400"/%3E%3Ctext x="400" y="200" font-family="Arial" font-size="24" fill="white" text-anchor="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
            };
        });
    });

    console.log('✅ Sistema de especialidades completamente cargado');

})();