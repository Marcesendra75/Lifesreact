// ============================================
// LIFE'S — Línea de Vida
// ✅ Modal edición con foto/video + file inputs reales + localStorage
// ============================================
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Calendar,
  Group, MapPin, Edit3, Edit2, Share2, Bell, Mail, X, Check,
  Camera, Mic, Paperclip, Video, UserPlus, Lock, Settings2,
  Hourglass, GitBranch, Users, Send, Save, Tag, Layers,
  Image, CheckCircle, Megaphone, ChevronRight as ChevronRightSm,
  SlidersHorizontal, Plus,
} from 'lucide-react';
import './Timeline.scss';

interface Memory {
  id: number; title: string; date: string; year: number;
  place?: string; category: string; emotion: string;
  desc: string; img?: string; tagged: string[];
}

type Category =
  | 'Biografía' | 'Viaje' | 'Hito' | 'Logro'
  | 'Familia' | 'Amor' | 'Educación' | 'Trabajo' | 'Hermanos/as';

const CAT_COLORS: Record<string, string> = {
  Biografía:'#03192e', Logro:'#735c00', Amor:'#ba1a1a', Viaje:'#855324',
  Hito:'#1a2e44', Familia:'#4a7a4e', Educación:'#3a5a8a', Trabajo:'#5a3a7a', 'Hermanos/as':'#2a7a6a',
};

const CAT_LUCIDE: Record<string, React.ReactNode> = {
  Biografía:<BookOpen size={18} strokeWidth={1.8}/>, Viaje:<MapPin size={18} strokeWidth={1.8}/>,
  Hito:<CheckCircle size={18} strokeWidth={1.8}/>, Logro:<Check size={18} strokeWidth={1.8}/>,
  Familia:<Users size={18} strokeWidth={1.8}/>, Amor:<span style={{fontSize:'16px'}}>❤️</span>,
  Educación:<BookOpen size={18} strokeWidth={1.8}/>, Trabajo:<Layers size={18} strokeWidth={1.8}/>,
  'Hermanos/as':<UserPlus size={18} strokeWidth={1.8}/>,
};

const EMOCIONES = [
  {emoji:'😊',label:'Feliz'},{emoji:'😢',label:'Nostálgico'},{emoji:'❤️',label:'Amor'},
  {emoji:'🎉',label:'Logro'},{emoji:'✨',label:'Mágico'},{emoji:'🌊',label:'Paz'},{emoji:'💪',label:'Orgullo'},
];

const CATEGORIAS: Category[] = [
  'Biografía','Viaje','Hito','Logro','Familia','Amor','Educación','Trabajo','Hermanos/as'
];

const CONTACTOS = [
  {nombre:'Elena',avatar:'https://i.pravatar.cc/40?img=25'},
  {nombre:'Ricardo',avatar:'https://i.pravatar.cc/40?img=60'},
  {nombre:'Valentina',avatar:'https://i.pravatar.cc/40?img=20'},
  {nombre:'Lucía',avatar:'https://i.pravatar.cc/40?img=45'},
  {nombre:'Martín',avatar:'https://i.pravatar.cc/40?img=33'},
];

const INITIAL_MEMORIES: Memory[] = [
  {id:1,title:'Primeros pasos',date:'1993-06-20',year:1993,place:'Buenos Aires',category:'Biografía',emotion:'😊',desc:'El primer paso que cambió todo. Mi madre me lo contó cientos de veces, con esa mezcla de ternura y sorpresa que solo existe en los comienzos.',img:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',tagged:['Elena','Ricardo']},
  {id:2,title:'Graduación universitaria',date:'2013-12-15',year:2013,place:'Córdoba',category:'Logro',emotion:'🎉',desc:'Cinco años de esfuerzo resumidos en un diploma y un abrazo eterno de mi padre.',img:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',tagged:['Valentina','Martín']},
  {id:3,title:'Día del casamiento',date:'2020-02-08',year:2020,place:'Mendoza',category:'Amor',emotion:'❤️',desc:'La luz de la tarde filtrándose entre los viñedos. Elena caminando hacia mí.',img:'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80',tagged:['Elena']},
  {id:4,title:'Viaje a París bajo la lluvia',date:'2023-09-29',year:2023,place:'París, Francia',category:'Viaje',emotion:'🌊',desc:'Los adoquines brillaban bajo las farolas. La lluvia en París no es un inconveniente.',img:'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80',tagged:[]},
  {id:5,title:'Mañana en el lago de Ginebra',date:'2023-10-24',year:2023,place:'Ginebra, Suiza',category:'Viaje',emotion:'✨',desc:'La niebla flotaba sobre el agua. Por unos instantes fui la única alma despierta en el mundo.',img:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80',tagged:['Lucía']},
  {id:6,title:'Amanecer en los Andes',date:'2024-03-15',year:2024,place:'Mendoza, Argentina',category:'Hito',emotion:'💪',desc:'Subimos al mirador antes del amanecer. Las montañas se tiñeron de naranja y violeta.',img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',tagged:['Elena','Ricardo','Valentina']},
];

interface Grupo { id:string; nombre:string; emoji:string; miembros:string[]; }

const GRUPOS_INICIALES: Grupo[] = [
  {id:'g1',nombre:'Familia',emoji:'👨‍👩‍👧‍👦',miembros:['Elena','Lucía','Martín']},
  {id:'g2',nombre:'Viaje a París 2023',emoji:'✈️',miembros:['Ricardo','Valentina']},
  {id:'g3',nombre:'Amigos del alma',emoji:'🤝',miembros:['Ricardo','Martín','Lucía']},
  {id:'g4',nombre:'Compañeros deporte',emoji:'⚽',miembros:['Martín','Ricardo']},
];

interface WaveNode { mem:Memory; x:number; y:number; isAbove:boolean; }

const STORAGE_KEY = 'lifes_memories';
function cargarMemories(): Memory[] {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : INITIAL_MEMORIES; }
  catch { return INITIAL_MEMORIES; }
}
function guardarMemories(m: Memory[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch {}
}

export default function Timeline() {
  const navigate = useNavigate();

  const [memories, setMemories]         = useState<Memory[]>(INITIAL_MEMORIES);
  const [yearFilter, setYearFilter]     = useState('all');
  const [modalMem, setModalMem]         = useState<Memory | null>(null);
  const [notifyOpen, setNotifyOpen]     = useState(false);
  const [notifyContacts, setNotifyContacts] = useState<string[]>([]);
  const [toast, setToast]               = useState('');
  const [waveNodes, setWaveNodes]       = useState<WaveNode[]>([]);
  const [svgPath, setSvgPath]           = useState('');
  const [svgDims, setSvgDims]           = useState({w:800,h:240});
  const [formActivo, setFormActivo]     = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mailPreviewOpen, setMailPreviewOpen] = useState(false);
  const [mailPreviewData, setMailPreviewData] = useState<{titulo:string;desc:string;emotion:string;tagged:string[]}|null>(null);

  // ── Estados modal edición ──
  const [editOpen, setEditOpen]           = useState(false);
  const [editId, setEditId]               = useState<number|null>(null);
  const [editTitle, setEditTitle]         = useState('');
  const [editDate, setEditDate]           = useState('');
  const [editPlace, setEditPlace]         = useState('');
  const [editDesc, setEditDesc]           = useState('');
  const [editEmotion, setEditEmotion]     = useState('😊');
  const [editCat, setEditCat]             = useState<Category>('Biografía');
  const [editImg, setEditImg]             = useState('');       // ✅ foto/video en edición
  const [editImgNombre, setEditImgNombre] = useState('');       // ✅ nombre del archivo

  // ── Estado media del formulario nuevo ──
  const [fMediaPreview, setFMediaPreview] = useState<string|null>(null);
  const [fMediaNombre, setFMediaNombre]   = useState<string>('');
  const [fDocNombre, setFDocNombre]       = useState<string>('');

  // Formulario nuevo
  const [fTitle, setFTitle]               = useState('');
  const [fDate, setFDate]                 = useState(new Date().toISOString().substring(0,10));
  const [fTime, setFTime]                 = useState('');
  const [fPlace, setFPlace]               = useState('');
  const [fDesc, setFDesc]                 = useState('');
  const [fEmotion, setFEmotion]           = useState('😊');
  const [fCat, setFCat]                   = useState<Category>('Biografía');
  const [fTagged, setFTagged]             = useState<string[]>([]);
  const [fPrivMuro, setFPrivMuro]         = useState(false);
  const [fPrivLinea, setFPrivLinea]       = useState(true);
  const [fPrivCaja, setFPrivCaja]         = useState(false);
  const [fCapsula, setFCapsula]           = useState(false);
  const [fCapsulaDate, setFCapsulaDate]   = useState('');
  const [fColaborativo, setFColaborativo] = useState(false);
  const [fGrupo, setFGrupo]               = useState('');
  const [grupos]                           = useState<Grupo[]>(GRUPOS_INICIALES);

  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const formRef    = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollLeft = useRef(0);

  // ── refs file inputs formulario nuevo ──
  const inputFotoRef  = useRef<HTMLInputElement>(null);
  const inputVideoRef = useRef<HTMLInputElement>(null);
  const inputDocRef   = useRef<HTMLInputElement>(null);

  // ── refs file inputs modal EDICIÓN ──
  const inputEditFotoRef  = useRef<HTMLInputElement>(null);  // ✅
  const inputEditVideoRef = useRef<HTMLInputElement>(null);  // ✅

  useEffect(() => { setMemories(cargarMemories()); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(''),3000); };

  // ── Abrir modal edición ──
  const abrirEdicion = (mem: Memory) => {
    setEditId(mem.id);
    setEditTitle(mem.title);
    setEditDate(mem.date);
    setEditPlace(mem.place || '');
    setEditDesc(mem.desc);
    setEditEmotion(mem.emotion);
    setEditCat(mem.category as Category);
    setEditImg(mem.img || '');       // ✅ precargar imagen actual
    setEditImgNombre('');
    setEditOpen(true);
  };

  // ── Guardar edición ──
  const guardarEdicion = () => {
    if (!editTitle.trim()) { showToast('⚠️ El título no puede estar vacío'); return; }
    const nuevas = memories.map(m => m.id === editId ? {
      ...m,
      title: editTitle.trim(),
      date: editDate,
      year: parseInt(editDate.substring(0,4)),
      place: editPlace.trim() || undefined,
      desc: editDesc.trim() || '—',
      emotion: editEmotion,
      category: editCat,
      img: editImg || m.img,         // ✅ guardar nueva imagen si se cambió
    } : m);
    setMemories(nuevas);
    guardarMemories(nuevas);
    const actualizado = nuevas.find(m => m.id === editId);
    if (actualizado) setModalMem(actualizado);
    setEditOpen(false);
    showToast('✓ Recuerdo actualizado');
  };

  // ── Handlers media — formulario NUEVO ──
  const onFotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFMediaPreview(URL.createObjectURL(file));
    setFMediaNombre(file.name);
    showToast(`📷 Foto: ${file.name}`);
  };
  const onVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFMediaPreview(URL.createObjectURL(file));
    setFMediaNombre(file.name);
    showToast(`🎥 Video: ${file.name}`);
  };
  const onDocSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFDocNombre(file.name);
    showToast(`📎 Documento: ${file.name}`);
  };

  // ── Handlers media — modal EDICIÓN ──
  const onEditFotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {  // ✅
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImg(URL.createObjectURL(file));
    setEditImgNombre(file.name);
    showToast('📷 Foto actualizada');
  };
  const onEditVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {  // ✅
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImg(URL.createObjectURL(file));
    setEditImgNombre(file.name);
    showToast('🎥 Video actualizado');
  };

  const activarFormulario = () => {
    setFormActivo(true);
    setTimeout(() => formRef.current?.scrollIntoView({behavior:'smooth',block:'start'}), 80);
  };

  const cancelarFormulario = () => {
    setFormActivo(false);
    setFTitle(''); setFDesc(''); setFPlace(''); setFMediaPreview(null);
    setFMediaNombre(''); setFDocNombre('');
    setFTagged([]); setFCat('Biografía'); setFEmotion('😊'); setFGrupo('');
    setFPrivMuro(false); setFPrivLinea(true); setFPrivCaja(false);
    setFCapsula(false); setFCapsulaDate(''); setFColaborativo(false);
  };

  const buildWave = useCallback(() => {
    if (!sectionRef.current) return;
    const H = sectionRef.current.clientHeight || 240;
    const W = Math.max(sectionRef.current.clientWidth, 400);
    const filtered = yearFilter==='all' ? memories : memories.filter(m=>m.year===parseInt(yearFilter));
    const sorted = [...filtered].sort((a,b)=>a.date.localeCompare(b.date));
    const count=sorted.length, padX=80, nodeW=110;
    const totalW=Math.max(padX*2+count*nodeW,W+100);
    const waveY=H*0.52, amp=H*0.13;
    let path='';
    for(let x=0;x<=totalW;x+=3){
      const y=waveY+amp*Math.sin((x/totalW)*Math.PI*(count+1));
      path+=x===0?`M 0 ${y}`:`L ${x} ${y}`;
    }
    const nodeXs=sorted.map((_,i)=>count<=1?totalW/2:padX+i*(totalW-padX*2)/(count-1));
    const nodes:WaveNode[]=sorted.map((mem,i)=>{
      const x=nodeXs[i], y=waveY+amp*Math.sin((x/totalW)*Math.PI*(count+1));
      return {mem,x,y,isAbove:i%2===0};
    });
    setSvgDims({w:totalW,h:H}); setSvgPath(path); setWaveNodes(nodes);
  },[memories,yearFilter]);

  useEffect(()=>{
    buildWave();
    const ro=new ResizeObserver(buildWave);
    if(sectionRef.current) ro.observe(sectionRef.current);
    return ()=>ro.disconnect();
  },[buildWave]);

  const onMouseDown=(e:React.MouseEvent)=>{
    if((e.target as HTMLElement).closest('.wave-node-el')) return;
    isDragging.current=true;
    startX.current=e.pageX-(scrollRef.current?.offsetLeft||0);
    scrollLeft.current=scrollRef.current?.scrollLeft||0;
  };
  const onMouseMove=(e:React.MouseEvent)=>{
    if(!isDragging.current||!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft=scrollLeft.current-(e.pageX-(scrollRef.current.offsetLeft||0)-startX.current);
  };
  const onMouseUp=()=>{isDragging.current=false;};

  const publishMemory=()=>{
    if(!fTitle.trim()){showToast('⚠️ El título es obligatorio');return;}
    if(!fDate){showToast('⚠️ La fecha es obligatoria');return;}
    const newId=Math.max(...memories.map(m=>m.id))+1;
    const newMem:Memory={
      id:newId, title:fTitle.trim(), date:fDate,
      year:parseInt(fDate.substring(0,4)),
      place:fPlace.trim()||undefined,
      category:fCat, emotion:fEmotion,
      desc:fDesc.trim()||'—',
      img:fMediaPreview||undefined,
      tagged:fTagged,
    };
    const nuevas=[...memories,newMem];
    setMemories(nuevas);
    guardarMemories(nuevas);
    const grupoSel=grupos.find(g=>g.id===fGrupo);
    const dest=fGrupo&&grupoSel?[...new Set([...fTagged,...grupoSel.miembros])]:fTagged;
    if(dest.length>0){
      setMailPreviewData({titulo:fTitle.trim(),desc:fDesc.trim()||'—',emotion:fEmotion,tagged:dest});
      setTimeout(()=>setMailPreviewOpen(true),600);
    } else {
      showToast('✓ Recuerdo publicado en tu Línea de Vida');
    }
    cancelarFormulario();
    setTimeout(()=>scrollRef.current?.scrollTo({left:scrollRef.current.scrollWidth,behavior:'smooth'}),500);
  };

  const years=[...new Set(memories.map(m=>m.year))].sort((a,b)=>b-a);
  const advancedCount=[fPrivMuro,fPrivCaja,fCapsula,fColaborativo].filter(Boolean).length;

  return (
    <div className="tl-root with-navbar">

      <header className="tl-header">
        <div className="tl-header__left">
          <button className="tl-header__back" onClick={()=>navigate('/feed')}><ArrowLeft size={20} strokeWidth={1.8}/></button>
          <div>
            <h1 className="tl-header__title">Línea de Vida</h1>
            <p className="tl-header__sub">Mi Journey · {memories.length} momentos</p>
          </div>
        </div>
        <div className="tl-header__right">
          <select className="tl-year-filter" value={yearFilter} onChange={e=>setYearFilter(e.target.value)}>
            <option value="all">Todos</option>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <div className="tl-header__avatar"><img src="https://i.pravatar.cc/32?img=11" alt=""/></div>
        </div>
      </header>

      <div className="tl-wave-section" ref={sectionRef}>
        <div className="tl-wave-section__texture"/>
        <div className="tl-wave-title">Mi linea de vida</div>
        <button className="tl-arrow tl-arrow--left" onClick={()=>scrollRef.current?.scrollBy({left:-280,behavior:'smooth'})}><ChevronLeft size={22} strokeWidth={1.8}/></button>
        <div className="tl-scroll" ref={scrollRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
          <div className="tl-svg-wrap" style={{width:svgDims.w,height:svgDims.h}}>
            <svg width={svgDims.w} height={svgDims.h} style={{position:'absolute',top:0,left:0,overflow:'visible',zIndex:2}}>
              <path d={svgPath} fill="none" stroke="rgba(133,83,36,0.12)" strokeWidth="8" strokeLinecap="round"/>
              <path d={svgPath} fill="none" stroke="rgba(133,83,36,0.45)" strokeWidth="2.5" strokeLinecap="round" className="tl-wave-path"/>
              {waveNodes.map(node=>{
                const col=CAT_COLORS[node.mem.category]||'#855324';
                const stemY1=node.isAbove?node.y-8:node.y+8, stemY2=node.isAbove?node.y-32:node.y+32;
                return(<g key={node.mem.id}><line x1={node.x} y1={stemY1} x2={node.x} y2={stemY2} stroke="rgba(133,83,36,0.3)" strokeWidth="1.5" strokeDasharray="3 3"/><circle cx={node.x} cy={node.y} r={7} fill="white" stroke={col} strokeWidth="2.5"/><circle cx={node.x} cy={node.y} r={3.5} fill={col}/></g>);
              })}
            </svg>
            {waveNodes.map(node=>{
              const photoY=node.isAbove?node.y-88:node.y+16;
              return(
                <div key={node.mem.id} className="tl-node wave-node-el" style={{left:node.x,top:photoY}} onClick={()=>setModalMem(node.mem)}>
                  {node.isAbove?(<><div className="tl-node__photo">{node.mem.img?<img src={node.mem.img} alt={node.mem.title}/>:<span>{node.mem.title.charAt(0)}</span>}<div className="tl-node__emotion">{node.mem.emotion}</div></div><div className="tl-node__title">{node.mem.title}</div><div className="tl-node__date">{node.mem.date.substring(0,4)}</div></>)
                  :(<><div className="tl-node__date">{node.mem.date.substring(0,4)}</div><div className="tl-node__title">{node.mem.title}</div><div className="tl-node__photo">{node.mem.img?<img src={node.mem.img} alt={node.mem.title}/>:<span>{node.mem.title.charAt(0)}</span>}<div className="tl-node__emotion">{node.mem.emotion}</div></div></>)}
                </div>
              );
            })}
          </div>
        </div>
        <button className="tl-arrow tl-arrow--right" onClick={()=>scrollRef.current?.scrollBy({left:280,behavior:'smooth'})}><ChevronRight size={22} strokeWidth={1.8}/></button>
      </div>

      {/* FORMULARIO */}
      <div className="tl-form-wrap" ref={formRef}>
        <div className={`tl-form-header tl-form-header--trigger ${formActivo?'active':''}`}
          onClick={!formActivo?activarFormulario:undefined} style={{cursor:formActivo?'default':'pointer'}}>
          <div className="tl-form-header__left">
            <div className="tl-form-header__icon">{formActivo?<BookOpen size={22} strokeWidth={1.6}/>:<Plus size={22} strokeWidth={1.6}/>}</div>
            <div>
              <div className="tl-form-header__title">{formActivo?'Nuevo Recuerdo':'Agregar recuerdo'}</div>
              <div className="tl-form-header__sub">{formActivo?'Guardá un momento para la posteridad':'Tocá para comenzar'}</div>
            </div>
          </div>
          {formActivo
            ?<button className="tl-form-header__cancelar" onClick={e=>{e.stopPropagation();cancelarFormulario();}}><X size={16} strokeWidth={1.8}/>Cancelar</button>
            :<div className="tl-form-header__plus"><Plus size={20} strokeWidth={2}/></div>}
        </div>

        <div className={`tl-acordeon ${formActivo?'open':''}`}>
          <div className="tl-form-card">
            <div className="tl-form-card__title"><Calendar size={17} strokeWidth={1.8}/>Fecha y título</div>
            <div className="tl-field-row">
              <div className="tl-field"><label>Fecha *</label><input type="date" value={fDate} onChange={e=>setFDate(e.target.value)}/></div>
              <div className="tl-field"><label>Hora (opcional)</label><input type="time" value={fTime} onChange={e=>setFTime(e.target.value)}/></div>
            </div>
            <div className="tl-field">
              <label>Título *</label>
              <input type="text" value={fTitle} onChange={e=>setFTitle(e.target.value)} placeholder="Ej: Primer día en la nueva casa..." maxLength={60}/>
              <div className="tl-char-count">{fTitle.length}/60</div>
            </div>
            <div className="tl-field">
              <label>Lugar</label>
              <div className="tl-field-icon-wrap"><MapPin size={16} strokeWidth={1.8}/><input type="text" value={fPlace} onChange={e=>setFPlace(e.target.value)} placeholder="Ciudad, país..."/></div>
            </div>
          </div>
          <div className="tl-divider"/>
          <div className="tl-form-card">
            <div className="tl-form-card__title"><Edit3 size={17} strokeWidth={1.8}/>El relato</div>
            <div className="tl-field">
              <label>Descripción *</label>
              <textarea value={fDesc} onChange={e=>setFDesc(e.target.value)} rows={4} placeholder="Contá qué pasó..." maxLength={800}/>
              <div className="tl-char-count">{fDesc.length}/800</div>
            </div>
            <div className="tl-field">
              <label>¿Cómo te sentiste?</label>
              <div className="tl-emotions">
                {EMOCIONES.map(e=>(
                  <button key={e.emoji} className={`tl-emotion-btn ${fEmotion===e.emoji?'active':''}`} onClick={()=>setFEmotion(e.emoji)}>
                    <span>{e.emoji}</span>{e.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="tl-divider"/>
          <div className="tl-form-card">
            <div className="tl-form-card__title"><Tag size={17} strokeWidth={1.8}/>Categoría</div>
            <div className="tl-cats">
              {CATEGORIAS.map(cat=>(
                <button key={cat} className={`tl-cat-btn ${fCat===cat?'active':''}`} onClick={()=>setFCat(cat)} style={{'--cat-color':CAT_COLORS[cat]} as React.CSSProperties}>
                  <span className="tl-cat-btn__icon" style={{color:fCat===cat?'#ffe088':CAT_COLORS[cat]}}>{CAT_LUCIDE[cat]}</span>{cat}
                </button>
              ))}
            </div>
          </div>
          <div className="tl-divider"/>
        </div>

        <div className={`tl-form-lower ${formActivo?'':'bloqueado'}`}>
          {!formActivo&&(
            <div className="tl-form-lower__overlay" onClick={activarFormulario}>
              <div className="tl-form-lower__overlay-card"><Lock size={22} strokeWidth={1.8}/><span>Completá los datos del recuerdo primero</span></div>
            </div>
          )}
          <div className="tl-form-card">
            <div className="tl-form-card__title"><Image size={17} strokeWidth={1.8}/>Foto o video</div>
            <input ref={inputFotoRef}  type="file" accept="image/*" style={{display:'none'}} onChange={onFotoSelected}/>
            <input ref={inputVideoRef} type="file" accept="video/*" style={{display:'none'}} onChange={onVideoSelected}/>
            <input ref={inputDocRef}   type="file" accept=".pdf,.doc,.docx,.txt" style={{display:'none'}} onChange={onDocSelected}/>
            {fMediaPreview&&(
              <div className="tl-media-preview">
                {fMediaNombre.match(/\.(mp4|mov|avi|webm)$/i)
                  ?<video src={fMediaPreview} controls className="tl-media-preview__video"/>
                  :<img src={fMediaPreview} alt="preview" className="tl-media-preview__img"/>
                }
                <div className="tl-media-preview__nombre">{fMediaNombre}</div>
                <button className="tl-media-preview__quitar" onClick={()=>{setFMediaPreview(null);setFMediaNombre('');}}><X size={14} strokeWidth={2}/></button>
              </div>
            )}
            <div className="tl-upload-grid">
              <div className="tl-upload-zone" onClick={()=>formActivo&&inputFotoRef.current?.click()}><Camera size={28} strokeWidth={1.4}/><span>Subir foto</span><small>JPG, PNG, WEBP</small></div>
              <div className="tl-upload-zone" onClick={()=>formActivo&&inputVideoRef.current?.click()}><Video size={28} strokeWidth={1.4}/><span>Subir video</span><small>MP4 · max 60 seg</small></div>
            </div>
            <div className="tl-media-actions">
              <button className="tl-media-btn" onClick={()=>formActivo&&inputFotoRef.current?.click()}><Camera size={16} strokeWidth={1.8}/>Cámara</button>
              <button className="tl-media-btn" onClick={()=>formActivo&&showToast('🎙️ Grabación próximamente')}><Mic size={16} strokeWidth={1.8}/>Voz</button>
              <button className="tl-media-btn" onClick={()=>formActivo&&inputDocRef.current?.click()}><Paperclip size={16} strokeWidth={1.8}/>{fDocNombre?fDocNombre.substring(0,12)+'…':'Doc'}</button>
            </div>
          </div>
          <div className="tl-divider"/>
          <div className="tl-form-card">
            <div className="tl-form-card__title"><UserPlus size={17} strokeWidth={1.8}/>Marcar contactos<span className="tl-form-card__hint">Se les notificará</span></div>
            <p className="tl-contacts-desc">Al etiquetar personas, se les avisa que están en tu recuerdo. <strong>Si no tienen cuenta, recibirán una invitación</strong> para unirse a Life's.</p>
            <div className="tl-contacts">
              {CONTACTOS.map(c=>(
                <button key={c.nombre} className={`tl-contact-chip ${fTagged.includes(c.nombre)?'active':''}`}
                  onClick={()=>formActivo&&setFTagged(prev=>prev.includes(c.nombre)?prev.filter(n=>n!==c.nombre):[...prev,c.nombre])}>
                  <img src={c.avatar} alt={c.nombre}/>{c.nombre}
                </button>
              ))}
              <button className="tl-contact-chip tl-contact-chip--add" onClick={()=>formActivo&&showToast('➕ Invitar contacto')}><UserPlus size={14} strokeWidth={1.8}/>Invitar</button>
            </div>
            <div className="tl-contacts-notice"><Megaphone size={16} strokeWidth={1.8}/><p>Las personas etiquetadas recibirán una notificación. <strong>Si no tienen cuenta en Life's</strong>, les enviamos un correo con tu recuerdo y una invitación.</p></div>
            <div className="tl-grupos-wrap">
              <div className="tl-form-card__title" style={{marginBottom:'10px'}}><Group size={17} strokeWidth={1.8}/>Avisar a un grupo<span className="tl-form-card__hint">Opcional</span></div>
              <div className="tl-grupos">
                <button className={`tl-grupo-chip${fGrupo===''?' active':''}`} onClick={()=>formActivo&&setFGrupo('')}>Ninguno</button>
                {grupos.map(g=>(
                  <button key={g.id} className={`tl-grupo-chip${fGrupo===g.id?' active':''}`} onClick={()=>formActivo&&setFGrupo(fGrupo===g.id?'':g.id)}>
                    <span>{g.emoji}</span>{g.nombre}<span className="tl-grupo-chip__count">{g.miembros.length}</span>
                  </button>
                ))}
              </div>
              {fGrupo&&<div className="tl-grupo-preview"><Mail size={13} strokeWidth={1.8}/>Se enviará un mail a: <strong>{grupos.find(g=>g.id===fGrupo)?.miembros.join(', ')}</strong></div>}
            </div>
          </div>
          <div className="tl-divider"/>
          <div className="tl-form-card">
            <button className="tl-advanced-btn" onClick={()=>formActivo&&setAdvancedOpen(true)}>
              <div className="tl-advanced-btn__left">
                <div className="tl-advanced-btn__icon"><SlidersHorizontal size={19} strokeWidth={1.8}/></div>
                <div><div className="tl-advanced-btn__title">Opciones avanzadas</div><div className="tl-advanced-btn__sub">Privacidad, cápsula del tiempo, colaborativo y postal física</div></div>
              </div>
              <div className="tl-advanced-btn__right">
                {advancedCount>0&&<span className="tl-advanced-btn__badge">{advancedCount}</span>}
                <ChevronRightSm size={18} strokeWidth={1.8}/>
              </div>
            </button>
          </div>
          <div className="tl-divider"/>
          <div className="tl-form-card">
            <div className="tl-btn-grid">
              <button className="tl-btn-ghost" onClick={()=>formActivo&&showToast('💾 Borrador guardado')}><Save size={16} strokeWidth={1.8}/>Guardar borrador</button>
              <button className="tl-btn-primary" onClick={()=>formActivo&&publishMemory()}><BookOpen size={16} strokeWidth={1.8}/>Publicar recuerdo</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL OPCIONES AVANZADAS */}
      {advancedOpen&&(
        <div className="tl-advanced-overlay" onClick={e=>{if(e.target===e.currentTarget)setAdvancedOpen(false);}}>
          <div className="tl-advanced-modal">
            <div className="tl-advanced-modal__header">
              <div><div className="tl-advanced-modal__title"><SlidersHorizontal size={18} strokeWidth={1.8}/>Opciones avanzadas</div><div className="tl-advanced-modal__sub">Configurá privacidad, extras y envío físico</div></div>
              <button className="tl-advanced-modal__close" onClick={()=>setAdvancedOpen(false)}><X size={18} strokeWidth={1.8}/></button>
            </div>
            <div className="tl-advanced-modal__body">
              <div className="tl-form-card" style={{padding:'0 0 1rem'}}>
                <div className="tl-form-card__title"><Lock size={17} strokeWidth={1.8}/>Privacidad del recuerdo</div>
                {[
                  {label:'Publicar en mi Muro',sub:'Visible para tus seguidores aprobados',val:fPrivMuro,set:setFPrivMuro},
                  {label:'Incluir en la Línea de Vida',sub:'Aparece en tu timeline ondulado',val:fPrivLinea,set:setFPrivLinea},
                  {label:'Guardar en Caja Fuerte',sub:'Acceso solo con verificación de identidad',val:fPrivCaja,set:setFPrivCaja},
                ].map(t=>(
                  <div key={t.label} className="tl-toggle-row">
                    <div><div className="tl-toggle-row__label">{t.label}</div><div className="tl-toggle-row__sub">{t.sub}</div></div>
                    <div className={`tl-toggle ${t.val?'on':''}`} onClick={()=>t.set(!t.val)}><div className="tl-toggle__thumb"/></div>
                  </div>
                ))}
                <div className="tl-field" style={{marginTop:'0.75rem'}}>
                  <label>¿Quién puede verlo?</label>
                  <select className="tl-select"><option>Solo yo</option><option>Familia y amigos cercanos</option><option>Todos mis seguidores</option><option>Público · cualquier persona</option><option>Herederos (solo tras mi fallecimiento)</option></select>
                </div>
              </div>
              <div className="tl-divider" style={{margin:'0 -1.25rem'}}/>
              <div className="tl-form-card" style={{padding:'1rem 0 0'}}>
                <div className="tl-form-card__title"><Settings2 size={17} strokeWidth={1.8}/>Más opciones</div>
                <div className="tl-extra-option">
                  <div className="tl-extra-option__row">
                    <div className="tl-extra-option__left"><Hourglass size={20} strokeWidth={1.6} style={{color:'#735c00'}}/><div><div className="tl-extra-option__label">Cápsula del tiempo</div><div className="tl-extra-option__sub">Programá este recuerdo para que llegue en el futuro</div></div></div>
                    <div className={`tl-toggle ${fCapsula?'on':''}`} onClick={()=>setFCapsula(!fCapsula)}><div className="tl-toggle__thumb"/></div>
                  </div>
                  {fCapsula&&<div className="tl-field" style={{marginTop:'0.5rem'}}><label>Enviar en:</label><input type="date" value={fCapsulaDate} onChange={e=>setFCapsulaDate(e.target.value)}/></div>}
                </div>
                <div className="tl-extra-option">
                  <div className="tl-extra-option__row">
                    <div className="tl-extra-option__left"><GitBranch size={20} strokeWidth={1.6} style={{color:'#855324'}}/><div><div className="tl-extra-option__label">Vincular al Árbol</div><div className="tl-extra-option__sub">Aparece como rama en el árbol genealógico</div></div></div>
                    <button className="tl-extra-option__link" onClick={()=>navigate('/arbol-genealogico')}>Configurar <ChevronRightSm size={16} strokeWidth={1.8}/></button>
                  </div>
                </div>
                <div className="tl-extra-option">
                  <div className="tl-extra-option__row">
                    <div className="tl-extra-option__left"><Users size={20} strokeWidth={1.6} style={{color:'#855324'}}/><div><div className="tl-extra-option__label">Recuerdo Colaborativo</div><div className="tl-extra-option__sub">Los contactos pueden agregar sus fotos</div></div></div>
                    <div className={`tl-toggle ${fColaborativo?'on':''}`} onClick={()=>setFColaborativo(!fColaborativo)}><div className="tl-toggle__thumb"/></div>
                  </div>
                </div>
                <div className="tl-extra-option tl-extra-option--highlight">
                  <div className="tl-extra-option__row">
                    <div className="tl-extra-option__left"><Mail size={20} strokeWidth={1.6} style={{color:'#855324'}}/><div><div className="tl-extra-option__label">Enviar postal física</div><div className="tl-extra-option__sub">Imprimimos y enviamos este recuerdo por correo</div></div></div>
                    <button className="tl-extra-option__link" onClick={()=>{setAdvancedOpen(false);navigate('/postal');}}>Ver opciones <ChevronRightSm size={16} strokeWidth={1.8}/></button>
                  </div>
                </div>
              </div>
            </div>
            <div className="tl-advanced-modal__footer">
              <button className="tl-btn-primary" style={{width:'100%'}} onClick={()=>setAdvancedOpen(false)}><Check size={16} strokeWidth={1.8}/>Listo</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIBRO */}
      {modalMem&&(
        <div className="tl-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModalMem(null);}}>
          <div className="tl-modal-book">
            <div className="tl-modal-book__left">
              <div className="tl-modal-book__img-wrap">
                {modalMem.img?<img src={modalMem.img} alt={modalMem.title}/>:<div className="tl-modal-book__no-img"><span style={{color:CAT_COLORS[modalMem.category]}}>{CAT_LUCIDE[modalMem.category]}</span></div>}
                <div className="tl-modal-book__img-overlay"/>
              </div>
              <div className="tl-modal-book__img-info">
                <span className="tl-modal-book__cat-badge" style={{background:CAT_COLORS[modalMem.category]}}>{modalMem.emotion} {modalMem.category}</span>
              </div>
            </div>
            <div className="tl-modal-book__right">
              <button className="tl-modal-book__close" onClick={()=>setModalMem(null)}><X size={18} strokeWidth={1.8}/></button>
              <div className="tl-modal-book__page-num">{modalMem.year}</div>
              <h3 className="tl-modal-book__title">{modalMem.title}</h3>
              <div className="tl-modal-book__meta">
                <div className="tl-modal-book__meta-item"><Calendar size={14} strokeWidth={1.8}/>{new Date(modalMem.date+'T00:00').toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'})}</div>
                {modalMem.place&&<div className="tl-modal-book__meta-item"><MapPin size={14} strokeWidth={1.8}/>{modalMem.place}</div>}
              </div>
              <div className="tl-modal-book__desc-wrap">
                <span className="tl-modal-book__quote-mark">"</span>
                <p className="tl-modal-book__desc">{modalMem.desc}</p>
              </div>
              {modalMem.tagged.length>0&&(
                <div className="tl-modal-book__tagged">
                  <div className="tl-modal-book__tagged-label">En este recuerdo</div>
                  <div className="tl-modal-book__tagged-chips">{modalMem.tagged.map(t=><span key={t} className="tl-modal-book__tagged-chip">{t}</span>)}</div>
                </div>
              )}
              <div className="tl-modal-book__actions">
                <button className="tl-modal-book__btn-notify" onClick={()=>{setNotifyContacts(modalMem.tagged);setNotifyOpen(true);}}><Bell size={15} strokeWidth={1.8}/>Notificar personas</button>
                <button className="tl-modal-book__btn-postal" onClick={()=>{setModalMem(null);navigate('/postal');}}><Send size={15} strokeWidth={1.8}/>Enviar Recuerdo Físico</button>
              </div>
              <div className="tl-modal-book__secondary">
                <button className="tl-modal-book__btn-sec" onClick={()=>setModalMem(null)}>Cerrar</button>
                <button className="tl-modal-book__btn-sec tl-modal-book__btn-sec--primary" onClick={()=>abrirEdicion(modalMem)}>
                  <Edit2 size={13} strokeWidth={1.8}/>Editar
                </button>
                <button className="tl-modal-book__btn-icon" onClick={()=>showToast('🔗 Enlace copiado')}><Share2 size={15} strokeWidth={1.8}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL EDITAR RECUERDO ══ */}
      {editOpen&&(
        <div className="tl-edit-overlay" onClick={e=>{if(e.target===e.currentTarget)setEditOpen(false);}}>
          <div className="tl-edit-modal">
            <div className="tl-edit-modal__header">
              <div>
                <div className="tl-edit-modal__title"><Edit2 size={17} strokeWidth={1.8}/>Editar recuerdo</div>
                <div className="tl-edit-modal__sub">Corregí los datos y la imagen</div>
              </div>
              <button className="tl-edit-modal__close" onClick={()=>setEditOpen(false)}><X size={18} strokeWidth={1.8}/></button>
            </div>
            <div className="tl-edit-modal__body">

              {/* ✅ Inputs ocultos — edición foto/video */}
              <input ref={inputEditFotoRef}  type="file" accept="image/*" style={{display:'none'}} onChange={onEditFotoSelected}/>
              <input ref={inputEditVideoRef} type="file" accept="video/*" style={{display:'none'}} onChange={onEditVideoSelected}/>

              {/* ✅ Sección foto/video del recuerdo */}
              <div className="tl-edit-modal__media-wrap">
                <div className="tl-edit-modal__media-label">
                  <Camera size={14} strokeWidth={1.8}/>Foto o video del recuerdo
                </div>
                {editImg&&(
                  <div className="tl-media-preview" style={{marginBottom:'0.5rem'}}>
                    {editImgNombre.match(/\.(mp4|mov|avi|webm)$/i)||editImg.includes('blob:')&&editImgNombre.match(/\.(mp4|mov|avi|webm)$/i)
                      ?<video src={editImg} controls className="tl-media-preview__video"/>
                      :<img src={editImg} alt="preview" className="tl-media-preview__img"/>
                    }
                    {editImgNombre&&<div className="tl-media-preview__nombre">{editImgNombre}</div>}
                    <button className="tl-media-preview__quitar" onClick={()=>{setEditImg('');setEditImgNombre('');}}>
                      <X size={14} strokeWidth={2}/>
                    </button>
                  </div>
                )}
                <div className="tl-edit-modal__media-btns">
                  <button className="tl-edit-modal__media-btn" onClick={()=>inputEditFotoRef.current?.click()}>
                    <Camera size={14} strokeWidth={1.8}/>{editImg?'Cambiar foto':'Agregar foto'}
                  </button>
                  <button className="tl-edit-modal__media-btn" onClick={()=>inputEditVideoRef.current?.click()}>
                    <Camera size={14} strokeWidth={1.8}/>{editImg?'Cambiar video':'Agregar video'}
                  </button>
                </div>
              </div>

              <div className="tl-field">
                <label>Título *</label>
                <input type="text" value={editTitle} onChange={e=>setEditTitle(e.target.value)} maxLength={60}/>
                <div className="tl-char-count">{editTitle.length}/60</div>
              </div>
              <div className="tl-field">
                <label>Fecha</label>
                <input type="date" value={editDate} onChange={e=>setEditDate(e.target.value)}/>
              </div>
              <div className="tl-field">
                <label>Lugar</label>
                <div className="tl-field-icon-wrap"><MapPin size={16} strokeWidth={1.8}/><input type="text" value={editPlace} onChange={e=>setEditPlace(e.target.value)} placeholder="Ciudad, país..."/></div>
              </div>
              <div className="tl-field">
                <label>Descripción</label>
                <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={4} maxLength={800}/>
                <div className="tl-char-count">{editDesc.length}/800</div>
              </div>
              <div className="tl-field">
                <label>¿Cómo te sentiste?</label>
                <div className="tl-emotions">
                  {EMOCIONES.map(e=>(
                    <button key={e.emoji} className={`tl-emotion-btn ${editEmotion===e.emoji?'active':''}`} onClick={()=>setEditEmotion(e.emoji)}>
                      <span>{e.emoji}</span>{e.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="tl-field">
                <label>Categoría</label>
                <div className="tl-cats">
                  {CATEGORIAS.map(cat=>(
                    <button key={cat} className={`tl-cat-btn ${editCat===cat?'active':''}`} onClick={()=>setEditCat(cat)} style={{'--cat-color':CAT_COLORS[cat]} as React.CSSProperties}>
                      <span className="tl-cat-btn__icon" style={{color:editCat===cat?'#ffe088':CAT_COLORS[cat]}}>{CAT_LUCIDE[cat]}</span>{cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="tl-edit-modal__footer">
              <button className="tl-btn-ghost" onClick={()=>setEditOpen(false)}><X size={15} strokeWidth={1.8}/>Cancelar</button>
              <button className="tl-btn-primary" onClick={guardarEdicion}><Check size={15} strokeWidth={1.8}/>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* PANEL NOTIFICAR */}
      {notifyOpen&&(
        <>
          <div className="tl-overlay" onClick={()=>setNotifyOpen(false)}/>
          <div className="tl-notify-panel">
            <div className="tl-notify-panel__handle" onClick={()=>setNotifyOpen(false)}><div className="tl-notify-panel__bar"/></div>
            <div className="tl-notify-panel__header"><h3>Notificar personas</h3><button onClick={()=>setNotifyOpen(false)}><X size={18} strokeWidth={1.8}/></button></div>
            <p className="tl-notify-panel__desc">Seleccioná a quién querés notificar sobre este recuerdo.</p>
            <div className="tl-notify-contacts">
              {CONTACTOS.map(c=>(
                <div key={c.nombre} className={`tl-notify-contact ${notifyContacts.includes(c.nombre)?'active':''}`}
                  onClick={()=>setNotifyContacts(prev=>prev.includes(c.nombre)?prev.filter(n=>n!==c.nombre):[...prev,c.nombre])}>
                  <img src={c.avatar} alt={c.nombre}/><span>{c.nombre}</span>
                  {notifyContacts.includes(c.nombre)&&<CheckCircle size={18} strokeWidth={1.8} style={{color:'#C9A84C',marginLeft:'auto'}}/>}
                </div>
              ))}
            </div>
            <div className="tl-notify-panel__btns">
              <button className="tl-btn-ghost" onClick={()=>setNotifyOpen(false)}>Cancelar</button>
              <button className="tl-btn-primary" onClick={()=>{setNotifyOpen(false);showToast(`🔔 Notificación enviada a ${notifyContacts.length} persona${notifyContacts.length!==1?'s':''}`);}}><Bell size={15} strokeWidth={1.8}/>Enviar notificación</button>
            </div>
          </div>
        </>
      )}

      {/* MODAL MAIL */}
      {mailPreviewOpen&&mailPreviewData&&(
        <div className="tl-mail-overlay" onClick={()=>setMailPreviewOpen(false)}>
          <div className="tl-mail-modal" onClick={e=>e.stopPropagation()}>
            <div className="tl-mail-modal__header"><div className="tl-mail-modal__logo">Life's</div><button className="tl-mail-modal__close" onClick={()=>setMailPreviewOpen(false)}><X size={16} strokeWidth={1.8}/></button></div>
            <div className="tl-mail-modal__body">
              <div className="tl-mail-modal__enviado"><CheckCircle size={20} strokeWidth={2}/>Mail enviado con éxito</div>
              <p className="tl-mail-modal__desc-top">Las siguientes personas recibieron tu recuerdo en su correo:</p>
              <div className="tl-mail-modal__destinatarios">
                {mailPreviewData.tagged.map(t=>{const c=CONTACTOS.find(x=>x.nombre===t);return(<div key={t} className="tl-mail-modal__dest">{c&&<img src={c.avatar} alt={t}/>}<span>{t}</span></div>);})}
              </div>
              <div className="tl-mail-preview">
                <div className="tl-mail-preview__desde">De: Life's &lt;recuerdos@lifes.app&gt;</div>
                <div className="tl-mail-preview__asunto">{mailPreviewData.emotion} {mailPreviewData.tagged[0]} te compartió un recuerdo en Life's</div>
                <div className="tl-mail-preview__contenido">
                  <p className="tl-mail-preview__hola">Hola {mailPreviewData.tagged[0]},</p>
                  <p className="tl-mail-preview__texto">Alguien especial quiso compartir este momento con vos:</p>
                  <div className="tl-mail-preview__recuerdo"><div className="tl-mail-preview__recuerdo-emoji">{mailPreviewData.emotion}</div><div className="tl-mail-preview__recuerdo-titulo">{mailPreviewData.titulo}</div><div className="tl-mail-preview__recuerdo-desc">{mailPreviewData.desc}</div></div>
                  <div className="tl-mail-preview__cta"><span>Ver recuerdo completo en Life's →</span></div>
                  <p className="tl-mail-preview__footer">¿Todavía no tenés cuenta en Life's? <strong>Unite gratis</strong> y preservá tus propios recuerdos para siempre.</p>
                </div>
              </div>
            </div>
            <button className="tl-mail-modal__btn" onClick={()=>setMailPreviewOpen(false)}>¡Perfecto!</button>
          </div>
        </div>
      )}

      {toast&&<div className="tl-toast"><CheckCircle size={14} strokeWidth={1.8}/>{toast}</div>}
    </div>
  );
}
