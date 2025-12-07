import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './writing/Writing.scss';
import './TierList.scss';
import { SHOW_TIER_LIST } from '../constants/siteFlags';

const TierListSection = ({
  title,
  placeholder,
  fetchPath,
  storageKey,
  saveEndpoint,
  exportFileName,
  showEditOptions,
  isActive,
  onActivate,
}) => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef(null);

  // Load data for this list
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(fetchPath);
        if (response.ok) {
          const data = await response.json();
          setItems(data);
          return;
        }
      } catch (error) {
        console.error(`Error loading ${title}:`, error);
      }

      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    };

    loadData();
  }, [fetchPath, storageKey, title]);

  // Save to localStorage whenever items change (as backup)
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [items, storageKey]);

  // Handle keyboard shortcuts (only in dev view on localhost and when section is active)
  useEffect(() => {
    if (!showEditOptions || !isActive) return;

    const handleKeyDown = (e) => {
      if (items.length === 0) return;
      if (editingId !== null) return;

      if (e.key === 'ArrowUp' && !e.shiftKey) {
        e.preventDefault();
        if (selectedIndex === null) {
          setSelectedIndex(items.length - 1);
        } else if (selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1);
        }
      } else if (e.key === 'ArrowDown' && !e.shiftKey) {
        e.preventDefault();
        if (selectedIndex === null) {
          setSelectedIndex(0);
        } else if (selectedIndex < items.length - 1) {
          setSelectedIndex(selectedIndex + 1);
        }
      } else if (e.shiftKey && e.key === 'ArrowUp') {
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
  }, [showEditOptions, isActive, selectedIndex, items, editingId]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newItemName.trim(),
      category: 'Uncategorized',
      dateAdded: new Date().toISOString(),
    };

    setItems((prev) => {
      const updated = [...prev, newItem];
      setSelectedIndex(updated.length - 1);
      return updated;
    });
    setNewItemName('');
    onActivate();
  };

  const deleteItem = (id) => {
    if (window.confirm('Delete this item?')) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedIndex(null);
    }
  };

  const startEdit = (item, e) => {
    e.stopPropagation();
    onActivate();
    setEditingId(item.id);
    setEditName(item.name);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  };

  const saveEdit = (id) => {
    if (!editName.trim()) {
      cancelEdit();
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: editName.trim() } : item
      )
    );
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
      onActivate();
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
      onActivate();
    }
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveToPublished = async () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));

      const response = await fetch(saveEndpoint, {
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
    <section
      className={`tier-list-section ${isActive ? 'active' : ''}`}
      onMouseDown={onActivate}
    >
      <div className="tier-list-subheader">
        <h2>{title}</h2>
        {showEditOptions && (
          <div className="action-buttons">
            <button onClick={saveToPublished} className="save-link">
              save
            </button>
            <button onClick={exportToJSON} className="export-link">
              export json
            </button>
          </div>
        )}
      </div>

      {showEditOptions && (
        <form onSubmit={handleAddItem} className="add-place-form">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onFocus={onActivate}
            placeholder={placeholder || 'Item name'}
            required
          />
          <button type="submit">Add</button>
        </form>
      )}

      {items.length > 0 ? (
        <ul className="places-list">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={selectedIndex === index ? 'selected' : ''}
              onClick={() => {
                onActivate();
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

      {items.length > 0 && showEditOptions && isActive && (
        <p className="help-text">
          Click an item to select it, then use ↑/↓ to navigate or Shift + ↑/↓ to reorder
        </p>
      )}
    </section>
  );
};

const TierList = () => {
  const location = useLocation();
  const isHomeActive = location.pathname === '/';
  const isDraftsActive = location.pathname.startsWith('/drafts');

  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const [isDevView, setIsDevView] = useState(true);
  const showEditOptions = isLocalhost && isDevView;
  const [activeList, setActiveList] = useState('main');

  const sectionConfigs = [
    {
      key: 'main',
      title: 'Films & Shows',
      placeholder: 'Add film/show',
      fetchPath: '/tier_list_published.json',
      storageKey: 'tier_list_published',
      saveEndpoint: '/api/save-published',
      exportFileName: 'tier_list_published.json',
    },
    {
      key: 'videoEssays',
      title: 'Video Essays',
      placeholder: 'Add video essay',
      fetchPath: '/video_essays_published.json',
      storageKey: 'video_essays_published',
      saveEndpoint: '/api/save-video-essays',
      exportFileName: 'video_essays_published.json',
    },
  ];

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
        {SHOW_TIER_LIST && (
          <Link
            to="/tier-list"
            className={`header-option ${location.pathname === '/tier-list' ? 'active' : ''}`}
          >
            Tier List
          </Link>
        )}
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

      <div className="tier-list-sections">
        {sectionConfigs.map((config) => (
          <TierListSection
            key={config.key}
            {...config}
            showEditOptions={showEditOptions}
            isActive={activeList === config.key}
            onActivate={() => setActiveList(config.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default TierList;
