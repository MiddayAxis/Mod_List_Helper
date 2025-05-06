// DOM Elements
const modNameInput = document.getElementById('modName');
const modWebsiteInput = document.getElementById('modWebsite');
const modDescriptionInput = document.getElementById('modDescription');
const addModBtn = document.getElementById('addModBtn');
const modListContainer = document.getElementById('modList');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const exportCurseForgeBtn = document.getElementById('exportCurseForgeBtn');
const exportModrinthBtn = document.getElementById('exportModrinthBtn');
const editModal = document.getElementById('editModal');
const closeButton = document.querySelector('.close-button');
const editModNameInput = document.getElementById('editModName');
const editModWebsiteInput = document.getElementById('editModWebsite');
const editModDescriptionInput = document.getElementById('editModDescription');
const saveEditBtn = document.getElementById('saveEditBtn');

// Current edit index
let currentEditIndex = -1;

// Load mods on startup
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded - initializing application');
  loadMods();
});

// Add mod event
addModBtn.addEventListener('click', addMod);

// Import/Export events
importBtn.addEventListener('click', importMods);
exportBtn.addEventListener('click', exportMods);
exportCurseForgeBtn.addEventListener('click', () => exportModZip('CurseForge'));
exportModrinthBtn.addEventListener('click', () => exportModZip('Modrinth'));

// Modal events
closeButton.addEventListener('click', closeModal);
saveEditBtn.addEventListener('click', saveMod);

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === editModal) {
    closeModal();
  }
});

// Load mods from storage
async function loadMods() {
  try {
    const mods = await window.api.getMods();
    renderModList(mods);
  } catch (error) {
    console.error('Error loading mods:', error);
  }
}

// Add a new mod
async function addMod() {
  const name = modNameInput.value.trim();
  const website = modWebsiteInput.value.trim();
  const description = modDescriptionInput.value.trim();
  
  if (!name) {
    alert('Please enter a mod name');
    return;
  }
  
  try {
    const newMod = { name, website, description };
    await window.api.addMod(newMod);
    
    // Clear inputs
    modNameInput.value = '';
    modWebsiteInput.value = '';
    modDescriptionInput.value = '';
    
    // Reload mods
    loadMods();
  } catch (error) {
    console.error('Error adding mod:', error);
  }
}

// Render the mod list
function renderModList(mods) {
  modListContainer.innerHTML = '';
  
  if (mods.length === 0) {
    modListContainer.innerHTML = '<div class="mod-item">No mods added yet. Add your first mod above!</div>';
    return;
  }
  
  mods.forEach((mod, index) => {
    const modItem = document.createElement('div');
    modItem.className = 'mod-item';
    
    // Create the mod item with simple structure
    modItem.innerHTML = `
      <div class="mod-name-col"><span class="truncate-text">${mod.name}</span></div>
      <div class="mod-website-col">${mod.website ? 
        `<a href="${mod.website}" class="website-link truncate-text" target="_blank">${mod.website}</a>` : 
        '<span class="no-link">No website provided</span>'}
      </div>
      <div class="mod-description-col"><span class="truncate-text">${mod.description || 'No description'}</span></div>
      <div class="mod-actions-col">
        <button class="edit-button" data-index="${index}">Edit</button>
        <button class="delete-button" data-index="${index}">Delete</button>
      </div>
    `;
    
    modListContainer.appendChild(modItem);
    
    // Add event listeners for edit and delete buttons
    const editButton = modItem.querySelector('.edit-button');
    const deleteButton = modItem.querySelector('.delete-button');
    
    editButton.addEventListener('click', () => openEditModal(index));
    deleteButton.addEventListener('click', () => deleteMod(index));
  });
}

// Open edit modal
async function openEditModal(index) {
  try {
    const mods = await window.api.getMods();
    const mod = mods[index];
    
    editModNameInput.value = mod.name;
    editModWebsiteInput.value = mod.website || '';
    editModDescriptionInput.value = mod.description || '';
    
    currentEditIndex = index;
    editModal.style.display = 'block';
  } catch (error) {
    console.error('Error opening edit modal:', error);
  }
}

// Close edit modal
function closeModal() {
  editModal.style.display = 'none';
  currentEditIndex = -1;
}

// Save edited mod
async function saveMod() {
  if (currentEditIndex === -1) return;
  
  const name = editModNameInput.value.trim();
  const website = editModWebsiteInput.value.trim();
  const description = editModDescriptionInput.value.trim();
  
  if (!name) {
    alert('Please enter a mod name');
    return;
  }
  
  try {
    const updatedMod = { name, website, description };
    await window.api.updateMod(currentEditIndex, updatedMod);
    
    closeModal();
    loadMods();
  } catch (error) {
    console.error('Error saving mod:', error);
  }
}

// Delete a mod
async function deleteMod(index) {
  if (confirm('Are you sure you want to delete this mod?')) {
    try {
      await window.api.deleteMod(index);
      loadMods();
    } catch (error) {
      console.error('Error deleting mod:', error);
    }
  }
}

// Import mods from CSV
async function importMods() {
  try {
    const result = await window.api.importCsv();
    if (result) {
      loadMods();
      alert('Mods imported successfully!');
    }
  } catch (error) {
    console.error('Error importing mods:', error);
    alert('Error importing mods. Please check the console for details.');
  }
}

// Export mods to CSV
async function exportMods() {
  try {
    const result = await window.api.exportCsv();
    if (result) {
      alert('Mods exported successfully!');
    }
  } catch (error) {
    console.error('Error exporting mods:', error);
    alert('Error exporting mods. Please check the console for details.');
  }
}

// Export mods as CurseForge or Modrinth zip
async function exportModZip(platform) {
  try {
    // Check if there are any mods to export
    const mods = await window.api.getMods();
    if (mods.length === 0) {
      alert('No mods to export. Please add some mods first.');
      return;
    }
    
    // Show loading state
    const button = platform === 'CurseForge' ? exportCurseForgeBtn : exportModrinthBtn;
    const originalText = button.textContent;
    button.textContent = 'Exporting...';
    button.disabled = true;
    
    // Call the export function
    const result = await window.api.exportModZip(platform);
    
    // Reset button state
    button.textContent = originalText;
    button.disabled = false;
    
    // Show result
    if (result.success) {
      alert(result.message);
    } else {
      alert(`Export failed: ${result.message}`);
    }
  } catch (error) {
    console.error(`Error exporting as ${platform}:`, error);
    alert(`Error exporting as ${platform}. Please check the console for details.`);
    
    // Reset button state in case of error
    const button = platform === 'CurseForge' ? exportCurseForgeBtn : exportModrinthBtn;
    button.textContent = platform;
    button.disabled = false;
  }
}

