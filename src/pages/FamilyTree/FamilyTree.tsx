// ============================================
// LIFE'S — Árbol Genealógico
// ✅ Agregar persona con foto + localStorage + Modal edición con foto
// ============================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Share2, X, Plus, ZoomIn, ZoomOut,
  Crosshair, ChevronRight, Users, User, Heart, Baby,
  UserCheck, Clock, Edit2, TreePine, Map,
  Download, BookOpen, UserPlus, Cake, Globe, GitBranch,
  Check, Camera,
} from 'lucide-react';
import './FamilyTree.scss';

interface TreeNode {
  id: number; name: string; role: string; gen: number;
  parentId: number | null; birth?: string; death?: string;
  country?: string; countryFlag?: string; desc?: string;
  img?: string; isDead?: boolean; dnaPercent?: number;
}

type FamilyTab = 'all'|'yo'|'pareja'|'hijos'|'padres'|'abuelos'|'bisabuelos'|'hermanos';

const INITIAL_DATA: TreeNode[] = [
  {id:1,name:'Julian Valenzuela',role:'Yo',gen:0,parentId:null,birth:'15 Abr 1978',country:'Argentina',countryFlag:'🇦🇷',desc:'"Preservo lo que el tiempo intentará olvidar."',dnaPercent:100,img:'https://i.pravatar.cc/80?img=11'},
  {id:2,name:'Ricardo Valenzuela',role:'Padre',gen:1,parentId:1,birth:'3 Jun 1950',country:'Argentina',countryFlag:'🇦🇷',desc:'Carpintero de oficio, filósofo de corazón.',dnaPercent:50,img:'https://i.pravatar.cc/80?img=60'},
  {id:3,name:'Isabel Morales',role:'Madre',gen:1,parentId:1,birth:'22 Sep 1953',country:'Argentina',countryFlag:'🇦🇷',desc:'Maestra rural. Sus palabras construyeron generaciones.',dnaPercent:50,img:'https://i.pravatar.cc/80?img=47'},
  {id:4,name:'Arthur Valenzuela',role:'Abuelo paterno',gen:2,parentId:2,birth:'11 Ene 1922',death:'3 Mar 1998',country:'Italia',countryFlag:'🇮🇹',desc:'Emigró de Génova en 1946 con una maleta y un sueño.',dnaPercent:25,isDead:true,img:'https://i.pravatar.cc/80?img=70'},
  {id:5,name:'Elena Vance',role:'Esposa',gen:1,parentId:1,birth:'5 Mar 1980',country:'Argentina',countryFlag:'🇦🇷',desc:'El ancla y la brisa de nuestra historia compartida.',dnaPercent:50,img:'https://i.pravatar.cc/80?img=25'},
  {id:6,name:'Rosa Ferretti',role:'Abuela paterna',gen:2,parentId:2,birth:'20 May 1925',death:'14 Jul 2010',country:'Italia',countryFlag:'🇮🇹',desc:'Cocinera de alma, guardiana de recetas centenarias.',dnaPercent:25,isDead:true,img:'https://i.pravatar.cc/80?img=45'},
  {id:7,name:'Carlos Morales',role:'Abuelo materno',gen:2,parentId:3,birth:'8 Feb 1928',death:'22 Nov 2005',country:'España',countryFlag:'🇪🇸',desc:'Músico y poeta. Llegó de Sevilla buscando horizontes.',dnaPercent:25,isDead:true,img:'https://i.pravatar.cc/80?img=65'},
  {id:8,name:'Lucía Paz',role:'Abuela materna',gen:2,parentId:3,birth:'14 Oct 1930',country:'Argentina',countryFlag:'🇦🇷',desc:'Tejedora de historias, coleccionista de silencios.',dnaPercent:25,img:'https://i.pravatar.cc/80?img=44'},
];

const CATEGORY_MAP: Record<FamilyTab,(n:TreeNode)=>boolean> = {
  all:()=>true,
  yo:n=>n.gen===0,
  pareja:n=>['Esposo/a','Esposa','Esposo','Cónyuge','Pareja'].includes(n.role),
  hijos:n=>['Hijo/a','Hijo','Hija','Nieto/a','Nieto','Nieta'].includes(n.role)||n.gen===-1,
  padres:n=>['Padre','Madre'].includes(n.role),
  abuelos:n=>n.role.toLowerCase().includes('abuelo')||n.role.toLowerCase().includes('abuela'),
  bisabuelos:n=>n.role.toLowerCase().includes('bisabuelo')||n.role.toLowerCase().includes('bisabuela')||n.gen===3,
  hermanos:n=>['Hermano/a','Hermano','Hermana','Medio hermano/a'].includes(n.role),
};

const TABS:{id:FamilyTab;icono:React.ReactNode;label:string}[] = [
  {id:'all',icono:<Users size={16} strokeWidth={1.8}/>,label:'Todos'},
  {id:'yo',icono:<User size={16} strokeWidth={1.8}/>,label:'Yo'},
  {id:'pareja',icono:<Heart size={16} strokeWidth={1.8}/>,label:'Pareja'},
  {id:'hijos',icono:<Baby size={16} strokeWidth={1.8}/>,label:'Hijos'},
  {id:'padres',icono:<UserCheck size={16} strokeWidth={1.8}/>,label:'Padres'},
  {id:'abuelos',icono:<Users size={16} strokeWidth={1.8}/>,label:'Abuelos'},
  {id:'bisabuelos',icono:<Clock size={16} strokeWidth={1.8}/>,label:'Bisabuelos'},
  {id:'hermanos',icono:<GitBranch size={16} strokeWidth={1.8}/>,label:'Hermanos'},
];

const GEN_COLORS=[
  {ring:'linear-gradient(135deg,#C9A84C,#ffe088)',size:76,glow:'rgba(201,168,76,0.4)'},
  {ring:'linear-gradient(135deg,#855324,#03192e)',size:62,glow:'rgba(133,83,36,0.3)'},
  {ring:'linear-gradient(135deg,#03192e,#1a2e44)',size:52,glow:'rgba(3,25,46,0.25)'},
  {ring:'linear-gradient(135deg,#74777d,#c4c6cd)',size:42,glow:'rgba(116,119,125,0.2)'},
];

function getGenConfig(gen:number){return GEN_COLORS[Math.min(Math.abs(gen),GEN_COLORS.length-1)];}

function computeLayout(nodes:TreeNode[],W:number,H:number){
  const scaleX=W/800,scaleY=H/560;
  const ANCHOR:{[k:string]:{x:number;y:number}}={
    root:{x:400,y:300},padre:{x:220,y:195},madre:{x:580,y:195},
    pareja:{x:400,y:120},hermano:{x:260,y:155},extra1:{x:540,y:155},
    abueloPat1:{x:95,y:80},abueloPat2:{x:210,y:90},
    abueloMat1:{x:590,y:90},abueloMat2:{x:705,y:80},
    extra2a:{x:400,y:42},extra2b:{x:320,y:100},
    bisa1:{x:60,y:42},bisa2:{x:145,y:50},bisa3:{x:655,y:50},
    bisa4:{x:740,y:42},bisa5:{x:480,y:100},
    hijo1:{x:270,y:490},hijo2:{x:400,y:510},hijo3:{x:530,y:490},
    hijo4:{x:180,y:525},hijo5:{x:620,y:525},
  };
  const toReal=(pt:{x:number;y:number})=>({x:pt.x*scaleX,y:pt.y*scaleY});
  const positions:{[id:number]:{x:number;y:number}}={};
  const gen0=nodes.find(n=>n.gen===0);
  if(gen0)positions[gen0.id]=toReal(ANCHOR.root);
  const gen1A=[ANCHOR.padre,ANCHOR.madre,ANCHOR.pareja,ANCHOR.hermano,ANCHOR.extra1];
  nodes.filter(n=>n.gen===1).forEach((n,i)=>{positions[n.id]=toReal(gen1A[i%gen1A.length]);});
  const gen2A=[ANCHOR.abueloPat1,ANCHOR.abueloPat2,ANCHOR.abueloMat1,ANCHOR.abueloMat2,ANCHOR.extra2a,ANCHOR.extra2b];
  nodes.filter(n=>n.gen===2).forEach((n,i)=>{positions[n.id]=toReal(gen2A[i%gen2A.length]);});
  const gen3A=[ANCHOR.bisa1,ANCHOR.bisa2,ANCHOR.bisa3,ANCHOR.bisa4,ANCHOR.bisa5];
  nodes.filter(n=>n.gen===3).forEach((n,i)=>{positions[n.id]=toReal(gen3A[i%gen3A.length]);});
  const hijoA=[ANCHOR.hijo1,ANCHOR.hijo2,ANCHOR.hijo3,ANCHOR.hijo4,ANCHOR.hijo5];
  nodes.filter(n=>n.gen===-1).forEach((n,i)=>{positions[n.id]=toReal(hijoA[i%hijoA.length]);});
  return positions;
}

const STORAGE_KEY='lifes_familytree';
function cargarTree():TreeNode[]{
  try{const r=localStorage.getItem(STORAGE_KEY);return r?JSON.parse(r):INITIAL_DATA;}
  catch{return INITIAL_DATA;}
}
function guardarTree(d:TreeNode[]){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));}catch{}
}

const FLAG_MAP:Record<string,string>={
  Argentina:'🇦🇷',Italia:'🇮🇹',España:'🇪🇸',Uruguay:'🇺🇾',
  Chile:'🇨🇱',Brasil:'🇧🇷',Francia:'🇫🇷',Alemania:'🇩🇪',
  México:'🇲🇽',Colombia:'🇨🇴',Perú:'🇵🇪',
};

// Avatar placeholder local (initials) para nuevas personas sin foto
function avatarPlaceholder(nombre:string){
  return `https://i.pravatar.cc/80?u=${encodeURIComponent(nombre)}`;
}

export default function FamilyTree(){
  const navigate=useNavigate();

  const [treeData,setTreeData]           = useState<TreeNode[]>(INITIAL_DATA);
  const [zoom,setZoom]                   = useState(1);
  const [panX,setPanX]                   = useState(0);
  const [panY,setPanY]                   = useState(0);
  const [isDragging,setIsDragging]       = useState(false);
  const [dragStart,setDragStart]         = useState({x:0,y:0});
  const [modalNode,setModalNode]         = useState<TreeNode|null>(null);
  const [addPanelOpen,setAddPanelOpen]   = useState(false);
  const [searchOpen,setSearchOpen]       = useState(false);
  const [searchQ,setSearchQ]             = useState('');
  const [activeTab,setActiveTab]         = useState<FamilyTab>('all');
  const [panelOpen,setPanelOpen]         = useState(false);
  const [highlightPath,setHighlightPath] = useState<number[]>([]);
  const [wrapSize,setWrapSize]           = useState({w:800,h:560});
  const [toast,setToast]                 = useState('');

  // ── Formulario AGREGAR ──
  const [newName,setNewName]       = useState('');
  const [newRole,setNewRole]       = useState('');
  const [newBirth,setNewBirth]     = useState('');
  const [newCountry,setNewCountry] = useState('');
  const [newDesc,setNewDesc]       = useState('');
  const [newParent,setNewParent]   = useState(1);
  const [newDead,setNewDead]       = useState(false);
  const [newImg,setNewImg]         = useState('');        // ✅ foto nueva persona
  const [newImgPreview,setNewImgPreview] = useState(''); // ✅ preview nueva persona

  // ── Modal EDICIÓN ──
  const [editOpen,setEditOpen]       = useState(false);
  const [editId,setEditId]           = useState<number|null>(null);
  const [editName,setEditName]       = useState('');
  const [editRole,setEditRole]       = useState('');
  const [editBirth,setEditBirth]     = useState('');
  const [editDeath,setEditDeath]     = useState('');
  const [editCountry,setEditCountry] = useState('');
  const [editDesc,setEditDesc]       = useState('');
  const [editDead,setEditDead]       = useState(false);
  const [editImg,setEditImg]         = useState('');

  const wrapRef         = useRef<HTMLDivElement>(null);
  const svgRef          = useRef<SVGSVGElement>(null);
  const inputFotoEditRef= useRef<HTMLInputElement>(null); // edición
  const inputFotoNewRef = useRef<HTMLInputElement>(null); // agregar

  useEffect(()=>{setTreeData(cargarTree());},[]);

  useEffect(()=>{
    const measure=()=>{if(wrapRef.current)setWrapSize({w:wrapRef.current.clientWidth,h:wrapRef.current.clientHeight});};
    measure();
    window.addEventListener('resize',measure);
    return()=>window.removeEventListener('resize',measure);
  },[]);

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000);};

  const positions=computeLayout(treeData,wrapSize.w,wrapSize.h);

  const getAncestorPath=(nodeId:number):number[]=>{
    const path:number[]=[nodeId];
    let current=treeData.find(n=>n.id===nodeId);
    while(current?.parentId){path.push(current.parentId);current=treeData.find(n=>n.id===current!.parentId);}
    return path;
  };

  const openModal=(node:TreeNode)=>{setModalNode(node);setHighlightPath(getAncestorPath(node.id));};
  const closeModal=()=>{setModalNode(null);setHighlightPath([]);};

  // ── Abrir edición ──
  const abrirEdicion=(node:TreeNode)=>{
    setEditId(node.id);setEditName(node.name);setEditRole(node.role);
    setEditBirth(node.birth||'');setEditDeath(node.death||'');
    setEditCountry(node.country||'');setEditDesc(node.desc||'');
    setEditDead(node.isDead||false);setEditImg(node.img||'');
    setEditOpen(true);
  };

  // ── Handler foto — EDICIÓN ──
  const onFotoEditSelected=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    setEditImg(URL.createObjectURL(file));
    showToast('📷 Foto actualizada');
  };

  // ── Handler foto — AGREGAR ──
  const onFotoNewSelected=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    const url=URL.createObjectURL(file);
    setNewImg(url);
    setNewImgPreview(url);
    showToast('📷 Foto seleccionada');
  };

  // ── Guardar edición ──
  const guardarEdicion=()=>{
    if(!editName.trim()){showToast('⚠️ El nombre no puede estar vacío');return;}
    const nuevas=treeData.map(n=>n.id===editId?{
      ...n,
      name:editName.trim(),role:editRole,
      birth:editBirth||undefined,death:editDeath||undefined,
      country:editCountry||undefined,
      countryFlag:FLAG_MAP[editCountry]||n.countryFlag,
      desc:editDesc||undefined,isDead:editDead,img:editImg||n.img,
    }:n);
    setTreeData(nuevas);
    guardarTree(nuevas);
    const actualizado=nuevas.find(n=>n.id===editId);
    if(actualizado)setModalNode(actualizado);
    setEditOpen(false);
    showToast('✓ Persona actualizada');
  };

  // ── Agregar persona ──
  const addPerson=()=>{
    if(!newName.trim()||!newRole)return;
    const parentNode=treeData.find(n=>n.id===newParent);
    const genFinal=
      ['Hijo/a','Hijo','Hija','Nieto/a'].includes(newRole)?-1:
      ['Abuelo paterno','Abuela paterna','Abuelo materno','Abuela materna'].includes(newRole)?2:
      ['Bisabuelo/a'].includes(newRole)?3:1;
    const newId=Math.max(...treeData.map(n=>n.id))+1;
    const nuevas=[...treeData,{
      id:newId,
      name:newName.trim(),
      role:newRole,
      gen:genFinal,
      parentId:newParent,
      birth:newBirth||undefined,
      country:newCountry||undefined,
      countryFlag:FLAG_MAP[newCountry]||'🌍',
      desc:newDesc||undefined,
      dnaPercent:Math.round((parentNode?.dnaPercent||50)/2),
      isDead:newDead,
      // ✅ Usa la foto subida; si no hay, usa avatar generado por nombre
      img:newImg||avatarPlaceholder(newName.trim()),
    }];
    setTreeData(nuevas);
    guardarTree(nuevas);  // ✅ guardar en localStorage
    setAddPanelOpen(false);
    // Reset formulario agregar
    setNewName('');setNewRole('');setNewBirth('');setNewCountry('');
    setNewDesc('');setNewDead(false);setNewImg('');setNewImgPreview('');
    showToast('✓ Persona agregada al árbol');
  };

  // ── Reset panel agregar al cerrar ──
  const cerrarAddPanel=()=>{
    setAddPanelOpen(false);
    setNewName('');setNewRole('');setNewBirth('');setNewCountry('');
    setNewDesc('');setNewDead(false);setNewImg('');setNewImgPreview('');
  };

  const stats={
    personas:treeData.length,
    generaciones:[...new Set(treeData.map(n=>Math.abs(n.gen)))].length,
    paises:[...new Set(treeData.filter(n=>n.country).map(n=>n.country))].length,
  };

  const filteredIds=searchQ
    ?treeData.filter(n=>n.name.toLowerCase().includes(searchQ.toLowerCase())||n.role.toLowerCase().includes(searchQ.toLowerCase())).map(n=>n.id)
    :null;

  const renderBranches=()=>treeData.map(node=>{
    if(!node.parentId)return null;
    const from=positions[node.parentId],to=positions[node.id];
    if(!from||!to)return null;
    const isHighlighted=highlightPath.includes(node.id)&&highlightPath.includes(node.parentId);
    const pathLen=Math.hypot(to.x-from.x,to.y-from.y);
    const cx1=from.x+(to.x-from.x)*0.2,cy1=from.y+pathLen*0.2;
    const cx2=to.x-(to.x-from.x)*0.2,cy2=to.y-pathLen*0.15;
    return(
      <path key={`branch-${node.id}`}
        d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
        stroke={isHighlighted?'#C9A84C':node.gen===1?'#a0948a':node.gen===2?'#b8aea8':'#c4c6cd'}
        strokeWidth={isHighlighted?3:node.gen===1?2.5:node.gen===2?2:1.5}
        fill="none" strokeLinecap="round"
        className={`ft-branch ${isHighlighted?'ft-branch--highlight':''}`}
        style={{opacity:(filteredIds&&!filteredIds.includes(node.id))?0.1:1,transition:'all 0.4s ease'}}
      />
    );
  });

  return(
    <div className="ft-root with-navbar">

      <header className="ft-header">
        <div className="ft-header__left">
          <button className="ft-header__back" onClick={()=>navigate('/feed')}><ArrowLeft size={20} strokeWidth={1.8}/></button>
          <div>
            <h1 className="ft-header__title">Árbol Genealógico</h1>
            <p className="ft-header__sub">{stats.personas} personas · {stats.generaciones} generaciones</p>
          </div>
        </div>
        <div className="ft-header__actions">
          <button className="ft-header__btn" onClick={()=>setSearchOpen(!searchOpen)}><Search size={18} strokeWidth={1.8}/></button>
          <button className="ft-header__btn"><Share2 size={18} strokeWidth={1.8}/></button>
          <div className="ft-header__avatar"><img src="https://i.pravatar.cc/32?img=11" alt=""/></div>
        </div>
      </header>

      {searchOpen&&(
        <div className="ft-search-bar">
          <Search size={16} strokeWidth={1.8}/>
          <input autoFocus placeholder="Buscar familiar..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
          {searchQ&&<button onClick={()=>setSearchQ('')}><X size={16} strokeWidth={1.8}/></button>}
        </div>
      )}

      {/* ÁRBOL */}
      <div className={`ft-wrap ${isDragging?'ft-wrap--dragging':''}`} ref={wrapRef}
        onMouseDown={e=>{if((e.target as HTMLElement).closest('.ft-node'))return;setIsDragging(true);setDragStart({x:e.clientX-panX,y:e.clientY-panY});}}
        onMouseMove={e=>{if(!isDragging)return;setPanX(e.clientX-dragStart.x);setPanY(e.clientY-dragStart.y);}}
        onMouseUp={()=>setIsDragging(false)} onMouseLeave={()=>setIsDragging(false)}>

        <svg className="ft-bg-tree" viewBox="0 0 800 560" preserveAspectRatio="xMidYMax meet">
          <g fill="none" stroke="#03192e" strokeLinecap="round">
            <path strokeWidth="9"  d="M400 440 Q340 460 270 490 Q230 505 180 520"/>
            <path strokeWidth="7"  d="M400 440 Q360 465 320 495 Q290 510 260 530"/>
            <path strokeWidth="6"  d="M400 440 Q395 460 390 490 Q387 510 385 535"/>
            <path strokeWidth="6"  d="M400 440 Q420 458 445 482 Q460 500 470 525"/>
            <path strokeWidth="7"  d="M400 440 Q440 460 490 488 Q530 508 570 522"/>
            <path strokeWidth="4"  d="M270 490 Q240 500 210 515"/>
            <path strokeWidth="3"  d="M320 495 Q295 510 275 528"/>
            <path strokeWidth="4"  d="M490 488 Q510 500 530 520"/>
          </g>
          <path fill="none" stroke="#03192e" strokeLinecap="round" strokeWidth="28" d="M400 440 Q398 390 395 350 Q392 310 390 270"/>
          <path fill="none" stroke="#03192e" strokeLinecap="round" strokeWidth="22" d="M390 270 Q388 240 385 210 Q382 180 378 155"/>
          <g fill="none" stroke="#03192e" strokeLinecap="round">
            <path strokeWidth="14" d="M390 270 Q360 255 330 235 Q300 215 270 195"/>
            <path strokeWidth="10" d="M270 195 Q245 180 218 162 Q195 148 175 132"/>
            <path strokeWidth="7"  d="M175 132 Q155 118 135 105 Q115 92 98 80"/>
            <path strokeWidth="14" d="M390 270 Q420 252 450 232 Q478 214 508 196"/>
            <path strokeWidth="10" d="M508 196 Q535 180 562 162 Q586 146 608 130"/>
            <path strokeWidth="7"  d="M608 130 Q628 116 648 103 Q668 90 685 78"/>
            <path strokeWidth="12" d="M385 210 Q384 185 382 162 Q380 140 378 118"/>
            <path strokeWidth="8"  d="M378 118 Q376 98 374 80 Q372 62 370 46"/>
            <path strokeWidth="8"  d="M330 235 Q315 215 298 195 Q282 175 265 158"/>
            <path strokeWidth="8"  d="M450 232 Q465 212 480 192 Q495 172 510 155"/>
          </g>
          <g>
            <ellipse cx="370" cy="46"  rx="62" ry="48" fill="#2d6a4f" opacity="0.85"/>
            <ellipse cx="320" cy="60"  rx="48" ry="40" fill="#40916c" opacity="0.80"/>
            <ellipse cx="420" cy="55"  rx="52" ry="42" fill="#52b788" opacity="0.75"/>
            <ellipse cx="370" cy="28"  rx="44" ry="34" fill="#74c69d" opacity="0.70"/>
            <ellipse cx="98"  cy="65"  rx="46" ry="38" fill="#2d6a4f" opacity="0.78"/>
            <ellipse cx="148" cy="92"  rx="40" ry="32" fill="#40916c" opacity="0.72"/>
            <ellipse cx="72"  cy="48"  rx="32" ry="26" fill="#52b788" opacity="0.68"/>
            <ellipse cx="685" cy="64"  rx="46" ry="38" fill="#2d6a4f" opacity="0.78"/>
            <ellipse cx="632" cy="90"  rx="40" ry="32" fill="#40916c" opacity="0.72"/>
            <ellipse cx="706" cy="46"  rx="32" ry="26" fill="#52b788" opacity="0.68"/>
            <ellipse cx="188" cy="80"  rx="34" ry="28" fill="#40916c" opacity="0.65"/>
            <ellipse cx="235" cy="112" rx="30" ry="24" fill="#52b788" opacity="0.62"/>
            <ellipse cx="586" cy="80"  rx="34" ry="28" fill="#40916c" opacity="0.65"/>
            <ellipse cx="535" cy="110" rx="30" ry="24" fill="#52b788" opacity="0.62"/>
            <circle cx="370" cy="35"  r="5" fill="#C9A84C" opacity="0.9"/>
            <circle cx="98"  cy="52"  r="4" fill="#C9A84C" opacity="0.85"/>
            <circle cx="685" cy="52"  r="4" fill="#C9A84C" opacity="0.85"/>
            <circle cx="320" cy="48"  r="3" fill="#ffe088" opacity="0.8"/>
            <circle cx="420" cy="44"  r="3" fill="#ffe088" opacity="0.8"/>
            <circle cx="148" cy="80"  r="3" fill="#ffe088" opacity="0.75"/>
            <circle cx="632" cy="78"  r="3" fill="#ffe088" opacity="0.75"/>
          </g>
        </svg>

        <svg ref={svgRef} className="ft-svg"
          style={{transform:`translate(${panX}px,${panY}px) scale(${zoom})`,transformOrigin:'center center'}}>
          {renderBranches()}
        </svg>

        <div className="ft-nodes"
          style={{transform:`translate(${panX}px,${panY}px) scale(${zoom})`,transformOrigin:'center center'}}>
          {treeData.map((node,ni)=>{
            const pos=positions[node.id];
            if(!pos)return null;
            const cfg=getGenConfig(node.gen);
            const isHighlighted=highlightPath.includes(node.id);
            const isFiltered=filteredIds?!filteredIds.includes(node.id):false;
            return(
              <div key={node.id}
                className={`ft-node ${node.isDead?'ft-node--dead':''} ${isHighlighted?'ft-node--highlight':''}`}
                style={{left:pos.x,top:pos.y,animationDelay:`${ni*0.08}s`,opacity:isFiltered?0.12:1,pointerEvents:isFiltered?'none':'all'}}
                onClick={()=>openModal(node)}>
                <div className="ft-node__glow" style={{background:cfg.glow,opacity:isHighlighted?1:0.5}}/>
                <div className="ft-node__ring" style={{background:isHighlighted?'linear-gradient(135deg,#C9A84C,#ffe088)':cfg.ring,width:cfg.size+8,height:cfg.size+8}}>
                  {node.img
                    ?<img src={node.img} alt={node.name} className="ft-node__img" style={{width:cfg.size,height:cfg.size,filter:node.isDead?'grayscale(0.7) sepia(0.3)':'none'}}/>
                    :<div className="ft-node__initials" style={{width:cfg.size,height:cfg.size}}>{node.name.charAt(0)}</div>
                  }
                  {node.isDead&&<div className="ft-node__candle">🕯️</div>}
                  {node.countryFlag&&<div className="ft-node__flag">{node.countryFlag}</div>}
                </div>
                <div className="ft-node__name" style={{maxWidth:cfg.size+32}}>{node.name.split(' ')[0]}</div>
                <div className="ft-node__role">{node.role}</div>
              </div>
            );
          })}
        </div>

        <div className="ft-zoom">
          <button className="ft-zoom__btn" onClick={()=>setZoom(z=>Math.min(2,z+0.15))}><ZoomIn size={18} strokeWidth={1.8}/></button>
          <button className="ft-zoom__btn" onClick={()=>setZoom(z=>Math.max(0.4,z-0.15))}><ZoomOut size={18} strokeWidth={1.8}/></button>
          <button className="ft-zoom__btn" onClick={()=>{setZoom(1);setPanX(0);setPanY(0);}}><Crosshair size={18} strokeWidth={1.8}/></button>
        </div>

        <div className="ft-leyenda">
          {[
            {grad:'linear-gradient(135deg,#C9A84C,#ffe088)',label:'Tú'},
            {grad:'linear-gradient(135deg,#855324,#03192e)',label:'Padres / Pareja'},
            {grad:'linear-gradient(135deg,#03192e,#1a2e44)',label:'Abuelos / Hijos'},
            {grad:'linear-gradient(135deg,#74777d,#c4c6cd)',label:'Bisabuelos'},
          ].map(l=>(
            <div key={l.label} className="ft-leyenda__item">
              <div className="ft-leyenda__dot" style={{background:l.grad}}/><span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL INFO */}
      <div className="ft-panel-wrap">
        <div className="ft-stats">
          <div className="ft-stats__header">
            <div><h2 className="ft-stats__title">El Linaje Vivo</h2><p className="ft-stats__sub">Tocá una categoría para filtrar</p></div>
            <div className="ft-stats__nums">
              {[{val:stats.personas,label:'Personas'},{val:stats.generaciones,label:'Gen.'},{val:stats.paises,label:'Países'}].map(s=>(
                <div key={s.label} className="ft-stat-num">
                  <span className="ft-stat-num__val">{s.val}</span>
                  <span className="ft-stat-num__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ft-tabs">
            {TABS.map(tab=>{
              const count=treeData.filter(CATEGORY_MAP[tab.id]).length;
              return(
                <button key={tab.id} className={`ft-tab ${activeTab===tab.id?'active':''}`}
                  onClick={()=>{setActiveTab(tab.id);setPanelOpen(true);}}>
                  {tab.icono}{tab.label}{count>0&&<span className="ft-tab__count">({count})</span>}
                </button>
              );
            })}
          </div>
          {panelOpen&&(
            <div className="ft-family-list">
              <div className="ft-family-list__header">
                <span>{TABS.find(t=>t.id===activeTab)?.label} · {treeData.filter(CATEGORY_MAP[activeTab]).length} personas</span>
                <button onClick={()=>setPanelOpen(false)}><X size={18} strokeWidth={1.8}/></button>
              </div>
              {treeData.filter(CATEGORY_MAP[activeTab]).length===0?(
                <div className="ft-family-list__empty">
                  <Search size={32} strokeWidth={1.4}/><p>Aún no hay personas en esta categoría</p>
                  <button onClick={()=>setAddPanelOpen(true)}>Agregar ahora</button>
                </div>
              ):(
                <div className="ft-family-list__scroll">
                  {treeData.filter(CATEGORY_MAP[activeTab]).map(node=>(
                    <div key={node.id} className="ft-person-card" onClick={()=>openModal(node)}>
                      <div className="ft-person-card__ring" style={{background:getGenConfig(node.gen).ring}}>
                        <img src={node.img||`https://i.pravatar.cc/44?u=${node.id}`} alt={node.name}
                          style={{filter:node.isDead?'grayscale(0.6) sepia(0.3)':'none'}}/>
                      </div>
                      <div className="ft-person-card__info">
                        <div className="ft-person-card__name">{node.name} {node.isDead?'🕯️':''} {node.countryFlag}</div>
                        <div className="ft-person-card__role">{node.role}</div>
                        {node.birth&&<div className="ft-person-card__birth">{node.birth}{node.death?` — ${node.death}`:''}</div>}
                      </div>
                      <ChevronRight size={16} strokeWidth={1.8} className="ft-person-card__arrow"/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="ft-add-wrap">
          <button className="ft-add-btn" onClick={()=>setAddPanelOpen(true)}>
            <UserPlus size={18} strokeWidth={1.8}/>Agregar persona al árbol
          </button>
          <div className="ft-quick-actions">
            {[
              {icono:<BookOpen size={15} strokeWidth={1.8}/>,label:'Recuerdos',path:'/feed'},
              {icono:<Map size={15} strokeWidth={1.8}/>,label:'Mapa linaje',path:'/mapa-linaje'},
              {icono:<Download size={15} strokeWidth={1.8}/>,label:'Exportar',path:'/feed'},
            ].map(a=>(
              <button key={a.label} className="ft-quick-action" onClick={()=>navigate(a.path)}>
                {a.icono}<span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MODAL VER PERSONA ══ */}
      {modalNode&&(
        <div className="ft-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal();}}>
          <div className="ft-modal">
            <div className="ft-modal__banner" style={{background:getGenConfig(modalNode.gen).ring}}>
              {modalNode.isDead&&<div className="ft-modal__dead-overlay"/>}
              <button className="ft-modal__close" onClick={closeModal}><X size={18} strokeWidth={1.8}/></button>
              <div className="ft-modal__avatar-wrap">
                <div className="ft-modal__avatar-ring" style={{background:getGenConfig(modalNode.gen).ring}}>
                  <img src={modalNode.img||`https://i.pravatar.cc/72?u=${modalNode.id}`} alt={modalNode.name}
                    style={{filter:modalNode.isDead?'grayscale(0.5) sepia(0.4)':'none'}}/>
                </div>
                {modalNode.isDead&&<div className="ft-modal__candle-big">🕯️</div>}
              </div>
            </div>
            <div className="ft-modal__body">
              <div className="ft-modal__head">
                <h3 className="ft-modal__name">{modalNode.name} {modalNode.countryFlag}</h3>
                <span className="ft-modal__role">{modalNode.role}</span>
                {modalNode.isDead&&<span className="ft-modal__dead-badge">✝ En memoria</span>}
              </div>
              {modalNode.dnaPercent&&(
                <div className="ft-modal__dna">
                  <div className="ft-modal__dna-header"><span>ADN compartido</span><span className="ft-modal__dna-val">{modalNode.dnaPercent}%</span></div>
                  <div className="ft-modal__dna-bar"><div className="ft-modal__dna-fill" style={{width:`${modalNode.dnaPercent}%`}}/></div>
                </div>
              )}
              <div className="ft-modal__grid">
                {[
                  {icono:<Cake size={15} strokeWidth={1.8}/>,label:'Nacimiento',val:modalNode.birth||'—'},
                  {icono:<Globe size={15} strokeWidth={1.8}/>,label:'País',val:`${modalNode.countryFlag||''} ${modalNode.country||'—'}`},
                  {icono:<Users size={15} strokeWidth={1.8}/>,label:'Parentesco',val:modalNode.role},
                  {icono:<GitBranch size={15} strokeWidth={1.8}/>,label:'Generación',val:modalNode.gen===0?'Tú':`Gen. ${Math.abs(modalNode.gen)}`},
                  ...(modalNode.death?[{icono:<Heart size={15} strokeWidth={1.8}/>,label:'Fallecimiento',val:modalNode.death}]:[]),
                ].map(d=>(
                  <div key={d.label} className="ft-modal__data-item">
                    {d.icono}<div><div className="ft-modal__data-label">{d.label}</div><div className="ft-modal__data-val">{d.val}</div></div>
                  </div>
                ))}
              </div>
              {modalNode.desc&&<p className="ft-modal__desc">"{modalNode.desc}"</p>}
              <div className="ft-modal__actions">
                <button className="ft-modal__btn-secondary" onClick={closeModal}>Cerrar</button>
                <button className="ft-modal__btn-primary" onClick={()=>abrirEdicion(modalNode)}>
                  <Edit2 size={14} strokeWidth={1.8}/>Editar
                </button>
                <button className="ft-modal__btn-icon"><Share2 size={16} strokeWidth={1.8}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL EDITAR PERSONA ══ */}
      {editOpen&&(
        <div className="ft-edit-overlay" onClick={e=>{if(e.target===e.currentTarget)setEditOpen(false);}}>
          <div className="ft-edit-modal">
            <div className="ft-edit-modal__header">
              <div>
                <div className="ft-edit-modal__title"><Edit2 size={17} strokeWidth={1.8}/>Editar persona</div>
                <div className="ft-edit-modal__sub">Actualizá los datos del familiar</div>
              </div>
              <button className="ft-edit-modal__close" onClick={()=>setEditOpen(false)}><X size={18} strokeWidth={1.8}/></button>
            </div>
            <div className="ft-edit-modal__body">
              {/* Input foto oculto — EDICIÓN */}
              <input ref={inputFotoEditRef} type="file" accept="image/*" style={{display:'none'}} onChange={onFotoEditSelected}/>
              {/* Preview + cambiar foto */}
              <div className="ft-edit-modal__foto-wrap">
                <div className="ft-edit-modal__foto-preview">
                  <img src={editImg||`https://i.pravatar.cc/80?u=${editId}`} alt="preview"/>
                </div>
                <div className="ft-edit-modal__foto-info">
                  <p className="ft-edit-modal__foto-label">Foto del familiar</p>
                  <p className="ft-edit-modal__foto-hint">JPG, PNG o WEBP</p>
                  <button className="ft-edit-modal__foto-btn" onClick={()=>inputFotoEditRef.current?.click()}>
                    <Camera size={14} strokeWidth={1.8}/>Cambiar foto
                  </button>
                </div>
              </div>
              <div className="ft-add-field">
                <label>Nombre completo *</label>
                <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} maxLength={80}/>
              </div>
              <div className="ft-add-field">
                <label>Parentesco</label>
                <select value={editRole} onChange={e=>setEditRole(e.target.value)}>
                  <optgroup label="Ascendencia"><option>Padre</option><option>Madre</option><option>Abuelo paterno</option><option>Abuela paterna</option><option>Abuelo materno</option><option>Abuela materna</option><option>Bisabuelo/a</option></optgroup>
                  <optgroup label="Pareja e hijos"><option>Esposa</option><option>Esposo</option><option>Pareja</option><option>Hijo/a</option><option>Nieto/a</option></optgroup>
                  <optgroup label="Lateral"><option>Hermano/a</option><option>Tío/a</option><option>Primo/a</option><option>Sobrino/a</option></optgroup>
                  <option>Yo</option>
                </select>
              </div>
              <div className="ft-add-row">
                <div className="ft-add-field"><label>Nacimiento</label><input type="text" value={editBirth} onChange={e=>setEditBirth(e.target.value)} placeholder="Ej: 15 Abr 1978"/></div>
                <div className="ft-add-field"><label>Fallecimiento</label><input type="text" value={editDeath} onChange={e=>setEditDeath(e.target.value)} placeholder="Dejar vacío si vive"/></div>
              </div>
              <div className="ft-add-field"><label>País de origen</label><input type="text" value={editCountry} onChange={e=>setEditCountry(e.target.value)} placeholder="Argentina, Italia..."/></div>
              <div className="ft-add-field"><label>Nota biográfica</label><textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={2} placeholder="Su historia, su legado..."/></div>
              <div className="ft-add-check">
                <input type="checkbox" id="editDead" checked={editDead} onChange={e=>setEditDead(e.target.checked)}/>
                <label htmlFor="editDead">🕯️ Esta persona ya falleció</label>
              </div>
            </div>
            <div className="ft-edit-modal__footer">
              <button className="ft-add-panel__cancel" onClick={()=>setEditOpen(false)}><X size={14} strokeWidth={1.8}/>Cancelar</button>
              <button className="ft-add-panel__submit" onClick={guardarEdicion}><Check size={14} strokeWidth={1.8}/>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PANEL AGREGAR PERSONA ══ */}
      {addPanelOpen&&(
        <>
          <div className="ft-overlay" onClick={cerrarAddPanel}/>
          <div className="ft-add-panel">
            <div className="ft-add-panel__handle" onClick={cerrarAddPanel}><div className="ft-add-panel__handle-bar"/></div>
            <div className="ft-add-panel__header">
              <h3>Nueva rama del árbol</h3>
              <button onClick={cerrarAddPanel}><X size={18} strokeWidth={1.8}/></button>
            </div>
            <div className="ft-add-panel__body">

              {/* ✅ Input foto oculto — AGREGAR */}
              <input ref={inputFotoNewRef} type="file" accept="image/*" style={{display:'none'}} onChange={onFotoNewSelected}/>

              {/* ✅ Preview foto nueva persona */}
              <div className="ft-edit-modal__foto-wrap">
                <div className="ft-edit-modal__foto-preview">
                  {newImgPreview
                    ?<img src={newImgPreview} alt="preview"/>
                    :<div className="ft-add-panel__foto-placeholder">
                      <Camera size={24} strokeWidth={1.4}/>
                    </div>
                  }
                </div>
                <div className="ft-edit-modal__foto-info">
                  <p className="ft-edit-modal__foto-label">Foto del familiar</p>
                  <p className="ft-edit-modal__foto-hint">Opcional · JPG, PNG o WEBP</p>
                  <button className="ft-edit-modal__foto-btn" onClick={()=>inputFotoNewRef.current?.click()}>
                    <Camera size={14} strokeWidth={1.8}/>{newImgPreview?'Cambiar foto':'Agregar foto'}
                  </button>
                  {newImgPreview&&(
                    <button className="ft-add-panel__foto-quitar" onClick={()=>{setNewImg('');setNewImgPreview('');}}>
                      <X size={11} strokeWidth={2}/>Quitar
                    </button>
                  )}
                </div>
              </div>

              <div className="ft-add-field"><label>Nombre completo *</label><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Ej: María García de López"/></div>
              <div className="ft-add-field">
                <label>Parentesco *</label>
                <select value={newRole} onChange={e=>setNewRole(e.target.value)}>
                  <option value="">— Seleccioná —</option>
                  <optgroup label="Ascendencia"><option>Padre</option><option>Madre</option><option>Abuelo paterno</option><option>Abuela paterna</option><option>Abuelo materno</option><option>Abuela materna</option><option>Bisabuelo/a</option></optgroup>
                  <optgroup label="Pareja e hijos"><option>Esposa</option><option>Esposo</option><option>Pareja</option><option>Hijo/a</option><option>Nieto/a</option></optgroup>
                  <optgroup label="Lateral"><option>Hermano/a</option><option>Tío/a</option><option>Primo/a</option><option>Sobrino/a</option></optgroup>
                </select>
              </div>
              <div className="ft-add-row">
                <div className="ft-add-field"><label>Nacimiento</label><input type="date" value={newBirth} onChange={e=>setNewBirth(e.target.value)}/></div>
                <div className="ft-add-field"><label>País de origen</label><input value={newCountry} onChange={e=>setNewCountry(e.target.value)} placeholder="Ej: Argentina"/></div>
              </div>
              <div className="ft-add-field"><label>Nota biográfica</label><textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Su historia, su legado..." rows={2}/></div>
              <div className="ft-add-field"><label>Conectar desde</label><select value={newParent} onChange={e=>setNewParent(Number(e.target.value))}>{treeData.map(n=><option key={n.id} value={n.id}>{n.name} ({n.role})</option>)}</select></div>
              <div className="ft-add-check"><input type="checkbox" id="isDead" checked={newDead} onChange={e=>setNewDead(e.target.checked)}/><label htmlFor="isDead">🕯️ Esta persona ya falleció</label></div>
              <div className="ft-add-panel__btns">
                <button className="ft-add-panel__cancel" onClick={cerrarAddPanel}>Cancelar</button>
                <button className="ft-add-panel__submit" onClick={addPerson}><TreePine size={16} strokeWidth={1.8}/>Plantar rama</button>
              </div>
            </div>
          </div>
        </>
      )}

      <nav className="ft-bottom-nav">
        {[
          {icono:<User size={22} strokeWidth={1.6}/>,label:'Feed',path:'/feed',active:false},
          {icono:<BookOpen size={22} strokeWidth={1.6}/>,label:'Perfil',path:'/muro-biografico',active:false},
          {icono:<GitBranch size={22} strokeWidth={1.6}/>,label:'Árbol',path:'/arbol-genealogico',active:true},
          {icono:<Users size={22} strokeWidth={1.6}/>,label:'Vínculos',path:'/vinculos',active:false},
          {icono:<Plus size={22} strokeWidth={1.6}/>,label:'Ajustes',path:'/configuracion',active:false},
        ].map(n=>(
          <button key={n.path} className={`ft-bottom-nav__item ${n.active?'active':''}`} onClick={()=>navigate(n.path)}>
            {n.icono}{n.label}
          </button>
        ))}
        <button className="ft-bottom-nav__add" onClick={()=>setAddPanelOpen(true)}><UserPlus size={22} strokeWidth={1.8}/></button>
      </nav>

      {toast&&<div className="ft-toast"><Check size={14} strokeWidth={1.8}/>{toast}</div>}
    </div>
  );
}
