// ==========================================
// Gallery JavaScript
// Handles gallery display and lightbox
// ==========================================

let currentArtworks = [];
let currentArtworkIndex = 0;

// ==========================================
// Gallery Display
// ==========================================

function displayGallery(filterCollectionId = 'all') {
    const galleryGrid = document.getElementById('gallery-grid');
    const noArtworks = document.getElementById('no-artworks');

    if (!galleryGrid) return;

    let artworks = dataManager.getAllArtworks();

    // Filter by collection if needed
    if (filterCollectionId !== 'all') {
        artworks = artworks.filter(a => a.collectionId === filterCollectionId);
    }

    currentArtworks = artworks;

    if (artworks.length === 0) {
        galleryGrid.style.display = 'none';
        noArtworks.style.display = 'block';
        return;
    }

    galleryGrid.style.display = 'grid';
    noArtworks.style.display = 'none';

    galleryGrid.innerHTML = artworks.map((artwork, index) => {
        const collection = artwork.collectionId ? dataManager.getCollection(artwork.collectionId) : null;

        return `
            <div class="artwork-card" onclick="openLightbox(${index})">
                <div class="artwork-card-image">
                    <img src="${artwork.image}" alt="${artwork.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23ecf0f1%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%2395a5a6%22 font-family=%22sans-serif%22 font-size=%2220%22 text-anchor=%22middle%22 x=%22200%22 y=%22200%22%3E${artwork.title}%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="artwork-card-content">
                    <h3>${artwork.title}</h3>
                    <div class="artwork-card-meta">
                        ${collection ? `<span>${collection.name}</span>` : ''}
                        ${artwork.year ? `<span>${artwork.year}</span>` : ''}
                        ${artwork.dimensions ? `<span>${artwork.dimensions}</span>` : ''}
                    </div>
                    <p>${artwork.description ? artwork.description.substring(0, 120) + (artwork.description.length > 120 ? '...' : '') : ''}</p>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// Filters
// ==========================================

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const collectionSelect = document.getElementById('collection-filter');
    const collectionSelectContainer = document.querySelector('.collection-select-container');

    // Populate collection select
    if (collectionSelect) {
        const collections = dataManager.getAllCollections();
        const collectionsHTML = collections.map(col =>
            `<option value="${col.id}">${col.name}</option>`
        ).join('');

        collectionSelect.innerHTML = '<option value="all">Toutes les collections</option>' + collectionsHTML;
    }

    // Filter buttons
    if (filterButtons) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');

                const filter = this.dataset.filter;

                if (filter === 'all') {
                    collectionSelectContainer.style.display = 'none';
                    displayGallery('all');
                } else if (filter === 'collection') {
                    collectionSelectContainer.style.display = 'block';
                    displayGallery(collectionSelect.value);
                }
            });
        });
    }

    // Collection select change
    if (collectionSelect) {
        collectionSelect.addEventListener('change', function() {
            displayGallery(this.value);
        });
    }
}

// ==========================================
// Lightbox
// ==========================================

function openLightbox(index) {
    currentArtworkIndex = index;
    const artwork = currentArtworks[index];
    const lightbox = document.getElementById('lightbox');

    if (!lightbox || !artwork) return;

    const collection = artwork.collectionId ? dataManager.getCollection(artwork.collectionId) : null;

    // Update lightbox content
    document.getElementById('lightbox-image').src = artwork.image;
    document.getElementById('lightbox-title').textContent = artwork.title;
    document.getElementById('lightbox-description').textContent = artwork.description || '';

    document.getElementById('lightbox-collection').textContent = collection ? `Collection: ${collection.name}` : '';
    document.getElementById('lightbox-dimensions').textContent = artwork.dimensions ? `Dimensions: ${artwork.dimensions}` : '';
    document.getElementById('lightbox-year').textContent = artwork.year ? `Année: ${artwork.year}` : '';
    document.getElementById('lightbox-price').textContent = artwork.price || '';

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function nextArtwork() {
    currentArtworkIndex = (currentArtworkIndex + 1) % currentArtworks.length;
    openLightbox(currentArtworkIndex);
}

function prevArtwork() {
    currentArtworkIndex = (currentArtworkIndex - 1 + currentArtworks.length) % currentArtworks.length;
    openLightbox(currentArtworkIndex);
}

// ==========================================
// Event Listeners
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Only run on gallery page
    if (!window.location.pathname.includes('gallery.html')) return;

    // Load gallery
    displayGallery();

    // Setup filters
    setupFilters();

    // Lightbox close button
    const lightboxClose = document.querySelector('.lightbox-close');
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Lightbox navigation
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            prevArtwork();
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            nextArtwork();
        });
    }

    // Close lightbox when clicking outside
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === this) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox || !lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            prevArtwork();
        } else if (e.key === 'ArrowRight') {
            nextArtwork();
        }
    });
});
