'use client';

import { useState } from 'react';

const STATUS_LABELS = {
  inventario: 'En Inventario',
  prestado: 'Prestado',
  vendido: 'Vendido',
};

function StatusBadge({ status }) {
  return (
    <span className={`badge-${status} px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatCurrency(value) {
  if (!value && value !== 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function InventoryTable({ pieces, loading, onPieceClick }) {
  const [sortColumn, setSortColumn] = useState('code');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDir('asc');
    }
  };

  const sorted = [...pieces].sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];

    if (sortColumn === 'estimated_value_usd') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }

    aVal = String(aVal || '').toLowerCase();
    bVal = String(bVal || '').toLowerCase();
    const cmp = aVal.localeCompare(bVal, 'es');
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return <span className="text-ah-gray dark:text-[#3a4e6a] ml-1">↕</span>;
    }
    return <span className="text-ah-blue dark:text-[#7db0ff] ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ah-blue/30 border-t-ah-blue rounded-full animate-spin" />
          <p className="text-xl text-ah-charcoal/60 dark:text-[#a0b4d0]">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (pieces.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <p className="text-2xl font-semibold text-ah-navy dark:text-[#edf3ff] mb-2">No hay piezas registradas</p>
          <p className="text-lg text-ah-charcoal/50 dark:text-[#a0b4d0]">
            Presione &quot;Agregar Pieza&quot; para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ah-gray/50 dark:border-[#2a3650] shadow-sm transition-colors duration-300">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-ah-navy dark:bg-[#0f1a2e] text-white">
            <th className="px-4 py-4 text-base font-semibold rounded-tl-2xl whitespace-nowrap">
              <button onClick={() => handleSort('code')} className="flex items-center hover:text-ah-gray transition-colors">
                Foto
              </button>
            </th>
            <th className="px-4 py-4 text-base font-semibold whitespace-nowrap">
              <button onClick={() => handleSort('code')} className="flex items-center hover:text-ah-gray transition-colors">
                Código <SortIcon column="code" />
              </button>
            </th>
            <th className="px-4 py-4 text-base font-semibold whitespace-nowrap">
              <button onClick={() => handleSort('name')} className="flex items-center hover:text-ah-gray transition-colors">
                Nombre <SortIcon column="name" />
              </button>
            </th>
            <th className="px-4 py-4 text-base font-semibold whitespace-nowrap hidden sm:table-cell">
              <button onClick={() => handleSort('type')} className="flex items-center hover:text-ah-gray transition-colors">
                Tipo <SortIcon column="type" />
              </button>
            </th>
            <th className="px-4 py-4 text-base font-semibold whitespace-nowrap hidden md:table-cell">
              <button onClick={() => handleSort('estimated_value_usd')} className="flex items-center hover:text-ah-gray transition-colors">
                Valor USD <SortIcon column="estimated_value_usd" />
              </button>
            </th>
            <th className="px-4 py-4 text-base font-semibold rounded-tr-2xl whitespace-nowrap">
              <button onClick={() => handleSort('status')} className="flex items-center hover:text-ah-gray transition-colors">
                Estado <SortIcon column="status" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((piece, idx) => (
            <tr
              key={piece.id}
              onClick={() => onPieceClick(piece)}
              className={`table-row-hover cursor-pointer border-b border-ah-gray/30 dark:border-[#2a3650]/60 ${
                idx % 2 === 0
                  ? 'bg-white dark:bg-[#1a2236]'
                  : 'bg-gray-50/50 dark:bg-[#162030]'
              }`}
            >
              <td className="px-4 py-3">
                {piece.photo_url ? (
                  <img
                    src={piece.photo_url}
                    alt={piece.name}
                    className="w-14 h-14 object-cover rounded-lg border border-ah-gray/50 dark:border-[#2a3650]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-[#0f1a2e] border border-ah-gray/50 dark:border-[#2a3650] flex items-center justify-center text-2xl">
                    🖼️
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-lg font-semibold text-ah-navy dark:text-[#edf3ff]">{piece.code}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-lg text-ah-charcoal dark:text-[#d0daf0]">{piece.name}</span>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-base text-ah-charcoal/70 dark:text-[#a0b4d0]">{piece.type}</span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className="text-lg font-medium text-ah-navy dark:text-[#edf3ff]">
                  {formatCurrency(piece.estimated_value_usd)}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={piece.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
