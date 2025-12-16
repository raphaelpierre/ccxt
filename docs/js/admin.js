// ==========================================
// Admin JavaScript
// Handles admin panel functionality
// ==========================================

let currentEditingArtworkId = null;
let currentEditingCollectionId = null;

// ==========================================
// Tab Management
// ==========================================

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            // Remove active class from all tabs
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// ==========================================
// Artworks Management
// ==========================================

function loadArtworksList() {
    const container = document.getElementById('artworks-list');
    if (!container) return;

    const artworks = dataManager.getAllArtworks();

    if (artworks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #7f8c8d;">
                <p>Aucune œuvre pour le moment. Cliquez sur "Ajouter une Œuvre" pour commencer.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = artworks.map(artwork => {
        const collection = artwork.collectionId ? dataManager.getCollection(artwork.collectionId) : null;

        return `
            <div class="artwork-item">
                <img src="${artwork.image}" alt="${artwork.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ecf0f1%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%2395a5a6%22 font-family=%22sans-serif%22 font-size=%2212%22 text-anchor=%22middle%22 x=%2250%22 y=%2250%22%3EImage%3C/text%3E%3C/svg%3E'">
                <div class="item-info">
                    <h3>${artwork.title}${artwork.featured ? ' ⭐' : ''}</h3>
                    <p>${collection ? collection.name : 'Aucune collection'} ${artwork.year ? '• ' + artwork.year : ''}</p>
                    <p>${artwork.dimensions || ''} ${artwork.price ? '• ' + artwork.price : ''}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-icon btn-edit" onclick="editArtwork('${artwork.id}')">Modifier</button>
                    <button class="btn-icon btn-delete" onclick="deleteArtwork('${artwork.id}')">Supprimer</button>
                </div>
            </div>
        `;
    }).join('');
}

function openArtworkModal(artworkId = null) {
    const modal = document.getElementById('artwork-modal');
    const form = document.getElementById('artwork-form');
    const title = document.getElementById('artwork-modal-title');
    const collectionSelect = document.getElementById('artwork-collection');

    // Reset form
    form.reset();
    currentEditingArtworkId = artworkId;

    // Populate collection select
    const collections = dataManager.getAllCollections();
    collectionSelect.innerHTML = '<option value="">Aucune collection</option>' +
        collections.map(col => `<option value="${col.id}">${col.name}</option>`).join('');

    if (artworkId) {
        // Edit mode
        const artwork = dataManager.getArtwork(artworkId);
        if (artwork) {
            title.textContent = 'Modifier l\'Œuvre';
            document.getElementById('artwork-id').value = artwork.id;
            document.getElementById('artwork-title').value = artwork.title;
            document.getElementById('artwork-description').value = artwork.description || '';
            document.getElementById('artwork-collection').value = artwork.collectionId || '';
            document.getElementById('artwork-year').value = artwork.year || '';
            document.getElementById('artwork-dimensions').value = artwork.dimensions || '';
            document.getElementById('artwork-price').value = artwork.price || '';
            document.getElementById('artwork-image').value = artwork.image;
            document.getElementById('artwork-featured').checked = artwork.featured || false;
        }
    } else {
        // Add mode
        title.textContent = 'Ajouter une Œuvre';
    }

    modal.classList.add('active');
}

function closeArtworkModal() {
    const modal = document.getElementById('artwork-modal');
    modal.classList.remove('active');
    currentEditingArtworkId = null;
}

function saveArtwork(e) {
    e.preventDefault();

    const artworkData = {
        title: document.getElementById('artwork-title').value,
        description: document.getElementById('artwork-description').value,
        collectionId: document.getElementById('artwork-collection').value || null,
        year: document.getElementById('artwork-year').value || null,
        dimensions: document.getElementById('artwork-dimensions').value || null,
        price: document.getElementById('artwork-price').value || null,
        image: document.getElementById('artwork-image').value,
        featured: document.getElementById('artwork-featured').checked
    };

    if (currentEditingArtworkId) {
        // Update existing artwork
        dataManager.updateArtwork(currentEditingArtworkId, artworkData);
    } else {
        // Add new artwork
        dataManager.addArtwork(artworkData);
    }

    closeArtworkModal();
    loadArtworksList();
}

function editArtwork(id) {
    openArtworkModal(id);
}

function deleteArtwork(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette œuvre ?')) {
        dataManager.deleteArtwork(id);
        loadArtworksList();
    }
}

// ==========================================
// Collections Management
// ==========================================

function loadCollectionsList() {
    const container = document.getElementById('collections-list');
    if (!container) return;

    const collections = dataManager.getAllCollections();

    if (collections.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #7f8c8d;">
                <p>Aucune collection pour le moment. Cliquez sur "Créer une Collection" pour commencer.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = collections.map(collection => {
        const artworks = dataManager.getArtworksByCollection(collection.id);

        return `
            <div class="collection-item">
                <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                    ${artworks.length}
                </div>
                <div class="item-info">
                    <h3>${collection.name}</h3>
                    <p>${collection.description || ''}</p>
                    <p>${artworks.length} œuvre(s) ${collection.year ? '• Année: ' + collection.year : ''}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-icon btn-edit" onclick="editCollection('${collection.id}')">Modifier</button>
                    <button class="btn-icon btn-delete" onclick="deleteCollection('${collection.id}')">Supprimer</button>
                </div>
            </div>
        `;
    }).join('');
}

function openCollectionModal(collectionId = null) {
    const modal = document.getElementById('collection-modal');
    const form = document.getElementById('collection-form');
    const title = document.getElementById('collection-modal-title');

    // Reset form
    form.reset();
    currentEditingCollectionId = collectionId;

    if (collectionId) {
        // Edit mode
        const collection = dataManager.getCollection(collectionId);
        if (collection) {
            title.textContent = 'Modifier la Collection';
            document.getElementById('collection-id').value = collection.id;
            document.getElementById('collection-name').value = collection.name;
            document.getElementById('collection-description').value = collection.description || '';
            document.getElementById('collection-year').value = collection.year || '';
        }
    } else {
        // Add mode
        title.textContent = 'Créer une Collection';
    }

    modal.classList.add('active');
}

function closeCollectionModal() {
    const modal = document.getElementById('collection-modal');
    modal.classList.remove('active');
    currentEditingCollectionId = null;
}

function saveCollection(e) {
    e.preventDefault();

    const collectionData = {
        name: document.getElementById('collection-name').value,
        description: document.getElementById('collection-description').value,
        year: document.getElementById('collection-year').value || null
    };

    if (currentEditingCollectionId) {
        // Update existing collection
        dataManager.updateCollection(currentEditingCollectionId, collectionData);
    } else {
        // Add new collection
        dataManager.addCollection(collectionData);
    }

    closeCollectionModal();
    loadCollectionsList();
}

function editCollection(id) {
    openCollectionModal(id);
}

function deleteCollection(id) {
    const artworks = dataManager.getArtworksByCollection(id);
    let message = 'Êtes-vous sûr de vouloir supprimer cette collection ?';

    if (artworks.length > 0) {
        message += `\n\nAttention : ${artworks.length} œuvre(s) sont liées à cette collection. Elles ne seront pas supprimées mais n'auront plus de collection assignée.`;
    }

    if (confirm(message)) {
        dataManager.deleteCollection(id);
        loadCollectionsList();
        loadArtworksList();
    }
}

// ==========================================
// Import/Export Functions
// ==========================================

function exportData() {
    const data = dataManager.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Données exportées avec succès !');
}

function importData() {
    const input = document.getElementById('import-file');
    input.click();
}

function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);

            if (confirm('Importer ces données remplacera toutes vos données actuelles. Continuer ?')) {
                dataManager.importData(data);
                loadArtworksList();
                loadCollectionsList();
                alert('Données importées avec succès !');
            }
        } catch (error) {
            alert('Erreur lors de l\'import : fichier JSON invalide.');
        }
    };
    reader.readAsText(file);
}

function resetData() {
    if (confirm('ATTENTION : Cette action supprimera toutes vos données de manière irréversible.\n\nIl est recommandé d\'exporter vos données avant de continuer.\n\nVoulez-vous vraiment tout supprimer ?')) {
        if (confirm('Dernière confirmation : Êtes-vous absolument sûr ?')) {
            dataManager.resetData();
            loadArtworksList();
            loadCollectionsList();
            alert('Toutes les données ont été supprimées.');
        }
    }
}

// ==========================================
// Event Listeners
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Only run on admin page
    if (!window.location.pathname.includes('admin.html')) return;

    // Setup tabs
    setupTabs();

    // Load lists
    loadArtworksList();
    loadCollectionsList();

    // Add Artwork Button
    const addArtworkBtn = document.getElementById('add-artwork-btn');
    if (addArtworkBtn) {
        addArtworkBtn.addEventListener('click', () => openArtworkModal());
    }

    // Add Collection Button
    const addCollectionBtn = document.getElementById('add-collection-btn');
    if (addCollectionBtn) {
        addCollectionBtn.addEventListener('click', () => openCollectionModal());
    }

    // Artwork Form
    const artworkForm = document.getElementById('artwork-form');
    if (artworkForm) {
        artworkForm.addEventListener('submit', saveArtwork);
    }

    // Collection Form
    const collectionForm = document.getElementById('collection-form');
    if (collectionForm) {
        collectionForm.addEventListener('submit', saveCollection);
    }

    // Cancel buttons
    document.getElementById('cancel-artwork')?.addEventListener('click', closeArtworkModal);
    document.getElementById('cancel-collection')?.addEventListener('click', closeCollectionModal);

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // Export/Import/Reset buttons
    document.getElementById('export-data-btn')?.addEventListener('click', exportData);
    document.getElementById('import-data-btn')?.addEventListener('click', importData);
    document.getElementById('reset-data-btn')?.addEventListener('click', resetData);

    // Import file input
    const importFile = document.getElementById('import-file');
    if (importFile) {
        importFile.addEventListener('change', handleImportFile);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Close modals with Escape
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
});
