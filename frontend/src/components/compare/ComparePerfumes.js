import React, { useState, useEffect } from 'react';
import { searchPerfumes, comparePerfumes } from '../../services/perfumeService';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiSearch, FiX, FiPlus } from 'react-icons/fi';
import './Compare.css';

const ComparePerfumes = () => {
  const [selected, setSelected] = useState([null, null]);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await searchPerfumes({ search: query, limit: 6 });
      setSearchResults(data.data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectPerfume = (perfume) => {
    const newSelected = [...selected];
    newSelected[activeSlot] = perfume;
    setSelected(newSelected);
    setActiveSlot(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearSlot = (index) => {
    const newSelected = [...selected];
    newSelected[index] = null;
    setSelected(newSelected);
    setCompareData(null);
  };

  useEffect(() => {
    if (selected[0] && selected[1]) {
      const fetchComparison = async () => {
        setLoading(true);
        try {
          const { data } = await comparePerfumes(selected[0]._id, selected[1]._id);
          setCompareData(data.data);
        } catch {
          toast.error('Failed to compare');
        } finally {
          setLoading(false);
        }
      };
      fetchComparison();
    }
  }, [selected]);

  const renderBar = (val, max = 5) => (
    <div className="compare-bar">
      <div className="compare-bar-fill" style={{ width: `${(val / max) * 100}%` }} />
    </div>
  );

  return (
    <div className="compare-page container">
      <h1>Compare Fragrances</h1>
      <p className="compare-subtitle">Select two perfumes to compare side by side</p>

      <div className="compare-selectors">
        {[0, 1].map((idx) => (
          <div key={idx} className={`compare-slot ${selected[idx] ? 'filled' : ''}`}>
            {selected[idx] ? (
              <div className="compare-slot-content">
                <img src={selected[idx].imageUrl || '/placeholder-perfume.png'} alt={selected[idx].name} />
                <h3>{selected[idx].name}</h3>
                <p>{selected[idx].brand}</p>
                <button className="btn-remove" onClick={() => clearSlot(idx)}><FiX /></button>
              </div>
            ) : (
              <button className="compare-slot-add" onClick={() => setActiveSlot(idx)}>
                <FiPlus size={32} />
                <span>Select Perfume</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Search Dropdown */}
      {activeSlot !== null && (
        <div className="compare-search-overlay">
          <div className="compare-search-modal">
            <div className="compare-search-header">
              <h3>Select Perfume #{activeSlot + 1}</h3>
              <button onClick={() => setActiveSlot(null)}><FiX /></button>
            </div>
            <div className="compare-search-input">
              <FiSearch />
              <input
                autoFocus
                placeholder="Search by name or brand..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="compare-search-results">
              {searching ? <LoadingSpinner text="Searching..." /> : searchResults.map((p) => (
                <div key={p._id} className="compare-search-item" onClick={() => selectPerfume(p)}>
                  <img src={p.imageUrl || '/placeholder-perfume.png'} alt={p.name} />
                  <div>
                    <strong>{p.name}</strong>
                    <span>{p.brand}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {loading && <LoadingSpinner text="Comparing..." />}
      {compareData && !loading && (
        <div className="compare-table">
          <div className="compare-row compare-row-header">
            <div className="compare-label">Feature</div>
            <div className="compare-val">{compareData[0]?.name}</div>
            <div className="compare-val">{compareData[1]?.name}</div>
          </div>
          {[
            ['Brand', 'brand'],
            ['Category', 'category'],
            ['Country', 'country'],
            ['Release Year', 'releaseYear'],
          ].map(([label, key]) => (
            <div className="compare-row" key={key}>
              <div className="compare-label">{label}</div>
              <div className="compare-val">{compareData[0]?.[key] || '—'}</div>
              <div className="compare-val">{compareData[1]?.[key] || '—'}</div>
            </div>
          ))}
          <div className="compare-row">
            <div className="compare-label">Price</div>
            <div className="compare-val">${compareData[0]?.price || '—'}</div>
            <div className="compare-val">${compareData[1]?.price || '—'}</div>
          </div>
          <div className="compare-row">
            <div className="compare-label">Rating</div>
            <div className="compare-val"><StarRating rating={compareData[0]?.averageRating || 0} size={14} showValue /></div>
            <div className="compare-val"><StarRating rating={compareData[1]?.averageRating || 0} size={14} showValue /></div>
          </div>
          {['Longevity', 'Projection', 'Sillage'].map((attr) => (
            <div className="compare-row" key={attr}>
              <div className="compare-label">{attr}</div>
              <div className="compare-val">{renderBar(compareData[0]?.[`average${attr}`] || 0)} <span className="bar-val">{(compareData[0]?.[`average${attr}`] || 0).toFixed(1)}</span></div>
              <div className="compare-val">{renderBar(compareData[1]?.[`average${attr}`] || 0)} <span className="bar-val">{(compareData[1]?.[`average${attr}`] || 0).toFixed(1)}</span></div>
            </div>
          ))}
          <div className="compare-row">
            <div className="compare-label">Top Notes</div>
            <div className="compare-val notes-tags">{(compareData[0]?.notes?.top || []).map((n) => <span key={n} className="note-tag">{n}</span>)}</div>
            <div className="compare-val notes-tags">{(compareData[1]?.notes?.top || []).map((n) => <span key={n} className="note-tag">{n}</span>)}</div>
          </div>
          <div className="compare-row">
            <div className="compare-label">Middle Notes</div>
            <div className="compare-val notes-tags">{(compareData[0]?.notes?.middle || []).map((n) => <span key={n} className="note-tag">{n}</span>)}</div>
            <div className="compare-val notes-tags">{(compareData[1]?.notes?.middle || []).map((n) => <span key={n} className="note-tag">{n}</span>)}</div>
          </div>
          <div className="compare-row">
            <div className="compare-label">Base Notes</div>
            <div className="compare-val notes-tags">{(compareData[0]?.notes?.base || []).map((n) => <span key={n} className="note-tag">{n}</span>)}</div>
            <div className="compare-val notes-tags">{(compareData[1]?.notes?.base || []).map((n) => <span key={n} className="note-tag">{n}</span>)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePerfumes;
