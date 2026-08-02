// ============================================================
// LIFE'S — AltaEmpleado.tsx | Wizard Alta de Empleado
// 5 pasos: Personal → Laboral → Acceso → Docs → Confirmación
// Lucide React | SCSS | Panel Admin Life's
// ============================================================
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, User, Briefcase,
  Shield, FileText, Star, Plus, Trash2, Camera,
  Phone, Mail, MapPin, Calendar, Hash, AlertCircle,
  Upload, CheckCircle, Lock, Eye, EyeOff,
} from 'lucide-react';
import './AltaEmpleado.scss';

// ── Tipos ──────────────────────────────────────────────────
interface FormEmpleado {
  // Paso 1 — Personal
  foto: string;
  nombre: string;
  apellido: string;
  dni: string;
  cuil: string;
  fechaNacimiento: string;
  nacionalidad: string;
  estadoCivil: string;
  domicilio: string;
  provincia: string;
  ciudad: string;
  telefonoPersonal: string;
  celular: string;
  emailPersonal: string;
  // Padre
  padreNombre: string;
  padreDni: string;
  padreTelefono: string;
  // Madre
  madreNombre: string;
  madreDni: string;
  madreTelefono: string;
  // Emergencia
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
  contactoEmergenciaRelacion: string;

  // Paso 2 — Laboral
  legajo: string;
  fechaIngreso: string;
  area: string;
  equipo: string;
  cargoEspecifico: string;
  modalidad: string;
  tipoContrato: string;
  cbu: string;
  salario: string;
  equipamiento: string[];
  onboardingChecklist: string[];

  // Paso 3 — Acceso
  emailCorporativo: string;
  rolSistema: string;
  password: string;
  estado: string;

  // Paso 4 — Documentación
  docsSubidos: string[];
  notasRRHH: string;
}

// ── Opciones ───────────────────────────────────────────────
const ESTADOS_CIVILES = ['Soltero/a','Casado/a','Divorciado/a','Viudo/a','Unión de hecho'];
const MODALIDADES     = ['Presencial','Remoto','Híbrido'];
const CONTRATOS       = ['Relación de dependencia','Freelance','Monotributo','Pasantía','Contrato a plazo fijo'];
const AREAS           = ['Dirección','Operaciones','Tecnología','Verificación','Soporte','Contenido','Marketing','Administración'];
const ROLES_SISTEMA   = ['Superadmin','Administrador','Supervisor de Área','Facilitador de Admisión','Creador'];
const EQUIPAMIENTO_OPS= ['Laptop','Acceso VPN','Email corporativo','Slack','GitHub','Notion','Google Workspace','Figma','Acceso panel admin'];
const ONBOARDING_OPS  = ['Firma de contrato','Creación de email corporativo','Acceso al panel','Capacitación inicial','Presentación al equipo','Configuración 2FA','Documentación entregada'];
const DOCS_REQUERIDOS = ['DNI escaneado (frente y dorso)','Contrato firmado','CV actualizado','Foto carnet','Constancia de CUIL','CBU / datos bancarios'];

const INITIAL_FORM: FormEmpleado = {
  foto:'', nombre:'', apellido:'', dni:'', cuil:'', fechaNacimiento:'',
  nacionalidad:'Argentina', estadoCivil:'', domicilio:'', provincia:'', ciudad:'',
  telefonoPersonal:'', celular:'', emailPersonal:'',
  padreNombre:'', padreDni:'', padreTelefono:'',
  madreNombre:'', madreDni:'', madreTelefono:'',
  contactoEmergenciaNombre:'', contactoEmergenciaTelefono:'', contactoEmergenciaRelacion:'',
  legajo:'', fechaIngreso:'', area:'', equipo:'', cargoEspecifico:'',
  modalidad:'', tipoContrato:'', cbu:'', salario:'',
  equipamiento:[], onboardingChecklist:[...ONBOARDING_OPS],
  emailCorporativo:'', rolSistema:'', password:'', estado:'Activo',
  docsSubidos:[], notasRRHH:'',
};

const PASOS = [
  { num:1, label:'Datos personales', icono:<User      size={16} strokeWidth={1.8}/> },
  { num:2, label:'Datos laborales',  icono:<Briefcase size={16} strokeWidth={1.8}/> },
  { num:3, label:'Acceso al sistema',icono:<Shield    size={16} strokeWidth={1.8}/> },
  { num:4, label:'Documentación',    icono:<FileText  size={16} strokeWidth={1.8}/> },
  { num:5, label:'Confirmación',     icono:<Star      size={16} strokeWidth={1.8}/> },
];

// ── Componente ─────────────────────────────────────────────
export default function AltaEmpleado() {
  const navigate   = useNavigate();
  const fotoRef    = useRef<HTMLInputElement>(null);

  const [paso,     setPaso]     = useState(1);
  const [form,     setForm]     = useState<FormEmpleado>(INITIAL_FORM);
  const [errores,  setErrores]  = useState<Record<string,string>>({});
  const [showPass, setShowPass] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const set = (campo: keyof FormEmpleado, valor: any) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const limpiarError = (campo: string) =>
    setErrores(prev => { const n = {...prev}; delete n[campo]; return n; });

  const toggleArray = (campo: keyof FormEmpleado, val: string) => {
    const arr = form[campo] as string[];
    set(campo, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) set('foto', URL.createObjectURL(file));
  };

  const generarLegajo = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    set('legajo', `LA-${num}`);
  };

  const generarPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    const pass = Array.from({length:12}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
    set('password', pass);
  };

  const validarPaso = (p: number): boolean => {
    const errs: Record<string,string> = {};
    if (p === 1) {
      if (!form.nombre.trim())    errs.nombre    = 'Obligatorio';
      if (!form.apellido.trim())  errs.apellido  = 'Obligatorio';
      if (!form.dni.trim())       errs.dni       = 'Obligatorio';
      if (!form.fechaNacimiento)  errs.fechaNacimiento = 'Obligatorio';
      if (!form.celular.trim())   errs.celular   = 'Obligatorio';
      if (!form.emailPersonal.trim()) errs.emailPersonal = 'Obligatorio';
    }
    if (p === 2) {
      if (!form.fechaIngreso)          errs.fechaIngreso      = 'Obligatorio';
      if (!form.area)                  errs.area              = 'Seleccioná un área';
      if (!form.cargoEspecifico.trim()) errs.cargoEspecifico  = 'Obligatorio';
      if (!form.modalidad)             errs.modalidad         = 'Seleccioná modalidad';
      if (!form.tipoContrato)          errs.tipoContrato      = 'Seleccioná tipo de contrato';
    }
    if (p === 3) {
      if (!form.emailCorporativo.trim()) errs.emailCorporativo = 'Obligatorio';
      if (!form.rolSistema)              errs.rolSistema       = 'Seleccioná un rol';
      if (!form.password.trim())         errs.password         = 'Obligatorio';
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const siguiente = () => { if (validarPaso(paso)) setPaso(p => Math.min(p+1, 5)); };
  const anterior  = () => { setPaso(p => Math.max(p-1, 1)); setErrores({}); };

  const guardar = () => {
    setGuardado(true);
    setTimeout(() => navigate('/lifes-admin'), 2000);
  };

  return (
    <div className="ae-page">

      {/* HEADER */}
      <header className="ae-header">
        <button className="ae-header__back" onClick={() => navigate('/lifes-admin')}>
          <ArrowLeft size={18} strokeWidth={1.8}/>
        </button>
        <div>
          <h1 className="ae-header__titulo">Alta de empleado</h1>
          <p className="ae-header__sub">Panel Admin Life's · Equipo interno</p>
        </div>
      </header>

      {/* STEPPER */}
      <div className="ae-stepper">
        {PASOS.map((p, i) => (
          <div key={p.num} className="ae-stepper__item">
            <button
              className={`ae-stepper__btn ${paso===p.num?'active':''} ${paso>p.num?'done':''}`}
              onClick={() => paso > p.num && setPaso(p.num)}
            >
              {paso > p.num ? <Check size={14} strokeWidth={2.5}/> : p.icono}
            </button>
            <span className="ae-stepper__label">{p.label}</span>
            {i < PASOS.length - 1 && (
              <div className={`ae-stepper__linea ${paso>p.num?'done':''}`}/>
            )}
          </div>
        ))}
      </div>

      <div className="ae-contenido">

        {/* ══ PASO 1 — Datos personales ══ */}
        {paso === 1 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <User size={20} strokeWidth={1.6}/>
              <div>
                <h2>Datos personales</h2>
                <p>Información personal e identidad del empleado</p>
              </div>
            </div>

            {/* Foto carnet */}
            <div className="ae-foto-section">
              <div className="ae-foto-wrap" onClick={() => fotoRef.current?.click()}>
                {form.foto
                  ? <img src={form.foto} alt="Foto carnet"/>
                  : <div className="ae-foto-placeholder">
                      <Camera size={28} strokeWidth={1.4}/>
                      <span>Foto carnet</span>
                    </div>
                }
                <div className="ae-foto-overlay"><Upload size={16} strokeWidth={2}/></div>
              </div>
              <input ref={fotoRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFoto}/>
              <div className="ae-foto-info">
                <strong>Foto carnet del empleado</strong>
                <span>Fondo blanco · Frente · JPG o PNG · Máx 2MB</span>
                <button className="ae-btn-xs-outline" onClick={() => fotoRef.current?.click()}>
                  <Camera size={12} strokeWidth={2}/> {form.foto ? 'Cambiar foto' : 'Subir foto'}
                </button>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Identidad</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>Nombre <span>*</span></label>
                  <input value={form.nombre} onChange={e => { set('nombre',e.target.value); limpiarError('nombre'); }}
                    placeholder="Juan" className={errores.nombre?'error':''}/>
                  {errores.nombre && <span className="ae-error">{errores.nombre}</span>}
                </div>
                <div className="ae-campo">
                  <label>Apellido <span>*</span></label>
                  <input value={form.apellido} onChange={e => { set('apellido',e.target.value); limpiarError('apellido'); }}
                    placeholder="García" className={errores.apellido?'error':''}/>
                  {errores.apellido && <span className="ae-error">{errores.apellido}</span>}
                </div>
                <div className="ae-campo">
                  <label>DNI <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <Hash size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input value={form.dni} onChange={e => { set('dni',e.target.value.replace(/\D/g,'').slice(0,8)); limpiarError('dni'); }}
                      placeholder="12345678" className={errores.dni?'error':''}/>
                  </div>
                  {errores.dni && <span className="ae-error">{errores.dni}</span>}
                </div>
                <div className="ae-campo">
                  <label>CUIL</label>
                  <div className="ae-input-icon-wrap">
                    <Hash size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input value={form.cuil} onChange={e => set('cuil',e.target.value)}
                      placeholder="20-12345678-9"/>
                  </div>
                </div>
                <div className="ae-campo">
                  <label>Fecha de nacimiento <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <Calendar size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input type="date" value={form.fechaNacimiento}
                      onChange={e => { set('fechaNacimiento',e.target.value); limpiarError('fechaNacimiento'); }}
                      className={errores.fechaNacimiento?'error':''}/>
                  </div>
                  {errores.fechaNacimiento && <span className="ae-error">{errores.fechaNacimiento}</span>}
                </div>
                <div className="ae-campo">
                  <label>Nacionalidad</label>
                  <select value={form.nacionalidad} onChange={e => set('nacionalidad',e.target.value)}>
                    {['Argentina','Uruguay','Chile','Brasil','Paraguay','Bolivia','Colombia','España','México','Otro'].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="ae-campo">
                  <label>Estado civil</label>
                  <select value={form.estadoCivil} onChange={e => set('estadoCivil',e.target.value)}>
                    <option value="">Seleccioná...</option>
                    {ESTADOS_CIVILES.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Contacto</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>Teléfono personal</label>
                  <div className="ae-input-icon-wrap">
                    <Phone size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input value={form.telefonoPersonal} onChange={e => set('telefonoPersonal',e.target.value)} placeholder="+54 261 xxx-xxxx"/>
                  </div>
                </div>
                <div className="ae-campo">
                  <label>Celular <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <Phone size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input value={form.celular} onChange={e => { set('celular',e.target.value); limpiarError('celular'); }}
                      placeholder="+54 9 261 xxx-xxxx" className={errores.celular?'error':''}/>
                  </div>
                  {errores.celular && <span className="ae-error">{errores.celular}</span>}
                </div>
                <div className="ae-campo ae-campo--full">
                  <label>Email personal <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <Mail size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input type="email" value={form.emailPersonal}
                      onChange={e => { set('emailPersonal',e.target.value); limpiarError('emailPersonal'); }}
                      placeholder="juan@gmail.com" className={errores.emailPersonal?'error':''}/>
                  </div>
                  {errores.emailPersonal && <span className="ae-error">{errores.emailPersonal}</span>}
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Domicilio</h3>
              <div className="ae-grid-3">
                <div className="ae-campo ae-campo--full">
                  <label>Dirección</label>
                  <div className="ae-input-icon-wrap">
                    <MapPin size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input value={form.domicilio} onChange={e => set('domicilio',e.target.value)} placeholder="Calle, número, piso"/>
                  </div>
                </div>
                <div className="ae-campo">
                  <label>Provincia</label>
                  <input value={form.provincia} onChange={e => set('provincia',e.target.value)} placeholder="Mendoza"/>
                </div>
                <div className="ae-campo">
                  <label>Ciudad</label>
                  <input value={form.ciudad} onChange={e => set('ciudad',e.target.value)} placeholder="Ciudad"/>
                </div>
              </div>
            </div>

            {/* Padre y Madre */}
            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Datos del padre <span className="ae-seccion__opt">Opcional</span></h3>
              <div className="ae-grid-3">
                <div className="ae-campo">
                  <label>Nombre completo</label>
                  <input value={form.padreNombre} onChange={e => set('padreNombre',e.target.value)} placeholder="Nombre y apellido"/>
                </div>
                <div className="ae-campo">
                  <label>DNI</label>
                  <input value={form.padreDni} onChange={e => set('padreDni',e.target.value.replace(/\D/g,'').slice(0,8))} placeholder="12345678"/>
                </div>
                <div className="ae-campo">
                  <label>Teléfono</label>
                  <input value={form.padreTelefono} onChange={e => set('padreTelefono',e.target.value)} placeholder="+54 xxx xxx-xxxx"/>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Datos de la madre <span className="ae-seccion__opt">Opcional</span></h3>
              <div className="ae-grid-3">
                <div className="ae-campo">
                  <label>Nombre completo</label>
                  <input value={form.madreNombre} onChange={e => set('madreNombre',e.target.value)} placeholder="Nombre y apellido"/>
                </div>
                <div className="ae-campo">
                  <label>DNI</label>
                  <input value={form.madreDni} onChange={e => set('madreDni',e.target.value.replace(/\D/g,'').slice(0,8))} placeholder="12345678"/>
                </div>
                <div className="ae-campo">
                  <label>Teléfono</label>
                  <input value={form.madreTelefono} onChange={e => set('madreTelefono',e.target.value)} placeholder="+54 xxx xxx-xxxx"/>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Contacto de emergencia</h3>
              <div className="ae-grid-3">
                <div className="ae-campo">
                  <label>Nombre completo</label>
                  <input value={form.contactoEmergenciaNombre} onChange={e => set('contactoEmergenciaNombre',e.target.value)} placeholder="Nombre y apellido"/>
                </div>
                <div className="ae-campo">
                  <label>Teléfono</label>
                  <input value={form.contactoEmergenciaTelefono} onChange={e => set('contactoEmergenciaTelefono',e.target.value)} placeholder="+54 9 xxx xxx-xxxx"/>
                </div>
                <div className="ae-campo">
                  <label>Relación</label>
                  <select value={form.contactoEmergenciaRelacion} onChange={e => set('contactoEmergenciaRelacion',e.target.value)}>
                    <option value="">Seleccioná...</option>
                    {['Cónyuge','Padre','Madre','Hermano/a','Hijo/a','Amigo/a','Otro'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ PASO 2 — Datos laborales ══ */}
        {paso === 2 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <Briefcase size={20} strokeWidth={1.6}/>
              <div>
                <h2>Datos laborales</h2>
                <p>Información sobre el rol, contrato y condiciones de trabajo</p>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Identificación interna</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>Nº de legajo</label>
                  <div style={{display:'flex',gap:'8px'}}>
                    <input value={form.legajo} onChange={e => set('legajo',e.target.value)} placeholder="LA-0001"/>
                    <button className="ae-btn-xs-outline" onClick={generarLegajo} style={{whiteSpace:'nowrap'}}>
                      Generar
                    </button>
                  </div>
                </div>
                <div className="ae-campo">
                  <label>Fecha de ingreso <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <Calendar size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input type="date" value={form.fechaIngreso}
                      onChange={e => { set('fechaIngreso',e.target.value); limpiarError('fechaIngreso'); }}
                      className={errores.fechaIngreso?'error':''}/>
                  </div>
                  {errores.fechaIngreso && <span className="ae-error">{errores.fechaIngreso}</span>}
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Posición</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>Área <span>*</span></label>
                  <select value={form.area} onChange={e => { set('area',e.target.value); limpiarError('area'); }}
                    className={errores.area?'error':''}>
                    <option value="">Seleccioná...</option>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                  {errores.area && <span className="ae-error">{errores.area}</span>}
                </div>
                <div className="ae-campo">
                  <label>Equipo / Sub-área</label>
                  <input value={form.equipo} onChange={e => set('equipo',e.target.value)} placeholder="Ej: Equipo Verificación"/>
                </div>
                <div className="ae-campo ae-campo--full">
                  <label>Cargo específico <span>*</span></label>
                  <input value={form.cargoEspecifico}
                    onChange={e => { set('cargoEspecifico',e.target.value); limpiarError('cargoEspecifico'); }}
                    placeholder="Ej: Tech Lead Frontend, Facilitador Senior, Analista..."
                    className={errores.cargoEspecifico?'error':''}/>
                  {errores.cargoEspecifico && <span className="ae-error">{errores.cargoEspecifico}</span>}
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Modalidad y contrato</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>Modalidad de trabajo <span>*</span></label>
                  <div className="ae-opciones-row">
                    {MODALIDADES.map(m => (
                      <button key={m}
                        className={`ae-opcion-btn${form.modalidad===m?' active':''}`}
                        onClick={() => { set('modalidad',m); limpiarError('modalidad'); }}
                      >{m}</button>
                    ))}
                  </div>
                  {errores.modalidad && <span className="ae-error">{errores.modalidad}</span>}
                </div>
                <div className="ae-campo">
                  <label>Tipo de contrato <span>*</span></label>
                  <select value={form.tipoContrato}
                    onChange={e => { set('tipoContrato',e.target.value); limpiarError('tipoContrato'); }}
                    className={errores.tipoContrato?'error':''}>
                    <option value="">Seleccioná...</option>
                    {CONTRATOS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errores.tipoContrato && <span className="ae-error">{errores.tipoContrato}</span>}
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Datos económicos <span className="ae-seccion__privado">🔒 Solo Superadmin</span></h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>CBU bancario</label>
                  <input value={form.cbu} onChange={e => set('cbu',e.target.value.replace(/\D/g,'').slice(0,22))}
                    placeholder="0000000000000000000000"/>
                  <span className="ae-campo__hint">22 dígitos · Solo visible para Superadmin</span>
                </div>
                <div className="ae-campo">
                  <label>Salario / Honorarios mensuales</label>
                  <div className="ae-input-icon-wrap">
                    <span style={{position:'absolute',left:'12px',fontSize:'0.82rem',color:'rgba(255,255,255,0.3)'}}>$</span>
                    <input style={{paddingLeft:'28px'}} type="number" value={form.salario}
                      onChange={e => set('salario',e.target.value)} placeholder="0"/>
                  </div>
                  <span className="ae-campo__hint">Solo visible para Superadmin</span>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Equipamiento asignado</h3>
              <div className="ae-checklist-grid">
                {EQUIPAMIENTO_OPS.map(item => (
                  <div key={item} className="ae-check-item" onClick={() => toggleArray('equipamiento',item)}>
                    <div className={`ae-check-item__box${form.equipamiento.includes(item)?' active':''}`}>
                      {form.equipamiento.includes(item) && <Check size={11} strokeWidth={2.5}/>}
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Checklist de onboarding</h3>
              <div className="ae-checklist-grid">
                {ONBOARDING_OPS.map(item => (
                  <div key={item} className="ae-check-item" onClick={() => toggleArray('onboardingChecklist',item)}>
                    <div className={`ae-check-item__box${form.onboardingChecklist.includes(item)?' active':''}`}>
                      {form.onboardingChecklist.includes(item) && <Check size={11} strokeWidth={2.5}/>}
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <span className="ae-campo__hint">Marcá las tareas que ya fueron completadas al momento del alta</span>
            </div>
          </div>
        )}

        {/* ══ PASO 3 — Acceso al sistema ══ */}
        {paso === 3 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <Shield size={20} strokeWidth={1.6}/>
              <div>
                <h2>Acceso al sistema</h2>
                <p>Credenciales y permisos para el panel de administración</p>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Credenciales</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>Email corporativo <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <Mail size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input type="email" value={form.emailCorporativo}
                      onChange={e => { set('emailCorporativo',e.target.value); limpiarError('emailCorporativo'); }}
                      placeholder="juan.garcia@lifes.com"
                      className={errores.emailCorporativo?'error':''}/>
                  </div>
                  {errores.emailCorporativo && <span className="ae-error">{errores.emailCorporativo}</span>}
                  <span className="ae-campo__hint">Formato recomendado: nombre.apellido@lifes.com</span>
                </div>
                <div className="ae-campo">
                  <label>Contraseña inicial <span>*</span></label>
                  <div style={{display:'flex',gap:'8px'}}>
                    <div className="ae-input-icon-wrap" style={{flex:1}}>
                      <Lock size={14} strokeWidth={1.8} className="ae-input-icon"/>
                      <input
                        type={showPass?'text':'password'}
                        value={form.password}
                        onChange={e => { set('password',e.target.value); limpiarError('password'); }}
                        placeholder="Contraseña segura"
                        className={errores.password?'error':''}
                        style={{paddingRight:'36px'}}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        style={{position:'absolute',right:'10px',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.3)',display:'flex'}}>
                        {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                    <button className="ae-btn-xs-outline" onClick={generarPassword} style={{whiteSpace:'nowrap'}}>
                      Generar
                    </button>
                  </div>
                  {errores.password && <span className="ae-error">{errores.password}</span>}
                  <span className="ae-campo__hint">El empleado deberá cambiarla en su primer acceso</span>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Rol y permisos</h3>
              <div className="ae-campo">
                <label>Rol en el sistema <span>*</span></label>
                <div className="ae-roles-grid">
                  {ROLES_SISTEMA.map(rol => (
                    <button key={rol}
                      className={`ae-rol-btn${form.rolSistema===rol?' active':''}`}
                      onClick={() => { set('rolSistema',rol); limpiarError('rolSistema'); }}
                    >
                      <span className="ae-rol-btn__nombre">{rol}</span>
                      <span className="ae-rol-btn__desc">
                        {rol==='Superadmin'          ? 'Acceso total a todo el sistema' :
                         rol==='Administrador'        ? 'Gestión de empresas y usuarios' :
                         rol==='Supervisor de Área'   ? 'Supervisión de equipos y reportes' :
                         rol==='Facilitador de Admisión' ? 'Verificación de empresas' :
                         'Acceso técnico y mantenimiento'}
                      </span>
                    </button>
                  ))}
                </div>
                {errores.rolSistema && <span className="ae-error">{errores.rolSistema}</span>}
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Estado de la cuenta</h3>
              <div className="ae-opciones-row">
                {['Activo','Inactivo','Licencia'].map(e => (
                  <button key={e}
                    className={`ae-opcion-btn${form.estado===e?' active':''}`}
                    onClick={() => set('estado',e)}
                  >{e}</button>
                ))}
              </div>
            </div>

            <div className="ae-info-box">
              <Shield size={16} strokeWidth={1.8}/>
              <div>
                <strong>Seguridad del acceso</strong>
                <p>Se solicitará activar 2FA en el primer ingreso. El empleado recibirá las credenciales por email y deberá cambiar la contraseña inicial.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══ PASO 4 — Documentación ══ */}
        {paso === 4 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <FileText size={20} strokeWidth={1.6}/>
              <div>
                <h2>Documentación</h2>
                <p>Documentos requeridos para el legajo del empleado</p>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Documentos a presentar</h3>
              <div className="ae-docs-upload-lista">
                {DOCS_REQUERIDOS.map(doc => {
                  const subido = form.docsSubidos.includes(doc);
                  return (
                    <div key={doc} className={`ae-doc-upload${subido?' subido':''}`}>
                      <div className="ae-doc-upload__info">
                        <div className={`ae-doc-upload__check${subido?' ok':''}`}>
                          {subido ? <Check size={12} strokeWidth={2.5}/> : <FileText size={12} strokeWidth={1.8}/>}
                        </div>
                        <span>{doc}</span>
                      </div>
                      <button
                        className={`ae-doc-upload__btn${subido?' subido':''}`}
                        onClick={() => toggleArray('docsSubidos', doc)}
                      >
                        {subido ? <><CheckCircle size={13} strokeWidth={2}/> Cargado</> : <><Upload size={13} strokeWidth={2}/> Subir</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Notas del área de Equipo</h3>
              <div className="ae-campo ae-campo--full">
                <label>Observaciones internas</label>
                <textarea rows={4} value={form.notasRRHH}
                  onChange={e => set('notasRRHH',e.target.value)}
                  placeholder="Notas sobre el proceso de incorporación, evaluación inicial, acuerdos especiales..."/>
                <span className="ae-campo__hint">Solo visible para Superadmin y Administradores</span>
              </div>
            </div>
          </div>
        )}

        {/* ══ PASO 5 — Confirmación ══ */}
        {paso === 5 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <Star size={20} strokeWidth={1.6}/>
              <div>
                <h2>Confirmación del alta</h2>
                <p>Revisá los datos antes de confirmar</p>
              </div>
            </div>

            <div className="ae-resumen-empleado">
              {/* Foto y datos principales */}
              <div className="ae-resumen-empleado__header">
                <div className="ae-resumen-empleado__foto">
                  {form.foto
                    ? <img src={form.foto} alt="Foto"/>
                    : <User size={32} strokeWidth={1.4}/>
                  }
                </div>
                <div>
                  <h3>{form.nombre} {form.apellido || '—'}</h3>
                  <span>{form.cargoEspecifico || 'Sin cargo definido'}</span>
                  <span>{form.area || 'Sin área'} {form.equipo ? `· ${form.equipo}` : ''}</span>
                </div>
                {form.rolSistema && (
                  <span className="ae-resumen-empleado__rol-badge">{form.rolSistema}</span>
                )}
              </div>

              <div className="ae-resumen__grid">
                {[
                  { label:'DNI',          val: form.dni || '—' },
                  { label:'CUIL',         val: form.cuil || '—' },
                  { label:'Email personal',val: form.emailPersonal || '—' },
                  { label:'Celular',       val: form.celular || '—' },
                  { label:'Legajo',        val: form.legajo || '—' },
                  { label:'Fecha ingreso', val: form.fechaIngreso || '—' },
                  { label:'Modalidad',     val: form.modalidad || '—' },
                  { label:'Contrato',      val: form.tipoContrato || '—' },
                  { label:'Email corp.',   val: form.emailCorporativo || '—' },
                  { label:'Estado',        val: form.estado },
                  { label:'Onboarding',    val: `${form.onboardingChecklist.length}/${ONBOARDING_OPS.length} completados` },
                  { label:'Docs',          val: `${form.docsSubidos.length}/${DOCS_REQUERIDOS.length} cargados` },
                ].map(item => (
                  <div key={item.label} className="ae-resumen__item">
                    <span>{item.label}</span>
                    <strong>{item.val}</strong>
                  </div>
                ))}
              </div>

              {form.docsSubidos.length < DOCS_REQUERIDOS.length && (
                <div className="ae-alerta-warn">
                  <AlertCircle size={14} strokeWidth={2}/>
                  <span>Faltan {DOCS_REQUERIDOS.length - form.docsSubidos.length} documentos por cargar. Podés completarlos después desde la ficha del empleado.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NAVEGACIÓN */}
        <div className="ae-nav">
          {paso > 1 && (
            <button className="ae-nav__btn-prev" onClick={anterior}>
              <ArrowLeft size={16} strokeWidth={2}/> Anterior
            </button>
          )}
          <div style={{flex:1}}/>
          {paso < 5 ? (
            <button className="ae-nav__btn-next" onClick={siguiente}>
              Siguiente <ArrowRight size={16} strokeWidth={2}/>
            </button>
          ) : (
            <button className="ae-nav__btn-guardar" onClick={guardar} disabled={guardado}>
              {guardado
                ? <><Check size={16} strokeWidth={2}/> ¡Empleado registrado!</>
                : <><Check size={16} strokeWidth={2}/> Confirmar alta</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
