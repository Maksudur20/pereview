import React, { useState, useEffect, useCallback } from 'react';
import { getAllPerfumes, createPerfume, updatePerfume as updatePerfumeApi, deletePerfume } from '../../services/perfumeService';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi';
import './Admin.css';

const AdminDashboard = () => {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = {
    name: '', brand: '', designer: '', country: '', category: 'Unisex',
    releaseYear: '', price: '', description: '',
    topNotes: '', middleNotes: '', baseNotes: '',
    buyLink: '', image: null,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchPerfumes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await getAllPerfumes({ page, limit: 15 });
      setPerfumes(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load perfumes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPerfumes(); }, [fetchPerfumes]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (perfume) => {
    setEditing(perfume);
    setForm({
      name: perfume.name || '',
      brand: perfume.brand || '',
      designer: perfume.designer || '',
      country: perfume.country || '',
      category: perfume.category || 'Unisex',
      releaseYear: perfume.releaseYear || '',
      price: perfume.price || '',
      description: perfume.description || '',
      topNotes: perfume.notes?.top?.join(', ') || '',
      middleNotes: perfume.notes?.middle?.join(', ') || '',
      baseNotes: perfume.notes?.base?.join(', ') || '',
      buyLink: perfume.buyLink || '',
      image: null,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.brand) {
      toast.error('Name and brand are required');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('brand', form.brand);
    formData.append('designer', form.designer);
    formData.append('country', form.country);
    formData.append('category', form.category);
    if (form.releaseYear) formData.append('releaseYear', form.releaseYear);
    if (form.price) formData.append('price', form.price);
    formData.append('description', form.description);
    if (form.buyLink) formData.append('buyLink', form.buyLink);

    const toArray = (str) => str.split(',').map((s) => s.trim()).filter(Boolean);
    formData.append('notes', JSON.stringify({
      top: toArray(form.topNotes),
      middle: toArray(form.middleNotes),
      base: toArray(form.baseNotes),
    }));

    if (form.image) formData.append('image', form.image);

    try {
      if (editing) {
        await updatePerfumeApi(editing._id, formData);
        toast.success('Perfume updated!');
      } else {
        await createPerfume(formData);
        toast.success('Perfume created!');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      fetchPerfumes(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this perfume permanently?')) return;
    try {
      await deletePerfume(id);
      toast.success('Deleted');
      fetchPerfumes(pagination.page);
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Add Perfume
        </button>
      </div>

      {/* Perfume Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editing ? 'Edit Perfume' : 'Add New Perfume'}</h2>
              <button onClick={() => setShowForm(false)}><FiX size={20} /></button>
            </div>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <input className="form-control" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Designer</label>
                  <input className="form-control" value={form.designer} onChange={(e) => setForm({ ...form, designer: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input className="form-control" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option>Men</option>
                    <option>Women</option>
                    <option>Unisex</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Release Year</label>
                  <input className="form-control" type="number" value={form.releaseYear} onChange={(e) => setForm({ ...form, releaseYear: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input className="form-control" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Buy Link</label>
                  <input className="form-control" value={form.buyLink} onChange={(e) => setForm({ ...form, buyLink: e.target.value })} placeholder="https://..." />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Top Notes (comma-separated)</label>
                  <input className="form-control" value={form.topNotes} onChange={(e) => setForm({ ...form, topNotes: e.target.value })} placeholder="Bergamot, Lemon" />
                </div>
                <div className="form-group">
                  <label>Middle Notes</label>
                  <input className="form-control" value={form.middleNotes} onChange={(e) => setForm({ ...form, middleNotes: e.target.value })} placeholder="Rose, Jasmine" />
                </div>
                <div className="form-group">
                  <label>Base Notes</label>
                  <input className="form-control" value={form.baseNotes} onChange={(e) => setForm({ ...form, baseNotes: e.target.value })} placeholder="Musk, Vanilla" />
                </div>
              </div>

              <div className="form-group">
                <label>Image</label>
                <div className="file-upload">
                  <label className="file-upload-label">
                    <FiUpload /> {form.image ? form.image.name : 'Choose image...'}
                    <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} hidden />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Perfumes Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Reviews</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {perfumes.map((p) => (
                  <tr key={p._id}>
                    <td><img src={p.imageUrl || '/placeholder-perfume.png'} alt="" className="admin-thumb" /></td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.brand}</td>
                    <td><span className={`badge badge-${p.category?.toLowerCase()}`}>{p.category}</span></td>
                    <td>${p.price || '—'}</td>
                    <td>{(p.averageRating || 0).toFixed(1)}</td>
                    <td>{p.totalReviews || 0}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><FiEdit2 /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchPerfumes} />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
