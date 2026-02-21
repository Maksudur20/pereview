import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPerfumes, getBrands, getAllNotes } from '../../services/perfumeService';
import PerfumeCard from './PerfumeCard';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import './Perfumes.css';

const PerfumeList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [brands, setBrands] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    country: searchParams.get('country') || '',
    notes: searchParams.get('notes') || '',
    sort: searchParams.get('sort') || '-createdAt',
  });

  const [selectedNotes, setSelectedNotes] = useState(
    filters.notes ? filters.notes.split(',') : []
  );

  const fetchPerfumes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });
      if (selectedNotes.length > 0) {
        params.notes = selectedNotes.join(',');
      }

      const { data } = await getPerfumes(params);
      setPerfumes(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load perfumes');
    } finally {
      setLoading(false);
    }
  }, [filters, selectedNotes]);

  useEffect(() => {
    fetchPerfumes(parseInt(searchParams.get('page') || '1'));
  }, [fetchPerfumes, searchParams]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [brandsRes, notesRes] = await Promise.all([getBrands(), getAllNotes()]);
        setBrands(brandsRes.data.data);
        setAllNotes(notesRes.data.data);
      } catch {
        // Non-critical, fail silently
      }
    };
    loadMeta();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleNote = (note) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const applyFilters = () => {
    const params = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params[key] = val;
    });
    if (selectedNotes.length > 0) params.notes = selectedNotes.join(',');
    params.page = '1';
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '', brand: '', category: '', minPrice: '',
      maxPrice: '', minRating: '', country: '', notes: '', sort: '-createdAt',
    });
    setSelectedNotes([]);
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    const params = Object.fromEntries(searchParams);
    params.page = String(page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="perfume-list-page container">
      <div className="perfume-list-header">
        <div>
          <h1>Discover Perfumes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {pagination.total} perfumes found
          </p>
        </div>
        <div className="perfume-list-controls">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <select
            className="sort-select"
            value={filters.sort}
            onChange={(e) => {
              handleFilterChange('sort', e.target.value);
              const params = Object.fromEntries(searchParams);
              params.sort = e.target.value;
              params.page = '1';
              setSearchParams(params);
            }}
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="-averageRating">Highest Rated</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-totalReviews">Most Reviewed</option>
          </select>
        </div>
      </div>

      <div className={`perfume-layout ${!showFilters ? 'no-sidebar' : ''}`}>
        {showFilters && (
          <aside className="filters-sidebar">
            <h3>Filters</h3>

            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Brand</label>
              <select value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)}>
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                <option value="">All</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Min Rating</label>
              <select value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)}>
                <option value="">Any</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Fragrance Notes</label>
              <div className="notes-filter">
                {allNotes.slice(0, 30).map((note) => (
                  <button
                    key={note}
                    className={`note-filter-tag ${selectedNotes.includes(note) ? 'active' : ''}`}
                    onClick={() => toggleNote(note)}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply</button>
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
            </div>
          </aside>
        )}

        <div>
          {loading ? (
            <LoadingSpinner />
          ) : perfumes.length === 0 ? (
            <div className="empty-state">
              <h3>No perfumes found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="perfume-grid">
                {perfumes.map((perfume) => (
                  <PerfumeCard key={perfume._id} perfume={perfume} />
                ))}
              </div>
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfumeList;
