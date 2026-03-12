'use client';

import { useState, useEffect, useRef } from 'react';
import ImageCropper from './ImageCropper';

const PIECE_TYPES = [
  'Pintura',
  'Escultura',
  'Libro',
  'Cuadro',
  'Fósil',
  'Cerámica',
  'Textil',
  'Manuscrito',
  'Joyería',
  'Arma',
  'Moneda',
  'Mueble',
  'Instrumento Musical',
  'Mapa',
  'Grabado',
  'Fotografía',
  'Relieve',
  'Máscara',
  'Documento',
  'Tapiz',
  'Vitral',
  'Otro',
];

const CONDITIONS = [
  'Excelente',
  'Buena',
  'Regular',
  'Deteriorada',
  'En restauración',
];

const EMPTY_FORM = {
  code: '',
  name: '',
  type: '',
  description: '',
  year_period: '',
  origin_place: '',
  civilization: '',
  artist: '',
  technique: '',
  material: '',
  dimensions: '',
  weight: '',
  condition: '',
  estimated_value_usd: '',
  status: 'inventario',
  loaned_to: '',
  loan_date: '',
  loan_return_date: '',
  sold_to: '',
  sale_date: '',
  sale_price: '',
  acquisition_date: '',
  acquisition_source: '',
  location_in_warehouse: '',
  notes: '',
};

// Defined OUTSIDE the component so they keep stable references across renders
function InputField({ label, field, type = 'text', placeholder = '', required = false, value, error, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-base font-semibold text-ah-navy dark:text-[#d0daf0]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className={`h-14 px-4 text-lg rounded-xl border-2 ${
          error ? 'border-red-400' : 'border-ah-gray dark:border-[#2a3650]'
        } bg-white dark:bg-[#162030] text-ah-charcoal dark:text-[#edf3ff] placeholder-gray-400 dark:placeholder-[#5a6e8a] transition-colors duration-300`}
      />
      {error && <span className="text-red-500 dark:text-red-400 text-sm">{error}</span>}
    </div>
  );
}

function SelectField({ label, field, options, required = false, value, error, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-base font-semibold text-ah-navy dark:text-[#d0daf0]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={`h-14 px-4 text-lg rounded-xl border-2 ${
          error ? 'border-red-400' : 'border-ah-gray dark:border-[#2a3650]'
        } bg-white dark:bg-[#162030] text-ah-charcoal dark:text-[#edf3ff] transition-colors duration-300`}
      >
        <option value="">— Seleccionar —</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <span className="text-red-500 dark:text-red-400 text-sm">{error}</span>}
    </div>
  );
}

export default function PieceModal({ piece, onSave, onClose, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [cropperSrc, setCropperSrc] = useState(null);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);
  const modalRef = useRef(null);

  const isEditing = !!piece;

  useEffect(() => {
    if (piece) {
      const formData = { ...EMPTY_FORM };
      Object.keys(EMPTY_FORM).forEach((key) => {
        if (piece[key] !== null && piece[key] !== undefined) {
          formData[key] = String(piece[key]);
        }
      });
      setForm(formData);
      if (piece.photo_url) {
        setPhotoPreview(piece.photo_url);
      }
    }
  }, [piece]);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (blob) => {
    setCroppedBlob(blob);
    setPhotoPreview(URL.createObjectURL(blob));
    setCropperSrc(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.code.trim()) errs.code = 'El código es obligatorio';
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!form.type) errs.type = 'Seleccione un tipo';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data = { ...form };
    data.estimated_value_usd = data.estimated_value_usd ? Number(data.estimated_value_usd) : null;
    data.sale_price = data.sale_price ? Number(data.sale_price) : null;
    data.loan_date = data.loan_date || null;
    data.loan_return_date = data.loan_return_date || null;
    data.sale_date = data.sale_date || null;
    data.acquisition_date = data.acquisition_date || null;

    Object.keys(data).forEach((key) => {
      if (data[key] === '') data[key] = null;
    });

    onSave(data, croppedBlob);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start sm:items-start justify-center modal-backdrop">
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 hidden sm:block" onClick={onClose} />

        <div
          ref={modalRef}
          className="relative z-10 w-full max-w-3xl mx-0 sm:mx-4 my-0 sm:my-8 bg-white dark:bg-[#121e32] rounded-none sm:rounded-3xl shadow-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto modal-content transition-colors duration-300"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-[#121e32] border-b border-ah-gray/50 dark:border-[#2a3650] sm:rounded-t-3xl px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between transition-colors duration-300">
            <h2 className="text-2xl sm:text-3xl font-bold text-ah-navy dark:text-[#edf3ff]">
              {isEditing ? 'Editar Pieza' : 'Agregar Nueva Pieza'}
            </h2>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#1a2236] hover:bg-gray-200 dark:hover:bg-[#243048] flex items-center justify-center text-2xl text-ah-charcoal dark:text-[#a0b4d0] transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="px-6 sm:px-8 py-6 space-y-8">
            {/* Foto */}
            <section>
              <h3 className="text-xl font-bold text-ah-navy dark:text-[#edf3ff] mb-4 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                📷 Fotografía
              </h3>
              <div className="flex flex-col items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Vista previa"
                      className="w-64 h-48 object-cover rounded-2xl border-2 border-ah-gray dark:border-[#2a3650] shadow-md"
                    />
                    <button
                      onClick={() => {
                        setPhotoPreview(null);
                        setCroppedBlob(null);
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-64 h-48 rounded-2xl border-2 border-dashed border-ah-gray dark:border-[#3a4e6a] flex flex-col items-center justify-center text-ah-charcoal/40 dark:text-[#5a6e8a]">
                    <span className="text-5xl mb-2">📷</span>
                    <span className="text-base">Sin foto</span>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-6 py-3 text-lg font-semibold rounded-full border-2 border-ah-blue text-ah-blue dark:text-[#7db0ff] dark:border-[#7db0ff] hover:bg-ah-blue/5 dark:hover:bg-ah-blue/10 transition-colors"
                >
                  {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                </button>
              </div>
            </section>

            {/* Información Básica */}
            <section>
              <h3 className="text-xl font-bold text-ah-navy dark:text-[#edf3ff] mb-4 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                📋 Información Básica
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Código" field="code" placeholder="Ej: ART-001" required value={form.code} error={errors.code} onChange={handleChange} />
                <SelectField label="Tipo de Pieza" field="type" options={PIECE_TYPES} required value={form.type} error={errors.type} onChange={handleChange} />
                <div className="sm:col-span-2">
                  <InputField label="Nombre de la Pieza" field="name" placeholder="Ej: Vasija Maya del Período Clásico" required value={form.name} error={errors.name} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-semibold text-ah-navy dark:text-[#d0daf0]">Descripción</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Descripción detallada de la pieza..."
                      rows={3}
                      className="px-4 py-3 text-lg rounded-xl border-2 border-ah-gray dark:border-[#2a3650] bg-white dark:bg-[#162030] text-ah-charcoal dark:text-[#edf3ff] placeholder-gray-400 dark:placeholder-[#5a6e8a] resize-y transition-colors duration-300"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Contexto Histórico */}
            <section>
              <h3 className="text-xl font-bold text-ah-navy dark:text-[#edf3ff] mb-4 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                🏛️ Contexto Histórico
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Año / Período" field="year_period" placeholder="Ej: 1500 a.C. o Siglo XVIII" value={form.year_period} error={errors.year_period} onChange={handleChange} />
                <InputField label="Lugar de Origen" field="origin_place" placeholder="Ej: Oaxaca, México" value={form.origin_place} error={errors.origin_place} onChange={handleChange} />
                <InputField label="Civilización / Cultura" field="civilization" placeholder="Ej: Maya, Azteca, Renacentista" value={form.civilization} error={errors.civilization} onChange={handleChange} />
                <InputField label="Artista / Creador" field="artist" placeholder="Ej: Anónimo o nombre del artista" value={form.artist} error={errors.artist} onChange={handleChange} />
              </div>
            </section>

            {/* Descripción Física */}
            <section>
              <h3 className="text-xl font-bold text-ah-navy dark:text-[#edf3ff] mb-4 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                📐 Descripción Física
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Técnica" field="technique" placeholder="Ej: Óleo sobre lienzo, Talla en piedra" value={form.technique} error={errors.technique} onChange={handleChange} />
                <InputField label="Material" field="material" placeholder="Ej: Madera, Piedra, Óleo" value={form.material} error={errors.material} onChange={handleChange} />
                <InputField label="Dimensiones" field="dimensions" placeholder="Ej: 30cm × 50cm × 10cm" value={form.dimensions} error={errors.dimensions} onChange={handleChange} />
                <InputField label="Peso" field="weight" placeholder="Ej: 2.5 kg" value={form.weight} error={errors.weight} onChange={handleChange} />
                <SelectField label="Estado de Conservación" field="condition" options={CONDITIONS} value={form.condition} error={errors.condition} onChange={handleChange} />
              </div>
            </section>

            {/* Valor y Estado */}
            <section>
              <h3 className="text-xl font-bold text-ah-navy dark:text-[#edf3ff] mb-4 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                💰 Valor y Estado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Valor Estimado (USD)" field="estimated_value_usd" type="number" placeholder="Ej: 5000" value={form.estimated_value_usd} error={errors.estimated_value_usd} onChange={handleChange} />
                <SelectField label="Estado" field="status" options={['inventario', 'prestado', 'vendido']} value={form.status} error={errors.status} onChange={handleChange} />
              </div>

              {form.status === 'prestado' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/15 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
                  <InputField label="Prestado a" field="loaned_to" placeholder="Nombre o institución" value={form.loaned_to} error={errors.loaned_to} onChange={handleChange} />
                  <InputField label="Fecha de Préstamo" field="loan_date" type="date" value={form.loan_date} error={errors.loan_date} onChange={handleChange} />
                  <InputField label="Fecha de Devolución" field="loan_return_date" type="date" value={form.loan_return_date} error={errors.loan_return_date} onChange={handleChange} />
                </div>
              )}

              {form.status === 'vendido' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 p-4 bg-red-50 dark:bg-red-900/15 rounded-xl border border-red-200 dark:border-red-800/30">
                  <InputField label="Vendido a" field="sold_to" placeholder="Nombre del comprador" value={form.sold_to} error={errors.sold_to} onChange={handleChange} />
                  <InputField label="Fecha de Venta" field="sale_date" type="date" value={form.sale_date} error={errors.sale_date} onChange={handleChange} />
                  <InputField label="Precio de Venta (USD)" field="sale_price" type="number" placeholder="Ej: 8000" value={form.sale_price} error={errors.sale_price} onChange={handleChange} />
                </div>
              )}
            </section>

            {/* Adquisición */}
            <section>
              <h3 className="text-xl font-bold text-ah-navy dark:text-[#edf3ff] mb-4 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                📦 Adquisición y Ubicación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Fecha de Adquisición" field="acquisition_date" type="date" value={form.acquisition_date} error={errors.acquisition_date} onChange={handleChange} />
                <InputField label="Fuente / Procedencia" field="acquisition_source" placeholder="Ej: Subasta, Donación, Herencia" value={form.acquisition_source} error={errors.acquisition_source} onChange={handleChange} />
                <div className="sm:col-span-2">
                  <InputField label="Ubicación en la Bodega" field="location_in_warehouse" placeholder="Ej: Estante A3, Pasillo 2" value={form.location_in_warehouse} error={errors.location_in_warehouse} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Notas */}
            <section>
              <h3 className="text-xl font-bold text-ah-navy dark:text-[#edf3ff] mb-4 pb-2 border-b border-ah-blue/20 dark:border-ah-blue/30">
                📝 Notas Adicionales
              </h3>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Cualquier información adicional sobre la pieza..."
                rows={4}
                className="w-full px-4 py-3 text-lg rounded-xl border-2 border-ah-gray dark:border-[#2a3650] bg-white dark:bg-[#162030] text-ah-charcoal dark:text-[#edf3ff] placeholder-gray-400 dark:placeholder-[#5a6e8a] resize-y transition-colors duration-300"
              />
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-[#121e32] border-t border-ah-gray/50 dark:border-[#2a3650] sm:rounded-b-3xl px-4 sm:px-8 py-4 sm:py-5 flex gap-3 sm:gap-4 justify-end transition-colors duration-300">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-ah-gray dark:border-[#3a4e6a] text-ah-charcoal dark:text-[#a0b4d0] hover:bg-gray-50 dark:hover:bg-[#1a2236] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary px-10 py-4 text-lg font-semibold rounded-full text-white disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                isEditing ? 'Guardar Cambios' : 'Agregar Pieza'
              )}
            </button>
          </div>
        </div>
      </div>

      {cropperSrc && (
        <ImageCropper
          imageSrc={cropperSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperSrc(null)}
        />
      )}
    </>
  );
}
