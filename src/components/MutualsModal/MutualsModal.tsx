// ============================================
// LIFE'S — Modal de vínculos mutuos
// Muestra quiénes son las conexiones en común con otra persona.
// ============================================
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { userService } from '../../services/api';
import PersonHoverCard from '../PersonHoverCard/PersonHoverCard';
import './MutualsModal.scss';

interface Persona {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

interface MutualsModalProps {
  userId: string;
  nombre: string;
  onClose: () => void;
}

export default function MutualsModal({ userId, nombre, onClose }: MutualsModalProps) {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    userService.getMutuals(userId)
      .then(async (res: any) => {
        const lista: Persona[] = res.data;

        // precargamos todas las fotos ANTES de mostrar la lista, así no
        // aparece el nombre con el espacio de la foto vacío por un instante
        await Promise.all(
          lista.map((p) => new Promise<void>((resolve) => {
            if (!p.avatarUrl) return resolve();
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // si falla la carga, no bloqueamos el resto
            img.src = p.avatarUrl;
          }))
        );

        if (!cancelado) setPersonas(lista);
      })
      .catch(() => { if (!cancelado) setPersonas([]); })
      .finally(() => { if (!cancelado) setCargando(false); });

    return () => { cancelado = true; };
  }, [userId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const irAlPerfil = (id: string) => {
    onClose();
    navigate(`/perfil/${id}`);
  };

  return (
    <div className="mutuals-overlay" onClick={onClose}>
      <div className="mutuals-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mutuals-modal__header">
          <h3>Vínculos en común con {nombre}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="mutuals-modal__lista">
          {cargando && <p className="mutuals-modal__vacio">Cargando...</p>}
          {!cargando && personas.length === 0 && (
            <p className="mutuals-modal__vacio">No encontramos vínculos en común.</p>
          )}
          {!cargando && personas.map((p) => (
            <div key={p.id} className="mutuals-modal__persona">
              <button className="mutuals-modal__persona-avatar-btn" onClick={() => irAlPerfil(p.id)}>
                {p.avatarUrl
                  ? <img src={p.avatarUrl} alt={p.firstName} loading="eager" decoding="sync" />
                  : <div className="mutuals-modal__persona-vacio">{p.firstName[0]}</div>
                }
              </button>
              <PersonHoverCard userId={p.id}>
                <Link to={`/perfil/${p.id}`} className="mutuals-modal__persona-nombre" onClick={onClose}>
                  {p.firstName} {p.lastName}
                </Link>
              </PersonHoverCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}