// ==========================================
// Main JavaScript File
// Handles navigation, data management, and common functions
// ==========================================

// ==========================================
// Data Management
// ==========================================

class DataManager {
    constructor() {
        this.collections = [];
        this.artworks = [];
        this.init();
    }

    init() {
        this.loadData();
        if (this.collections.length === 0 && this.artworks.length === 0) {
            this.loadSampleData();
        }
    }

    loadData() {
        const collectionsData = localStorage.getItem('art_collections');
        const artworksData = localStorage.getItem('art_artworks');

        if (collectionsData) {
            this.collections = JSON.parse(collectionsData);
        }

        if (artworksData) {
            this.artworks = JSON.parse(artworksData);
        }
    }

    saveData() {
        localStorage.setItem('art_collections', JSON.stringify(this.collections));
        localStorage.setItem('art_artworks', JSON.stringify(this.artworks));
    }

    // Collections Methods
    addCollection(collection) {
        collection.id = this.generateId();
        this.collections.push(collection);
        this.saveData();
        return collection;
    }

    updateCollection(id, updatedCollection) {
        const index = this.collections.findIndex(c => c.id === id);
        if (index !== -1) {
            this.collections[index] = { ...this.collections[index], ...updatedCollection };
            this.saveData();
            return true;
        }
        return false;
    }

    deleteCollection(id) {
        this.collections = this.collections.filter(c => c.id !== id);
        // Also remove collection reference from artworks
        this.artworks.forEach(artwork => {
            if (artwork.collectionId === id) {
                artwork.collectionId = null;
            }
        });
        this.saveData();
    }

    getCollection(id) {
        return this.collections.find(c => c.id === id);
    }

    getAllCollections() {
        return this.collections;
    }

    // Artworks Methods
    addArtwork(artwork) {
        artwork.id = this.generateId();
        this.artworks.push(artwork);
        this.saveData();
        return artwork;
    }

    updateArtwork(id, updatedArtwork) {
        const index = this.artworks.findIndex(a => a.id === id);
        if (index !== -1) {
            this.artworks[index] = { ...this.artworks[index], ...updatedArtwork };
            this.saveData();
            return true;
        }
        return false;
    }

    deleteArtwork(id) {
        this.artworks = this.artworks.filter(a => a.id !== id);
        this.saveData();
    }

    getArtwork(id) {
        return this.artworks.find(a => a.id === id);
    }

    getAllArtworks() {
        return this.artworks;
    }

    getFeaturedArtworks() {
        return this.artworks.filter(a => a.featured);
    }

    getArtworksByCollection(collectionId) {
        return this.artworks.filter(a => a.collectionId === collectionId);
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    exportData() {
        return {
            collections: this.collections,
            artworks: this.artworks,
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        if (data.collections) {
            this.collections = data.collections;
        }
        if (data.artworks) {
            this.artworks = data.artworks;
        }
        this.saveData();
    }

    resetData() {
        this.collections = [];
        this.artworks = [];
        this.saveData();
    }

    loadSampleData() {
        // Sample collections
        const sampleCollections = [
            {
                id: 'col1',
                name: 'Emotions d\'Automne',
                description: 'Une collection inspirée par les couleurs chaudes de l\'automne',
                year: 2024
            },
            {
                id: 'col2',
                name: 'Abstractions',
                description: 'Exploration de formes et couleurs abstraites',
                year: 2023
            },
            {
                id: 'col3',
                name: 'Paysages Rêvés',
                description: 'Des paysages imaginaires entre réalité et rêve',
                year: 2024
            }
        ];

        // Sample artworks
        const sampleArtworks = [
            {
                id: 'art1',
                title: 'Lever de Soleil',
                description: 'Un magnifique lever de soleil aux tons orangés',
                collectionId: 'col1',
                year: 2024,
                dimensions: '60x80 cm',
                price: '450€',
                image: 'images/artworks/placeholder1.jpg',
                featured: true
            },
            {
                id: 'art2',
                title: 'Formes Géométriques',
                description: 'Jeu de formes et de couleurs primaires',
                collectionId: 'col2',
                year: 2023,
                dimensions: '50x50 cm',
                price: '350€',
                image: 'images/artworks/placeholder2.jpg',
                featured: true
            },
            {
                id: 'art3',
                title: 'Montagne Mystique',
                description: 'Une montagne enveloppée de brume',
                collectionId: 'col3',
                year: 2024,
                dimensions: '70x100 cm',
                price: '600€',
                image: 'images/artworks/placeholder3.jpg',
                featured: false
            }
        ];

        this.collections = sampleCollections;
        this.artworks = sampleArtworks;
        this.saveData();
    }
}

// Initialize data manager
const dataManager = new DataManager();

// ==========================================
// Navigation Menu Toggle
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');

            // Animate hamburger
            const spans = hamburger.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            });
        });
    }
});

// ==========================================
// Homepage Functions
// ==========================================

function loadLatestCollections() {
    const container = document.getElementById('latest-collections');
    if (!container) return;

    const collections = dataManager.getAllCollections().slice(0, 3);

    if (collections.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p>Aucune collection pour le moment.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = collections.map(collection => {
        const artworks = dataManager.getArtworksByCollection(collection.id);
        const thumbnail = artworks.length > 0 ? artworks[0].image : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ecf0f1%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%2395a5a6%22 font-family=%22sans-serif%22 font-size=%2220%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3ECollection%3C/text%3E%3C/svg%3E';

        return `
            <div class="collection-card" onclick="window.location.href='gallery.html'">
                <div class="collection-card-image">
                    <img src="${thumbnail}" alt="${collection.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ecf0f1%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%2395a5a6%22 font-family=%22sans-serif%22 font-size=%2220%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22%3E${collection.name}%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="collection-card-content">
                    <h3>${collection.name}</h3>
                    <p>${collection.description || ''}</p>
                    <p><small>${artworks.length} œuvre(s)</small></p>
                </div>
            </div>
        `;
    }).join('');
}

function loadFeaturedArtworks() {
    const container = document.getElementById('featured-artworks');
    if (!container) return;

    const artworks = dataManager.getFeaturedArtworks().slice(0, 6);

    if (artworks.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p>Aucune œuvre en vedette pour le moment.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = artworks.map(artwork => {
        const collection = artwork.collectionId ? dataManager.getCollection(artwork.collectionId) : null;

        return `
            <div class="artwork-card" onclick="window.location.href='gallery.html'">
                <div class="artwork-card-image">
                    <img src="${artwork.image}" alt="${artwork.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23ecf0f1%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%2395a5a6%22 font-family=%22sans-serif%22 font-size=%2220%22 text-anchor=%22middle%22 x=%22200%22 y=%22200%22%3E${artwork.title}%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="artwork-card-content">
                    <h3>${artwork.title}</h3>
                    <div class="artwork-card-meta">
                        ${collection ? `<span>${collection.name}</span>` : ''}
                        ${artwork.year ? `<span>${artwork.year}</span>` : ''}
                    </div>
                    <p>${artwork.description ? artwork.description.substring(0, 100) + (artwork.description.length > 100 ? '...' : '') : ''}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Load data on homepage
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadLatestCollections();
        loadFeaturedArtworks();
    });
}

// ==========================================
// Contact Form Handler
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // In a real application, you would send this to a server
            alert('Merci pour votre message! Je vous répondrai bientôt.');
            contactForm.reset();
        });
    }
});

// ==========================================
// Smooth Scroll for Anchor Links
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
