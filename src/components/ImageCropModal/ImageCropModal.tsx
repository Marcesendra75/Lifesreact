// ============================================
// LIFE'S — Modal de recorte/posición de imagen
// Reusable para avatar (círculo) y portada (rectángulo)
// ============================================
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImageBlob } from './cropUtils';
import './ImageCropModal.scss';

interface ImageCropModalProps {
  file: File;
  aspect: number; // 1 = cuadrado (avatar), 3 = portada ancha, etc.
  cropShape?: 'rect' | 'round';
  titulo: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

export default function ImageCropModal({
  file, aspect, cropShape = 'rect', titulo, onCancel, onConfirm,
}: ImageCropModalProps) {
  const [imageSrc] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [procesando, setProcesando] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const confirmar = async () => {
    if (!croppedAreaPixels) return;
    setProcesando(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, file.type || 'image/jpeg');
      onConfirm(blob);
    } catch (err) {
      alert('No se pudo procesar la imagen. Probá con otra.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="crop-modal-overlay" onClick={onCancel}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal__header">
          <h3>{titulo}</h3>
          <button onClick={onCancel} aria-label="Cerrar">✕</button>
        </div>

        <div className="crop-modal__area">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="crop-modal__controles">
          <label>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div className="crop-modal__acciones">
          <button className="crop-modal__btn-cancelar" onClick={onCancel} disabled={procesando}>
            Cancelar
          </button>
          <button className="crop-modal__btn-confirmar" onClick={confirmar} disabled={procesando}>
            {procesando ? 'Procesando...' : 'Aplicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
