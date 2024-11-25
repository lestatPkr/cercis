document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;

    const filters = document.querySelectorAll('.gallery-filter');
    const items = document.querySelectorAll('.gallery-item');
    let currentImageIndex = 0;

    // Initialize Masonry layout with animation
    const masonryGrid = new Masonry(gallery, {
        itemSelector: '.gallery-item',
        columnWidth: '.gallery-item',
        percentPosition: true,
        gutter: 30,
        transitionDuration: '0.3s',
        stagger: 30
    });

    // Enhanced Filter functionality with animations
    filters.forEach(filter => {
        filter.addEventListener('click', function(e) {
            e.preventDefault();
            
            filters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-filter');
            
            items.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    if (category === 'all' || category === itemCategory) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.display = 'none';
                    }
                    masonryGrid.layout();
                }, 300);
            });
        });
    });

    // Advanced Lightbox functionality
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
            <div class="lightbox-image-container">
                <img src="" alt="" class="lightbox-image">
            </div>
            <div class="lightbox-caption"></div>
            <div class="lightbox-counter"></div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    const visibleItems = () => Array.from(items).filter(item => item.style.display !== 'none');

    function updateLightboxContent(index) {
        const activeItems = visibleItems();
        const item = activeItems[index];
        const img = item.querySelector('img');
        const caption = item.querySelector('.overlay h4')?.textContent;
        
        lightboxImage.src = img.dataset.src || img.src;
        lightboxCaption.textContent = caption || '';
        lightboxCounter.textContent = `${index + 1} / ${activeItems.length}`;
        currentImageIndex = index;
    }

    // Zoom functionality
    let scale = 1;
    lightboxImage.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        scale = Math.min(Math.max(1, scale + delta), 3);
        this.style.transform = `scale(${scale})`;
    });

    // Navigation buttons and keyboard controls
    function navigate(direction) {
        const activeItems = visibleItems();
        currentImageIndex = (currentImageIndex + direction + activeItems.length) % activeItems.length;
        updateLightboxContent(currentImageIndex);
    }

    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigate(-1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigate(1));
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        lightbox.classList.remove('active');
        scale = 1;
        lightboxImage.style.transform = 'scale(1)';
    });

    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'ArrowLeft': navigate(-1); break;
            case 'ArrowRight': navigate(1); break;
            case 'Escape': lightbox.classList.remove('active'); break;
        }
    });

    // Enhanced item click handler
    items.forEach((item, index) => {
        item.addEventListener('click', function() {
            currentImageIndex = visibleItems().indexOf(this);
            updateLightboxContent(currentImageIndex);
            lightbox.classList.add('active');
        });
    });

    // Advanced Lazy loading with blur-up effect
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img.dataset.src) {
                    const highResImage = new Image();
                    highResImage.src = img.dataset.src;
                    highResImage.onload = () => {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                    };
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    });

    items.forEach(item => {
        imageObserver.observe(item);
    });
});
