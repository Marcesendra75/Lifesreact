// ============================================
// LIFE'S — Modal para crear un recuerdo nuevo
// Usado desde el Feed (antes no existía en ningún lado)
// ============================================
import { useState, useEffect, useRef } from 'react';
import { X, Camera, Image as ImageIcon } from 'lucide-react';
import { memoryService, chapterService } from '../../services/api';
import './CrearRecuerdoModal.scss';

interface Chapter {
  id: string;
  nombre: string;
  emoji: string;
}

interface CrearRecuerdoModalProps {
  onClose: () => void;
  onCreado: () => void;
}

export default function CrearRecuerdoModal({ onClose, onCreado }: CrearRecuerdoModalProps) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterId, setChapterId] = useState('');
  const [cargandoChapters, setCargandoChapters] = useState(true);
  const [publicando, setPublicando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chapterService.list().then((res: any) => setChapters(res.data)).catch(() => {}).finally(() => setCargandoChapters(false));
  }, []);

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

    const publicar = async () => {
    if (publicando) return; // freno extra: ya se está publicando, ignorá clics de más
    if (!caption.trim() && !file) {
      alert('Escribí algo o agregá una foto/video');
      return;
    }
    setPublicando(true);
    try {
      await memoryService.create(caption.trim() || undefined, file || undefined, chapterId || undefined);
      onCreado();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al publicar');
    } finally {
      setPublicando(false);
    }
  };

  return (
    <div className="crear-recuerdo-overlay" onClick={onClose}>
      <div className="crear-recuerdo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crear-recuerdo-modal__header">
          <h3>Nuevo recuerdo</h3>
          <button onClick={onClose}><X size={18} strokeWidth={1.8} /></button>
        </div>

        <div className="crear-recuerdo-modal__body">
          <textarea
            autoFocus
            placeholder="¿Qué momento querés preservar hoy?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
          />

          {preview && (
            <div className="crear-recuerdo-modal__preview">
              {file?.type.startsWith('video') ? <video src={preview} controls /> : <img src={preview} alt="preview" />}
              <button className="crear-recuerdo-modal__quitar" onClick={() => { setFile(null); setPreview(''); }}>
                <X size={12} strokeWidth={2} /> Quitar
              </button>
            </div>
          )}

          <input ref={inputRef} type="file" accept="image/*,video/*" hidden onChange={onFileSelected} />
          <button className="crear-recuerdo-modal__foto-btn" onClick={() => inputRef.current?.click()}>
            <Camera size={16} strokeWidth={1.8} /> {preview ? 'Cambiar foto/video' : 'Agregar foto o video'}
          </button>

          {!cargandoChapters && chapters.length > 0 && (
            <div className="crear-recuerdo-modal__campo">
              <label>Capítulo (opcional)</label>
              <select value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
                <option value="">— Sin capítulo —</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="crear-recuerdo-modal__footer">
          <button className="crear-recuerdo-modal__cancelar" onClick={onClose}>Cancelar</button>
          <button className="crear-recuerdo-modal__publicar" onClick={publicar} disabled={publicando}>
            <ImageIcon size={14} strokeWidth={1.8} /> {publicando ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}