// ============================================
// LIFE'S — Modal de confirmación reusable
// Para reemplazar los confirm()/alert() nativos del navegador
// en cualquier parte de la app, con estética consistente.
// ============================================
import './ConfirmModal.scss';

interface ConfirmModalProps {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligroso?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  titulo, mensaje, textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar',
  peligroso = false, onConfirm, onCancel,
}: ConfirmModalProps) {
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-modal__titulo">{titulo}</h3>
        <p className="confirm-modal__mensaje">{mensaje}</p>
        <div className="confirm-modal__botones">
          <button className="confirm-modal__cancelar" onClick={onCancel}>{textoCancelar}</button>
          <button
            className={`confirm-modal__confirmar${peligroso ? ' peligroso' : ''}`}
            onClick={onConfirm}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}