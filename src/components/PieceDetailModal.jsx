'use client';

const STATUS_LABELS = {
  inventario: 'En Inventario',
  prestado: 'Prestado',
  vendido: 'Vendido',
};

const CONDITION_LABELS = {
  'Excelente': '🟢',
  'Buena': '🟡',
  'Regular': '🟠',
  'Deteriorada': '🔴',
  'En restauración': '🔧',
};

function formatCurrency(value) {
  if (!value && value !== 0) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function InfoRow({ label, value, large = false }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-ah-charcoal/50 dark:text-[#7a8eaa] uppercase tracking-wide">{label}</span>
      <span className={`${large ? 'text-2xl font-bold text-ah-navy dark:text-[#edf3ff]' : 'text-lg text-ah-charcoal dark:text-[#d0daf0]'}`}>
        {value}
      </span>
    </div>
  );
}

export default function PieceDetailModal({ piece, onEdit, onDelete, onClose, deleting }) {
  if (!piece) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center modal-backdrop">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl mx-4 my-4 sm:my-8 bg-white dark:bg-[#121e32] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto modal-content transition-colors duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#121e32] border-b border-ah-gray/50 dark:border-[#2a3650] rounded-t-3xl px-6 sm:px-8 py-5 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            <span className={`badge-${piece.status} px-4 py-2 rounded-full text-base font-semibold`}>
              {STATUS_LABELS[piece.status] || piece.status}
            </span>
            <span className="text-xl font-bold text-ah-navy dark:text-[#edf3ff]">{piece.code}</span>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#1a2236] hover:bg-gray-200 dark:hover:bg-[#243048] flex items-center justify-center text-2xl text-ah-charcoal dark:text-[#a0b4d0] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 sm:px-8 py-6 space-y-6">
          {/* Photo + Title */}
          <div className="flex flex-col sm:flex-row gap-6">
            {piece.photo_url ? (
              <img
                src={piece.photo_url}
                alt={piece.name}
                className="w-full sm:w-72 h-56 object-cover rounded-2xl border border-ah-gray dark:border-[#2a3650] shadow-md"
              />
            ) : (
              <div className="w-full sm:w-72 h-56 rounded-2xl bg-gray-50 dark:bg-[#0f1a2e] border border-ah-gray dark:border-[#2a3650] flex items-center justify-center text-6xl">
                🖼️
              </div>
            )}

            <div className="flex-1 flex flex-col justify-center gap-2">
              <h2 className="text-3xl font-bold text-ah-navy dark:text-[#edf3ff] leading-tight">{piece.name}</h2>
              <p className="text-xl text-ah-blue dark:text-[#7db0ff] font-semibold">{piece.type}</p>
              {piece.estimated_value_usd && (
                <p className="text-2xl font-bold text-ah-navy dark:text-[#edf3ff] mt-2">
                  {formatCurrency(piece.estimated_value_usd)}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {piece.description && (
            <div className="bg-gray-50 dark:bg-[#1a2236] rounded-xl p-5 border border-ah-gray/50 dark:border-[#2a3650]">
              <p className="text-lg text-ah-charcoal dark:text-[#d0daf0] leading-relaxed">{piece.description}</p>
            </div>
          )}

          {/* Contexto Histórico */}
          {(piece.year_period || piece.origin_place || piece.civilization || piece.artist) && (
            <section>
              <h3 className="text-lg font-bold text-ah-navy dark:text-[#edf3ff] mb-3 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                🏛️ Contexto Histórico
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Año / Período" value={piece.year_period} />
                <InfoRow label="Lugar de Origen" value={piece.origin_place} />
                <InfoRow label="Civilización / Cultura" value={piece.civilization} />
                <InfoRow label="Artista / Creador" value={piece.artist} />
              </div>
            </section>
          )}

          {/* Descripción Física */}
          {(piece.technique || piece.material || piece.dimensions || piece.weight || piece.condition) && (
            <section>
              <h3 className="text-lg font-bold text-ah-navy dark:text-[#edf3ff] mb-3 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                📐 Descripción Física
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Técnica" value={piece.technique} />
                <InfoRow label="Material" value={piece.material} />
                <InfoRow label="Dimensiones" value={piece.dimensions} />
                <InfoRow label="Peso" value={piece.weight} />
                {piece.condition && (
                  <InfoRow
                    label="Estado de Conservación"
                    value={`${CONDITION_LABELS[piece.condition] || ''} ${piece.condition}`}
                  />
                )}
              </div>
            </section>
          )}

          {/* Estado: Prestado */}
          {piece.status === 'prestado' && (piece.loaned_to || piece.loan_date) && (
            <section className="bg-yellow-50 dark:bg-yellow-900/15 rounded-xl p-5 border border-yellow-200 dark:border-yellow-800/30">
              <h3 className="text-lg font-bold text-ah-navy dark:text-[#edf3ff] mb-3">📤 Información de Préstamo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoRow label="Prestado a" value={piece.loaned_to} />
                <InfoRow label="Fecha de Préstamo" value={formatDate(piece.loan_date)} />
                <InfoRow label="Devolución Esperada" value={formatDate(piece.loan_return_date)} />
              </div>
            </section>
          )}

          {/* Estado: Vendido */}
          {piece.status === 'vendido' && (piece.sold_to || piece.sale_date) && (
            <section className="bg-red-50 dark:bg-red-900/15 rounded-xl p-5 border border-red-200 dark:border-red-800/30">
              <h3 className="text-lg font-bold text-ah-navy dark:text-[#edf3ff] mb-3">💸 Información de Venta</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoRow label="Vendido a" value={piece.sold_to} />
                <InfoRow label="Fecha de Venta" value={formatDate(piece.sale_date)} />
                <InfoRow label="Precio de Venta" value={formatCurrency(piece.sale_price)} large />
              </div>
            </section>
          )}

          {/* Adquisición */}
          {(piece.acquisition_date || piece.acquisition_source || piece.location_in_warehouse) && (
            <section>
              <h3 className="text-lg font-bold text-ah-navy dark:text-[#edf3ff] mb-3 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                📦 Adquisición y Ubicación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Fecha de Adquisición" value={formatDate(piece.acquisition_date)} />
                <InfoRow label="Fuente / Procedencia" value={piece.acquisition_source} />
                <InfoRow label="Ubicación en la Bodega" value={piece.location_in_warehouse} />
              </div>
            </section>
          )}

          {/* Notas */}
          {piece.notes && (
            <section>
              <h3 className="text-lg font-bold text-ah-navy dark:text-[#edf3ff] mb-3 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                📝 Notas
              </h3>
              <p className="text-lg text-ah-charcoal dark:text-[#d0daf0] leading-relaxed whitespace-pre-wrap">{piece.notes}</p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-[#121e32] border-t border-ah-gray/50 dark:border-[#2a3650] rounded-b-3xl px-6 sm:px-8 py-5 flex gap-4 justify-between transition-colors duration-300">
          <button
            onClick={() => onDelete(piece)}
            disabled={deleting}
            className="px-6 py-4 text-lg font-semibold rounded-full border-2 border-red-300 dark:border-red-700/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-ah-gray dark:border-[#3a4e6a] text-ah-charcoal dark:text-[#a0b4d0] hover:bg-gray-50 dark:hover:bg-[#1a2236] transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => onEdit(piece)}
              className="btn-primary px-10 py-4 text-lg font-semibold rounded-full text-white"
            >
              Editar Pieza
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
