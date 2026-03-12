'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      'image/jpeg',
      0.9
    );
  });
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropAreaComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedBlob);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col modal-backdrop">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
        />
      </div>

      <div className="bg-white dark:bg-[#121e32] p-4 sm:p-6 flex flex-col gap-4 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium text-ah-navy dark:text-[#d0daf0] min-w-[60px]">Zoom:</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-3 accent-ah-blue cursor-pointer"
          />
        </div>

        <div className="flex gap-3 sm:gap-4 justify-end">
          <button
            onClick={onCancel}
            className="flex-1 sm:flex-none px-6 sm:px-8 py-4 text-lg font-semibold rounded-full border-2 border-ah-gray dark:border-[#3a4e6a] text-ah-charcoal dark:text-[#a0b4d0] hover:bg-gray-50 dark:hover:bg-[#1a2236] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 sm:flex-none btn-primary px-6 sm:px-8 py-4 text-lg font-semibold rounded-full text-white"
          >
            Recortar Foto
          </button>
        </div>
      </div>
    </div>
  );
}
