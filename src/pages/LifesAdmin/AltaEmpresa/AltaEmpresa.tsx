// ============================================================
// LIFE'S — AltaEmpresa.tsx | Wizard Alta de Empresa
// 5 pasos: Identidad Legal → Socios → Negocio → Plan → Docs
// Lucide React | SCSS | Panel Admin Life's
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Building2, Users,
  Briefcase, Settings, FileText, Plus, Trash2,
  Phone, Mail, Globe, MapPin, CreditCard, User,
  AlertCircle, CheckCircle, Upload, X, Crown,
  Calendar, Hash, Percent,
} from 'lucide-react';
import './AltaEmpresa.scss';

// ── Tipos ──────────────────────────────────────────────────
interface Socio {
  id: string;
  nombre: string;
  dniCuit: string;
  participacion: string;
  email: string;
  telefono: string;
  esRepresentante: boolean;
}

interface FormData {
  // Paso 1 — Identidad legal
  razonSocial: string;
  nombreComercial: string;
  tipoSocietario: string;
  cuit: string;
  fechaConstitucion: string;
  pais: string;
  provincia: string;
  ciudad: string;
  domicilioLegal: string;
  telefonoContacto: string;
  encargadoCuenta: string;
  encargadoCelular: string;
  encargadoEmail: string;

  // Paso 2 — Socios
  socios: Socio[];

  // Paso 3 — Negocio
  rubro: string;
  subRubro: string;
  cantidadEmpleados: string;
  añoFundacion: string;
  web: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  descripcion: string;
  mision: string;

  // Paso 4 — Plan Life's
  plan: string;
  storageExtra: string;
  nivelVerificacion: string;
  ejecutivoAsignado: string;
  facilitadorAsignado: string;
  estado: string;
  notasInternas: string;

  // Paso 5 — Docs
  emailDocumentacion: string;
  docsRequeridos: string[];
}

// ── Opciones ───────────────────────────────────────────────
const TIPOS_SOCIETARIOS = ['SA','SRL','SAS','Cooperativa','ONG','Municipio','Club','Persona física','Fundación','Otro'];
const RUBROS = ['Finanzas','Salud','Educación','Tecnología','Industria','Comercio','Deporte','Cultura','Gobierno','ONG','Medios','Turismo','Agro','Construcción','Otro'];
const EMPLEADOS = ['1-10','11-50','51-200','201-500','+500'];
const PLANES = [
  { id:'starter',    label:'Starter',      precio:'$500/año',    desc:'PyMEs, clubes y ONGs' },
  { id:'pro',        label:'Professional', precio:'$1.200/año',  desc:'Empresas medianas', destacado:true },
  { id:'enterprise', label:'Enterprise',   precio:'A consultar', desc:'Grandes corporaciones' },
];
const EJECUTIVOS = ['Marcelo García','Admin Operaciones','Laura Méndez','Carlos Ruiz'];
const FACILITADORES = ['Laura Méndez','Carlos Ruiz','Sin asignar'];
const ESTADOS = ['Pendiente','En revisión','Verificada','Rechazada','Suspendida'];
const DOCS_REQUERIDOS = [
  'Estatuto o contrato social',
  'DNI del representante legal',
  'Constancia de CUIT',
  'Acta de directorio / socios',
];

const INITIAL_FORM: FormData = {
  razonSocial:'', nombreComercial:'', tipoSocietario:'', cuit:'',
  fechaConstitucion:'', pais:'Argentina', provincia:'', ciudad:'',
  domicilioLegal:'', telefonoContacto:'', encargadoCuenta:'',
  encargadoCelular:'', encargadoEmail:'',
  socios:[],
  rubro:'', subRubro:'', cantidadEmpleados:'', añoFundacion:'',
  web:'', instagram:'', linkedin:'', twitter:'',
  descripcion:'', mision:'',
  plan:'pro', storageExtra:'0', nivelVerificacion:'1',
  ejecutivoAsignado:'Sin asignar', facilitadorAsignado:'Sin asignar',
  estado:'Pendiente', notasInternas:'',
  emailDocumentacion:'', docsRequeridos:[...DOCS_REQUERIDOS],
};

// ── Validar CUIT ───────────────────────────────────────────
const validarCUIT = (cuit: string) => {
  const limpio = cuit.replace(/[-\s]/g, '');
  if (limpio.length !== 11) return false;
  if (!/^\d+$/.test(limpio)) return false;
  const mult = [5,4,3,2,7,6,5,4,3,2];
  const sum = mult.reduce((acc, m, i) => acc + m * parseInt(limpio[i]), 0);
  const resto = sum % 11;
  const dig = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;
  return dig === parseInt(limpio[10]);
};

const formatCUIT = (val: string) => {
  const n = val.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 10) return `${n.slice(0,2)}-${n.slice(2)}`;
  return `${n.slice(0,2)}-${n.slice(2,10)}-${n.slice(10)}`;
};

// ── Pasos config ───────────────────────────────────────────
const PASOS = [
  { num:1, label:'Identidad legal',  icono:<Building2  size={16} strokeWidth={1.8}/> },
  { num:2, label:'Socios',           icono:<Users      size={16} strokeWidth={1.8}/> },
  { num:3, label:'El negocio',       icono:<Briefcase  size={16} strokeWidth={1.8}/> },
  { num:4, label:'Plan Life\'s',     icono:<Settings   size={16} strokeWidth={1.8}/> },
  { num:5, label:'Documentación',    icono:<FileText   size={16} strokeWidth={1.8}/> },
];

// ── Componente ─────────────────────────────────────────────
export default function AltaEmpresa() {
  const navigate  = useNavigate();
  const [paso,    setPaso]    = useState(1);
  const [form,    setForm]    = useState<FormData>(INITIAL_FORM);
  const [errores, setErrores] = useState<Record<string,string>>({});
  const [cuitOk,  setCuitOk]  = useState<boolean|null>(null);
  const [guardado, setGuardado] = useState(false);

  const set = (campo: keyof FormData, valor: any) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const limpiarError = (campo: string) =>
    setErrores(prev => { const n = {...prev}; delete n[campo]; return n; });

  // Validaciones por paso
  const validarPaso = (p: number): boolean => {
    const errs: Record<string,string> = {};
    if (p === 1) {
      if (!form.razonSocial.trim())    errs.razonSocial    = 'Obligatorio';
      if (!form.nombreComercial.trim()) errs.nombreComercial = 'Obligatorio';
      if (!form.tipoSocietario)        errs.tipoSocietario = 'Seleccioná un tipo';
      if (!form.cuit.trim())           errs.cuit           = 'Obligatorio';
      else if (cuitOk === false)       errs.cuit           = 'CUIT inválido';
      if (!form.fechaConstitucion)     errs.fechaConstitucion = 'Obligatorio';
      if (!form.provincia.trim())      errs.provincia      = 'Obligatorio';
      if (!form.ciudad.trim())         errs.ciudad         = 'Obligatorio';
      if (!form.domicilioLegal.trim()) errs.domicilioLegal = 'Obligatorio';
      if (!form.encargadoCuenta.trim()) errs.encargadoCuenta = 'Obligatorio';
      if (!form.encargadoEmail.trim()) errs.encargadoEmail = 'Obligatorio';
    }
    if (p === 2) {
      if (form.socios.length === 0) errs.socios = 'Agregá al menos un propietario';
      else {
        const reprs = form.socios.filter(s => s.esRepresentante);
        if (reprs.length === 0) errs.socios = 'Designá un representante legal';
      }
    }
    if (p === 3) {
      if (!form.rubro)              errs.rubro      = 'Seleccioná un rubro';
      if (!form.cantidadEmpleados)  errs.cantidadEmpleados = 'Seleccioná un rango';
      if (!form.descripcion.trim()) errs.descripcion = 'Obligatorio';
    }
    if (p === 5) {
      if (!form.emailDocumentacion.trim()) errs.emailDocumentacion = 'Necesitamos un email para indicar dónde enviar los documentos';
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const siguiente = () => { if (validarPaso(paso)) setPaso(p => Math.min(p+1, 5)); };
  const anterior  = () => { setPaso(p => Math.max(p-1, 1)); setErrores({}); };

  const agregarSocio = () => {
    const nuevo: Socio = {
      id: Date.now().toString(), nombre:'', dniCuit:'', participacion:'',
      email:'', telefono:'', esRepresentante: form.socios.length === 0,
    };
    set('socios', [...form.socios, nuevo]);
  };

  const actualizarSocio = (id: string, campo: keyof Socio, valor: any) => {
    set('socios', form.socios.map(s => s.id === id ? { ...s, [campo]: valor } : s));
  };

  const eliminarSocio = (id: string) => {
    set('socios', form.socios.filter(s => s.id !== id));
  };

  const setRepresentante = (id: string) => {
    set('socios', form.socios.map(s => ({ ...s, esRepresentante: s.id === id })));
  };

  const guardar = () => {
    if (!validarPaso(5)) return;
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
          <h1 className="ae-header__titulo">Alta de empresa</h1>
          <p className="ae-header__sub">Panel Admin Life's · Nuevo registro</p>
        </div>
      </header>

      {/* STEPPER */}
      <div className="ae-stepper">
        {PASOS.map((p, i) => (
          <div key={p.num} className="ae-stepper__item">
            <button
              className={`ae-stepper__btn ${paso === p.num ? 'active' : ''} ${paso > p.num ? 'done' : ''}`}
              onClick={() => paso > p.num && setPaso(p.num)}
            >
              {paso > p.num ? <Check size={14} strokeWidth={2.5}/> : p.icono}
            </button>
            <span className="ae-stepper__label">{p.label}</span>
            {i < PASOS.length - 1 && (
              <div className={`ae-stepper__linea ${paso > p.num ? 'done' : ''}`}/>
            )}
          </div>
        ))}
      </div>

      <div className="ae-contenido">

        {/* ══ PASO 1 — Identidad legal ══ */}
        {paso === 1 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <Building2 size={20} strokeWidth={1.6}/>
              <div>
                <h2>Identidad legal</h2>
                <p>Datos formales y de contacto de la organización</p>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Datos societarios</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>Razón social <span>*</span></label>
                  <input value={form.razonSocial} onChange={e => { set('razonSocial',e.target.value); limpiarError('razonSocial'); }}
                    placeholder="Ej: Banco Nación Argentina S.A." className={errores.razonSocial?'error':''}/>
                  {errores.razonSocial && <span className="ae-error">{errores.razonSocial}</span>}
                </div>
                <div className="ae-campo">
                  <label>Nombre comercial <span>*</span></label>
                  <input value={form.nombreComercial} onChange={e => { set('nombreComercial',e.target.value); limpiarError('nombreComercial'); }}
                    placeholder="Ej: Banco Nación" className={errores.nombreComercial?'error':''}/>
                  {errores.nombreComercial && <span className="ae-error">{errores.nombreComercial}</span>}
                </div>
                <div className="ae-campo">
                  <label>Tipo societario <span>*</span></label>
                  <select value={form.tipoSocietario} onChange={e => { set('tipoSocietario',e.target.value); limpiarError('tipoSocietario'); }}
                    className={errores.tipoSocietario?'error':''}>
                    <option value="">Seleccioná...</option>
                    {TIPOS_SOCIETARIOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errores.tipoSocietario && <span className="ae-error">{errores.tipoSocietario}</span>}
                </div>
                <div className="ae-campo">
                  <label>CUIT <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <Hash size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input
                      value={form.cuit}
                      onChange={e => {
                        const f = formatCUIT(e.target.value);
                        set('cuit', f);
                        limpiarError('cuit');
                        if (f.replace(/\D/g,'').length === 11) setCuitOk(validarCUIT(f));
                        else setCuitOk(null);
                      }}
                      placeholder="20-12345678-9"
                      className={errores.cuit?'error':cuitOk===true?'valid':cuitOk===false?'error':''}
                    />
                    {cuitOk === true  && <CheckCircle size={15} className="ae-input-check ok"/>}
                    {cuitOk === false && <AlertCircle size={15} className="ae-input-check fail"/>}
                  </div>
                  {errores.cuit && <span className="ae-error">{errores.cuit}</span>}
                  {cuitOk === true && <span className="ae-ok">CUIT válido ✓</span>}
                </div>
                <div className="ae-campo">
                  <label>Fecha de constitución <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <Calendar size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input type="date" value={form.fechaConstitucion}
                      onChange={e => { set('fechaConstitucion',e.target.value); limpiarError('fechaConstitucion'); }}
                      className={errores.fechaConstitucion?'error':''}/>
                  </div>
                  {errores.fechaConstitucion && <span className="ae-error">{errores.fechaConstitucion}</span>}
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Ubicación</h3>
              <div className="ae-grid-3">
                <div className="ae-campo">
                  <label>País</label>
                  <select value={form.pais} onChange={e => set('pais',e.target.value)}>
                    {['Argentina','Uruguay','Chile','Brasil','México','España','Colombia','Otro'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="ae-campo">
                  <label>Provincia / Estado <span>*</span></label>
                  <input value={form.provincia} onChange={e => { set('provincia',e.target.value); limpiarError('provincia'); }}
                    placeholder="Ej: Mendoza" className={errores.provincia?'error':''}/>
                  {errores.provincia && <span className="ae-error">{errores.provincia}</span>}
                </div>
                <div className="ae-campo">
                  <label>Ciudad <span>*</span></label>
                  <input value={form.ciudad} onChange={e => { set('ciudad',e.target.value); limpiarError('ciudad'); }}
                    placeholder="Ej: Buenos Aires" className={errores.ciudad?'error':''}/>
                  {errores.ciudad && <span className="ae-error">{errores.ciudad}</span>}
                </div>
              </div>
              <div className="ae-campo ae-campo--full">
                <label>Domicilio legal <span>*</span></label>
                <div className="ae-input-icon-wrap">
                  <MapPin size={14} strokeWidth={1.8} className="ae-input-icon"/>
                  <input value={form.domicilioLegal} onChange={e => { set('domicilioLegal',e.target.value); limpiarError('domicilioLegal'); }}
                    placeholder="Calle, número, piso, depto" className={errores.domicilioLegal?'error':''}/>
                </div>
                {errores.domicilioLegal && <span className="ae-error">{errores.domicilioLegal}</span>}
              </div>
              <div className="ae-campo">
                <label>Teléfono de contacto</label>
                <div className="ae-input-icon-wrap">
                  <Phone size={14} strokeWidth={1.8} className="ae-input-icon"/>
                  <input value={form.telefonoContacto} onChange={e => set('telefonoContacto',e.target.value)}
                    placeholder="+54 261 xxx-xxxx"/>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Encargado de cuenta</h3>
              <p className="ae-seccion__desc">Persona responsable ante Life's — quien recibe comunicaciones y responde por la empresa</p>
              <div className="ae-grid-3">
                <div className="ae-campo">
                  <label>Nombre completo <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <User size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input value={form.encargadoCuenta} onChange={e => { set('encargadoCuenta',e.target.value); limpiarError('encargadoCuenta'); }}
                      placeholder="Juan Pérez" className={errores.encargadoCuenta?'error':''}/>
                  </div>
                  {errores.encargadoCuenta && <span className="ae-error">{errores.encargadoCuenta}</span>}
                </div>
                <div className="ae-campo">
                  <label>Celular</label>
                  <div className="ae-input-icon-wrap">
                    <Phone size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input value={form.encargadoCelular} onChange={e => set('encargadoCelular',e.target.value)}
                      placeholder="+54 9 261 xxx-xxxx"/>
                  </div>
                </div>
                <div className="ae-campo">
                  <label>Email <span>*</span></label>
                  <div className="ae-input-icon-wrap">
                    <Mail size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input type="email" value={form.encargadoEmail} onChange={e => { set('encargadoEmail',e.target.value); limpiarError('encargadoEmail'); }}
                      placeholder="juan@empresa.com" className={errores.encargadoEmail?'error':''}/>
                  </div>
                  {errores.encargadoEmail && <span className="ae-error">{errores.encargadoEmail}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ PASO 2 — Socios / Propietarios ══ */}
        {paso === 2 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <Users size={20} strokeWidth={1.6}/>
              <div>
                <h2>Propietarios y socios</h2>
                <p>Personas que componen la sociedad o son dueñas de la organización</p>
              </div>
            </div>

            {errores.socios && (
              <div className="ae-alerta-error">
                <AlertCircle size={15} strokeWidth={2}/>
                {errores.socios}
              </div>
            )}

            {form.socios.map((socio, idx) => (
              <div key={socio.id} className="ae-socio-card">
                <div className="ae-socio-card__header">
                  <span className="ae-socio-card__num">Socio {idx + 1}</span>
                  {socio.esRepresentante && (
                    <span className="ae-socio-card__rep-badge">
                      <Crown size={11} strokeWidth={2}/> Representante legal
                    </span>
                  )}
                  <button className="ae-socio-card__del" onClick={() => eliminarSocio(socio.id)}>
                    <Trash2 size={14} strokeWidth={1.8}/>
                  </button>
                </div>
                <div className="ae-grid-2">
                  <div className="ae-campo">
                    <label>Nombre completo</label>
                    <input value={socio.nombre} onChange={e => actualizarSocio(socio.id,'nombre',e.target.value)}
                      placeholder="Nombre y apellido"/>
                  </div>
                  <div className="ae-campo">
                    <label>DNI / CUIT</label>
                    <input value={socio.dniCuit} onChange={e => actualizarSocio(socio.id,'dniCuit',e.target.value)}
                      placeholder="DNI o CUIT"/>
                  </div>
                  <div className="ae-campo">
                    <label>% de participación</label>
                    <div className="ae-input-icon-wrap">
                      <Percent size={14} strokeWidth={1.8} className="ae-input-icon"/>
                      <input type="number" min="0" max="100" value={socio.participacion}
                        onChange={e => actualizarSocio(socio.id,'participacion',e.target.value)}
                        placeholder="Ej: 50"/>
                    </div>
                  </div>
                  <div className="ae-campo">
                    <label>Email</label>
                    <input type="email" value={socio.email}
                      onChange={e => actualizarSocio(socio.id,'email',e.target.value)}
                      placeholder="socio@empresa.com"/>
                  </div>
                  <div className="ae-campo">
                    <label>Teléfono</label>
                    <input value={socio.telefono} onChange={e => actualizarSocio(socio.id,'telefono',e.target.value)}
                      placeholder="+54 9 xxx xxx-xxxx"/>
                  </div>
                  <div className="ae-campo ae-campo--center">
                    <label>Representante legal</label>
                    <div
                      className={`ae-toggle-rep${socio.esRepresentante?' active':''}`}
                      onClick={() => setRepresentante(socio.id)}
                    >
                      <div className="ae-toggle-rep__thumb"/>
                      <span>{socio.esRepresentante ? 'Sí, es el representante' : 'No es representante'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button className="ae-btn-agregar-socio" onClick={agregarSocio}>
              <Plus size={16} strokeWidth={2}/>
              {form.socios.length === 0 ? 'Agregar primer propietario' : 'Agregar otro socio'}
            </button>

            {form.socios.length > 0 && (
              <div className="ae-socios-resumen">
                <div className="ae-socios-resumen__total">
                  Total participación: {' '}
                  <strong>{form.socios.reduce((a,s) => a + (parseFloat(s.participacion)||0), 0)}%</strong>
                  {form.socios.reduce((a,s) => a + (parseFloat(s.participacion)||0), 0) !== 100 && (
                    <span className="ae-socios-resumen__warn"> · Debe sumar 100%</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PASO 3 — El negocio ══ */}
        {paso === 3 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <Briefcase size={20} strokeWidth={1.6}/>
              <div>
                <h2>El negocio</h2>
                <p>Información sobre la actividad y presencia de la organización</p>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Actividad</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>Rubro principal <span>*</span></label>
                  <select value={form.rubro} onChange={e => { set('rubro',e.target.value); limpiarError('rubro'); }}
                    className={errores.rubro?'error':''}>
                    <option value="">Seleccioná...</option>
                    {RUBROS.map(r => <option key={r}>{r}</option>)}
                  </select>
                  {errores.rubro && <span className="ae-error">{errores.rubro}</span>}
                </div>
                <div className="ae-campo">
                  <label>Sub-rubro</label>
                  <input value={form.subRubro} onChange={e => set('subRubro',e.target.value)}
                    placeholder="Ej: Banco minorista, Clínica pediátrica..."/>
                </div>
                <div className="ae-campo">
                  <label>Cantidad de empleados <span>*</span></label>
                  <div className="ae-opciones-empleados">
                    {EMPLEADOS.map(e => (
                      <button key={e}
                        className={`ae-opcion-empleados${form.cantidadEmpleados===e?' active':''}`}
                        onClick={() => { set('cantidadEmpleados',e); limpiarError('cantidadEmpleados'); }}
                      >{e}</button>
                    ))}
                  </div>
                  {errores.cantidadEmpleados && <span className="ae-error">{errores.cantidadEmpleados}</span>}
                </div>
                <div className="ae-campo">
                  <label>Año de fundación</label>
                  <div className="ae-input-icon-wrap">
                    <Calendar size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input type="number" min="1800" max="2026" value={form.añoFundacion}
                      onChange={e => set('añoFundacion',e.target.value)} placeholder="Ej: 1891"/>
                  </div>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Presencia digital</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>Sitio web</label>
                  <div className="ae-input-icon-wrap">
                    <Globe size={14} strokeWidth={1.8} className="ae-input-icon"/>
                    <input value={form.web} onChange={e => set('web',e.target.value)} placeholder="www.empresa.com"/>
                  </div>
                </div>
                <div className="ae-campo">
                  <label>Instagram</label>
                  <input value={form.instagram} onChange={e => set('instagram',e.target.value)} placeholder="@empresa"/>
                </div>
                <div className="ae-campo">
                  <label>LinkedIn</label>
                  <input value={form.linkedin} onChange={e => set('linkedin',e.target.value)} placeholder="empresa-srl"/>
                </div>
                <div className="ae-campo">
                  <label>Twitter / X</label>
                  <input value={form.twitter} onChange={e => set('twitter',e.target.value)} placeholder="@empresa"/>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Descripción institucional</h3>
              <div className="ae-campo ae-campo--full">
                <label>Descripción de la empresa <span>*</span></label>
                <textarea rows={4} value={form.descripcion}
                  onChange={e => { set('descripcion',e.target.value); limpiarError('descripcion'); }}
                  placeholder="Contá quiénes son, qué hacen y cuál es su historia..."
                  className={errores.descripcion?'error':''}/>
                <span className="ae-campo__count">{form.descripcion.length}/500</span>
                {errores.descripcion && <span className="ae-error">{errores.descripcion}</span>}
              </div>
              <div className="ae-campo ae-campo--full">
                <label>Misión</label>
                <textarea rows={3} value={form.mision}
                  onChange={e => set('mision',e.target.value)}
                  placeholder="¿Cuál es el propósito central de la organización?"/>
              </div>
            </div>
          </div>
        )}

        {/* ══ PASO 4 — Plan Life's ══ */}
        {paso === 4 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <Settings size={20} strokeWidth={1.6}/>
              <div>
                <h2>Configuración Life's</h2>
                <p>Plan, asignaciones internas y estado de la cuenta</p>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Plan contratado</h3>
              <div className="ae-planes-grid">
                {PLANES.map(p => (
                  <button
                    key={p.id}
                    className={`ae-plan-card${form.plan===p.id?' active':''}${p.destacado?' destacado':''}`}
                    onClick={() => set('plan',p.id)}
                  >
                    {p.destacado && <span className="ae-plan-card__badge">Más elegido</span>}
                    <span className="ae-plan-card__nombre">{p.label}</span>
                    <span className="ae-plan-card__precio">{p.precio}</span>
                    <span className="ae-plan-card__desc">{p.desc}</span>
                    {form.plan === p.id && <Check size={16} strokeWidth={2.5} className="ae-plan-card__check"/>}
                  </button>
                ))}
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Storage adicional</h3>
              <div className="ae-grid-2">
                <div className="ae-campo">
                  <label>GB adicionales comprados</label>
                  <div className="ae-input-icon-wrap">
                    <input type="number" min="0" value={form.storageExtra}
                      onChange={e => set('storageExtra',e.target.value)} placeholder="0"/>
                    <span style={{position:'absolute',right:'12px',fontSize:'0.72rem',color:'rgba(255,255,255,0.3)'}}>GB</span>
                  </div>
                  <span className="ae-campo__hint">0 = sin storage adicional · Activación automática vía n8n en producción</span>
                </div>
                <div className="ae-campo">
                  <label>Nivel de verificación</label>
                  <div className="ae-opciones-nivel">
                    {[
                      { val:'1', label:'Nivel 1', desc:'Automática · 48hs' },
                      { val:'2', label:'Nivel 2', desc:'Requiere reunión' },
                    ].map(n => (
                      <button key={n.val}
                        className={`ae-opcion-nivel${form.nivelVerificacion===n.val?' active':''}`}
                        onClick={() => set('nivelVerificacion',n.val)}
                      >
                        <strong>{n.label}</strong>
                        <span>{n.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Equipo asignado</h3>
              <div className="ae-grid-3">
                <div className="ae-campo">
                  <label>Ejecutivo de cuenta</label>
                  <select value={form.ejecutivoAsignado} onChange={e => set('ejecutivoAsignado',e.target.value)}>
                    {EJECUTIVOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="ae-campo">
                  <label>Facilitador de admisión</label>
                  <select value={form.facilitadorAsignado} onChange={e => set('facilitadorAsignado',e.target.value)}>
                    {FACILITADORES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="ae-campo">
                  <label>Estado inicial</label>
                  <select value={form.estado} onChange={e => set('estado',e.target.value)}>
                    {ESTADOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Notas internas</h3>
              <div className="ae-campo ae-campo--full">
                <label>Notas del equipo Life's</label>
                <textarea rows={3} value={form.notasInternas}
                  onChange={e => set('notasInternas',e.target.value)}
                  placeholder="Notas internas sobre esta empresa — no visibles para el cliente..."/>
                <span className="ae-campo__hint">Solo visible para el equipo interno de Life's</span>
              </div>
            </div>
          </div>
        )}

        {/* ══ PASO 5 — Documentación ══ */}
        {paso === 5 && (
          <div className="ae-paso">
            <div className="ae-paso__titulo">
              <FileText size={20} strokeWidth={1.6}/>
              <div>
                <h2>Documentación requerida</h2>
                <p>Indicá a dónde enviamos las instrucciones y qué documentos se necesitan</p>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Email para documentación</h3>
              <div className="ae-campo">
                <label>Email del ejecutivo asignado <span>*</span></label>
                <div className="ae-input-icon-wrap">
                  <Mail size={14} strokeWidth={1.8} className="ae-input-icon"/>
                  <input type="email" value={form.emailDocumentacion}
                    onChange={e => { set('emailDocumentacion',e.target.value); limpiarError('emailDocumentacion'); }}
                    placeholder="ejecutivo@lifes.com"
                    className={errores.emailDocumentacion?'error':''}/>
                </div>
                {errores.emailDocumentacion && <span className="ae-error">{errores.emailDocumentacion}</span>}
                <span className="ae-campo__hint">La empresa recibirá instrucciones para enviar la documentación a este email</span>
              </div>
            </div>

            <div className="ae-seccion">
              <h3 className="ae-seccion__titulo">Documentos requeridos</h3>
              <p className="ae-seccion__desc">Seleccioná cuáles son necesarios para esta empresa en particular</p>
              <div className="ae-docs-lista">
                {[...DOCS_REQUERIDOS, 'Certificado de vigencia', 'Balance último ejercicio', 'Documentación adicional'].map(doc => (
                  <div key={doc} className="ae-doc-item">
                    <button
                      className={`ae-doc-item__check${form.docsRequeridos.includes(doc)?' active':''}`}
                      onClick={() => {
                        set('docsRequeridos',
                          form.docsRequeridos.includes(doc)
                            ? form.docsRequeridos.filter(d => d !== doc)
                            : [...form.docsRequeridos, doc]
                        );
                      }}
                    >
                      {form.docsRequeridos.includes(doc) && <Check size={11} strokeWidth={2.5}/>}
                    </button>
                    <span>{doc}</span>
                    {DOCS_REQUERIDOS.includes(doc) && <span className="ae-doc-item__req">Requerido</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen final */}
            <div className="ae-resumen">
              <h3>Resumen del alta</h3>
              <div className="ae-resumen__grid">
                <div className="ae-resumen__item">
                  <span>Empresa</span>
                  <strong>{form.nombreComercial || '—'}</strong>
                </div>
                <div className="ae-resumen__item">
                  <span>Tipo</span>
                  <strong>{form.tipoSocietario || '—'}</strong>
                </div>
                <div className="ae-resumen__item">
                  <span>CUIT</span>
                  <strong>{form.cuit || '—'}</strong>
                </div>
                <div className="ae-resumen__item">
                  <span>Socios</span>
                  <strong>{form.socios.length}</strong>
                </div>
                <div className="ae-resumen__item">
                  <span>Rubro</span>
                  <strong>{form.rubro || '—'}</strong>
                </div>
                <div className="ae-resumen__item">
                  <span>Plan</span>
                  <strong>{PLANES.find(p=>p.id===form.plan)?.label}</strong>
                </div>
                <div className="ae-resumen__item">
                  <span>Verificación</span>
                  <strong>Nivel {form.nivelVerificacion}</strong>
                </div>
                <div className="ae-resumen__item">
                  <span>Ejecutivo</span>
                  <strong>{form.ejecutivoAsignado}</strong>
                </div>
                <div className="ae-resumen__item">
                  <span>Estado</span>
                  <strong>{form.estado}</strong>
                </div>
                <div className="ae-resumen__item">
                  <span>Docs requeridos</span>
                  <strong>{form.docsRequeridos.length}</strong>
                </div>
              </div>
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
                ? <><Check size={16} strokeWidth={2}/> ¡Empresa registrada!</>
                : <><Check size={16} strokeWidth={2}/> Confirmar alta</>
              }
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
