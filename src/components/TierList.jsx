import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './writing/Writing.scss';
import './TierList.scss';

const TierList = () => {
  const location = useLocation();
  const isTierListActive = location.pathname === '/tier-list';
  const isHomeActive = location.pathname === '/';
  const isDraftsActive = location.pathname.startsWith('/drafts');

  // Check if we're on localhost (for showing edit/add options)
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Toggle between public (read-only) and dev (editing enabled) view
  const [isDevView, setIsDevView] = useState(true); // Default to dev view on localhost

  // Show edit options only if on localhost AND in dev view
  const showEditOptions = isLocalhost && isDevView;

  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const listRef = useRef(null);
  const editInputRef = useRef(null);

  // Load data from tier_list_published.json
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/tier_list_published.json');
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('tier_list_published');
        if (saved) {
          setItems(JSON.parse(saved));
        }
      }
    };
    loadData();
  }, []);

  // Save to localStorage whenever items change (as backup)
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('tier_list_published', JSON.stringify(items));
    } else {
      localStorage.removeItem('tier_list_published');
    }
  }, [items]);

  // Handle keyboard shortcuts (only in dev view on localhost)
  useEffect(() => {
    // Don't register keyboard shortcuts if not in dev view
    if (!showEditOptions) return;

    const handleKeyDown = (e) => {
      // If no items, nothing to do
      if (items.length === 0) return;
      
      // Don't handle shortcuts if we're editing
      if (editingId !== null) return;

      // Arrow keys for navigation (move selection)
      if (e.key === 'ArrowUp' && !e.shiftKey) {
        e.preventDefault();
        if (selectedIndex === null) {
          // If nothing selected, select the last item
          setSelectedIndex(items.length - 1);
        } else if (selectedIndex > 0) {
          // Move selection up
          setSelectedIndex(selectedIndex - 1);
        }
      } else if (e.key === 'ArrowDown' && !e.shiftKey) {
        e.preventDefault();
        if (selectedIndex === null) {
          // If nothing selected, select the first item
          setSelectedIndex(0);
        } else if (selectedIndex < items.length - 1) {
          // Move selection down
          setSelectedIndex(selectedIndex + 1);
        }
      }
      // Shift + Arrow keys for moving items (reordering)
      else if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedIndex !== null && selectedIndex > 0) {
          const newItems = [...items];
          [newItems[selectedIndex - 1], newItems[selectedIndex]] = 
            [newItems[selectedIndex], newItems[selectedIndex - 1]];
          setItems(newItems);
          setSelectedIndex(selectedIndex - 1);
        }
      } else if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedIndex !== null && selectedIndex < items.length - 1) {
          const newItems = [...items];
          [newItems[selectedIndex], newItems[selectedIndex + 1]] = 
            [newItems[selectedIndex + 1], newItems[selectedIndex]];
          setItems(newItems);
          setSelectedIndex(selectedIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items, editingId, showEditOptions]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newItemName.trim(),
      category: 'Uncategorized',
      dateAdded: new Date().toISOString(),
    };

    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setSelectedIndex(items.length); // Select the newly added item
  };

  const deleteItem = (id) => {
    if (window.confirm('Delete this item?')) {
      setItems(prev => prev.filter(item => item.id !== id));
      setSelectedIndex(null);
    }
  };

  const startEdit = (item, e) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditName(item.name);
    // Focus the input after state updates
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  };

  const saveEdit = (id) => {
    if (!editName.trim()) {
      // If empty, cancel edit
      cancelEdit();
      return;
    }

    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, name: editName.trim() }
        : item
    ));
    setEditingId(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const moveItemUp = (index, e) => {
    e.stopPropagation();
    if (index > 0) {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = 
        [newItems[index], newItems[index - 1]];
      setItems(newItems);
      setSelectedIndex(index - 1);
    }
  };

  const moveItemDown = (index, e) => {
    e.stopPropagation();
    if (index < items.length - 1) {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = 
        [newItems[index + 1], newItems[index]];
      setItems(newItems);
      setSelectedIndex(index + 1);
    }
  };

  // Export to JSON (download backup)
  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tier_list_published.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Save to tier_list_published.json file
  const saveToPublished = async () => {
    try {
      // Save to localStorage as backup
      localStorage.setItem('tier_list_published', JSON.stringify(items));
      
      // Send to API to save to file
      const response = await fetch('/api/save-published', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save file');
      }

      const result = await response.json();
      alert('Saved successfully!');
      console.log('Save result:', result);
    } catch (error) {
      console.error('Error saving:', error);
      alert(`Error saving: ${error.message}`);
    }
  };

  return (
    <div className="writing-page">
      <div className="writing-header">
        <Link 
          to="/" 
          className={`header-option ${isHomeActive ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          to="/drafts" 
          className={`header-option ${isDraftsActive ? 'active' : ''}`}
        >
          Drafts
        </Link>
        <Link 
          to="/tier-list" 
          className={`header-option ${isTierListActive ? 'active' : ''}`}
        >
          Tier List
        </Link>
      </div>

      <div className="tier-list-header">
        <h1>Tier List</h1>
        {isLocalhost && (
          <div className="view-toggle">
            <button
              onClick={() => setIsDevView(!isDevView)}
              className={`toggle-button ${isDevView ? 'dev' : 'public'}`}
              title={isDevView ? 'Switch to public view' : 'Switch to dev view'}
            >
              {isDevView ? 'dev' : 'public'}
            </button>
          </div>
        )}
      </div>
      
      {showEditOptions && (
        <>
          <div className="action-buttons">
            <button onClick={saveToPublished} className="save-link">
              save
            </button>
            <button onClick={exportToJSON} className="export-link">
              export json
            </button>
          </div>

          <form onSubmit={handleAddItem} className="add-place-form">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              required
            />
            <button type="submit">Add</button>
          </form>
        </>
      )}

      {items.length > 0 ? (
        <ul className="places-list" ref={listRef}>
          {items.map((item, index) => (
            <li 
              key={item.id}
              className={selectedIndex === index ? 'selected' : ''}
              onClick={() => {
                if (editingId !== item.id) {
                  setSelectedIndex(index);
                }
              }}
            >
              <span className="place-rank">{index + 1}.</span>
              {editingId === item.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => saveEdit(item.id)}
                  onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                  className="edit-input"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="place-name">{item.name}</span>
              )}
              {showEditOptions && (
                <div className="row-actions">
                  <button 
                    className="arrow-button"
                    onClick={(e) => moveItemUp(index, e)}
                    disabled={index === 0 || editingId === item.id}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button 
                    className="arrow-button"
                    onClick={(e) => moveItemDown(index, e)}
                    disabled={index === items.length - 1 || editingId === item.id}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button 
                    className="edit-link"
                    onClick={(e) => startEdit(item, e)}
                    disabled={editingId === item.id}
                  >
                    edit
                  </button>
                  <button 
                    className="delete-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    disabled={editingId === item.id}
                  >
                    delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No items yet. Add one above.</p>
      )}

      {items.length > 0 && showEditOptions && (
        <p className="help-text">
          Click an item to select it, then use ↑/↓ to navigate or Shift + ↑/↓ to reorder
        </p>
      )}
    </div>
  );
};

export default TierList;

