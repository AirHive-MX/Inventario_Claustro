'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import InventoryTable from '@/components/InventoryTable';
import PieceModal from '@/components/PieceModal';
import PieceDetailModal from '@/components/PieceDetailModal';
import Popup from '@/components/Popup';

export default function Home() {
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Popup states
  const [popup, setPopup] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showPopup = (message, type = 'success') => {
    setPopup({ message, type });
  };

  // Fetch all pieces
  const fetchPieces = useCallback(async () => {
    const { data, error } = await supabase
      .from('art_pieces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showPopup('Error al cargar el inventario', 'error');
      console.error(error);
    } else {
      setPieces(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  // Upload photo to Supabase Storage
  const uploadPhoto = async (blob, code) => {
    const fileName = `${code.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('art-photos')
      .upload(fileName, blob, { contentType: 'image/jpeg' });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('art-photos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  // Add or update piece
  const handleSave = async (formData, photoBlob) => {
    setSaving(true);

    try {
      let photoUrl = selectedPiece?.photo_url || null;

      if (photoBlob) {
        const url = await uploadPhoto(photoBlob, formData.code);
        if (url) photoUrl = url;
      }

      const pieceData = {
        ...formData,
        photo_url: photoUrl,
      };

      if (selectedPiece) {
        const { error } = await supabase
          .from('art_pieces')
          .update(pieceData)
          .eq('id', selectedPiece.id);

        if (error) throw error;
        showPopup('Pieza actualizada correctamente', 'success');
      } else {
        const { error } = await supabase
          .from('art_pieces')
          .insert([pieceData]);

        if (error) throw error;
        showPopup('Pieza agregada correctamente', 'success');
      }

      setShowForm(false);
      setSelectedPiece(null);
      await fetchPieces();
    } catch (error) {
      console.error('Save error:', error);
      if (error.code === '23505') {
        showPopup('Ya existe una pieza con ese código', 'error');
      } else {
        showPopup('Error al guardar la pieza', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Request delete confirmation via popup
  const handleDelete = (piece) => {
    setConfirmDelete(piece);
  };

  // Actually delete after confirmation
  const executeDelete = async () => {
    const piece = confirmDelete;
    setConfirmDelete(null);
    setDeleting(true);

    try {
      if (piece.photo_url) {
        const path = piece.photo_url.split('/art-photos/')[1];
        if (path) {
          await supabase.storage.from('art-photos').remove([path]);
        }
      }

      const { error } = await supabase
        .from('art_pieces')
        .delete()
        .eq('id', piece.id);

      if (error) throw error;

      showPopup('Pieza eliminada correctamente', 'success');
      setShowDetail(false);
      setSelectedPiece(null);
      await fetchPieces();
    } catch (error) {
      console.error('Delete error:', error);
      showPopup('Error al eliminar la pieza', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handlePieceClick = (piece) => {
    setSelectedPiece(piece);
    setShowDetail(true);
  };

  const handleEditFromDetail = (piece) => {
    setShowDetail(false);
    setSelectedPiece(piece);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedPiece(null);
    setShowForm(true);
  };

  const filteredPieces = pieces.filter((p) => {
    const matchesSearch =
      !search ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.type && p.type.toLowerCase().includes(search.toLowerCase())) ||
      (p.artist && p.artist.toLowerCase().includes(search.toLowerCase())) ||
      (p.civilization && p.civilization.toLowerCase().includes(search.toLowerCase()));

    const matchesType = !filterType || p.type === filterType;
    const matchesStatus = !filterStatus || p.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const uniqueTypes = [...new Set(pieces.map((p) => p.type).filter(Boolean))].sort();

  const countByStatus = {
    total: pieces.length,
    inventario: pieces.filter((p) => p.status === 'inventario').length,
    prestado: pieces.filter((p) => p.status === 'prestado').length,
    vendido: pieces.filter((p) => p.status === 'vendido').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/80 dark:from-[#0d1424] dark:to-[#0b1020] transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <div className="bg-white dark:bg-[#1a2236] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-ah-gray/50 dark:border-[#2a3650] shadow-sm transition-colors duration-300">
            <p className="text-xs sm:text-sm font-medium text-ah-charcoal/50 dark:text-[#a0b4d0] uppercase tracking-wide">Total</p>
            <p className="text-2xl sm:text-4xl font-bold text-ah-navy dark:text-[#edf3ff] mt-1">{countByStatus.total}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2236] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-green-100 dark:border-green-900/40 shadow-sm transition-colors duration-300">
            <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">En Inventario</p>
            <p className="text-2xl sm:text-4xl font-bold text-green-700 dark:text-green-300 mt-1">{countByStatus.inventario}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2236] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-yellow-100 dark:border-yellow-900/40 shadow-sm transition-colors duration-300">
            <p className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Prestados</p>
            <p className="text-2xl sm:text-4xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{countByStatus.prestado}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2236] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-red-100 dark:border-red-900/40 shadow-sm transition-colors duration-300">
            <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">Vendidos</p>
            <p className="text-2xl sm:text-4xl font-bold text-red-700 dark:text-red-300 mt-1">{countByStatus.vendido}</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={handleAddNew}
            className="btn-primary w-full sm:w-auto px-8 py-4 text-xl font-semibold rounded-full text-white flex items-center justify-center gap-3"
          >
            <span className="text-2xl">+</span>
            Agregar Pieza
          </button>

          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-ah-charcoal/40 dark:text-[#a0b4d0]/60">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, nombre..."
                className="w-full h-14 pl-12 pr-4 text-lg rounded-full border-2 border-ah-gray dark:border-[#2a3650] bg-white dark:bg-[#1a2236] text-ah-charcoal dark:text-[#edf3ff] placeholder-gray-400 dark:placeholder-[#5a6e8a] transition-colors duration-300"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-ah-charcoal/40 dark:text-[#a0b4d0] hover:text-ah-charcoal dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-14 px-4 text-base rounded-full border-2 border-ah-gray dark:border-[#2a3650] bg-white dark:bg-[#1a2236] text-ah-charcoal dark:text-[#edf3ff] flex-1 sm:flex-none sm:min-w-[160px] transition-colors duration-300"
              >
                <option value="">Todos los tipos</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-14 px-4 text-base rounded-full border-2 border-ah-gray dark:border-[#2a3650] bg-white dark:bg-[#1a2236] text-ah-charcoal dark:text-[#edf3ff] flex-1 sm:flex-none sm:min-w-[160px] transition-colors duration-300"
              >
                <option value="">Todos los estados</option>
                <option value="inventario">En Inventario</option>
                <option value="prestado">Prestado</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>
          </div>
        </div>

        {search || filterType || filterStatus ? (
          <p className="text-base text-ah-charcoal/50 dark:text-[#a0b4d0] mb-4">
            Mostrando {filteredPieces.length} de {pieces.length} piezas
            {search && <span> — búsqueda: &quot;{search}&quot;</span>}
          </p>
        ) : null}

        <InventoryTable
          pieces={filteredPieces}
          loading={loading}
          onPieceClick={handlePieceClick}
        />
      </main>

      {showForm && (
        <PieceModal
          piece={selectedPiece}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setSelectedPiece(null);
          }}
          saving={saving}
        />
      )}

      {showDetail && selectedPiece && (
        <PieceDetailModal
          piece={selectedPiece}
          onEdit={handleEditFromDetail}
          onDelete={handleDelete}
          onClose={() => {
            setShowDetail(false);
            setSelectedPiece(null);
          }}
          deleting={deleting}
        />
      )}

      {/* Delete confirmation popup */}
      {confirmDelete && (
        <Popup
          type="confirm"
          title="Eliminar pieza"
          message={`¿Está seguro de que desea eliminar "${confirmDelete.name}" (${confirmDelete.code})? Esta acción no se puede deshacer.`}
          onConfirm={executeDelete}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {/* Notification popup */}
      {popup && (
        <Popup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
