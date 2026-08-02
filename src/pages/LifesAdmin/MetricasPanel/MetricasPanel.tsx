// ============================================================
// LIFE'S — MetricasPanel.tsx | Métricas globales
// Componente separado para evitar problemas de renderizado
// ============================================================
import { Download } from 'lucide-react';
import './MetricasPanel.scss';

const PERIODOS = ['Semana','Mes','Trimestre','Año'];

const METRICAS_DATA = {
  Semana: {
    usuarios:  { total:1247, nuevos:43,   activos:891, activacion:68 },
    empresas:  { total:38,   nuevas:3,    pendientes:5, tiempoVerif:'1.8 días' },
    ingresos: {
      ars: { mrr:2850000,  arr:34200000,  crecimiento:12, recuerdos:145000,  cajaValores:380000  },
      usd: { mrr:2850,     arr:34200,     crecimiento:12, recuerdos:145,     cajaValores:380     },
      btc: { total:0.0421, crecimiento:8 },
    },
    retencion:   { tasa:94, churn:6,  regresaron:28  },
    engagement:  { hitos:8432, capsulas:234, arboles:891, storage:'2.4 TB' },
    graficoUsuarios: [180,210,195,240,225,280,260,310,290,340,320,380,360,410,390,440,420,470,450,500,480,530,510,560,540,590,570,620,600,650],
    graficoIngresos: [180000,210000,195000,240000,225000,280000,260000,310000,290000,340000,320000,380000,360000,410000,390000,440000,420000,470000,450000,500000,480000,530000,510000,560000,540000,590000,570000,620000,600000,650000],
  },
  Mes: {
    usuarios:  { total:1247, nuevos:186,  activos:891, activacion:68 },
    empresas:  { total:38,   nuevas:8,    pendientes:5, tiempoVerif:'2.1 días' },
    ingresos: {
      ars: { mrr:2850000,  arr:34200000,  crecimiento:18, recuerdos:580000,  cajaValores:1520000 },
      usd: { mrr:2850,     arr:34200,     crecimiento:18, recuerdos:580,     cajaValores:1520    },
      btc: { total:0.182,  crecimiento:12 },
    },
    retencion:   { tasa:94, churn:6,  regresaron:112 },
    engagement:  { hitos:8432, capsulas:234, arboles:891, storage:'2.4 TB' },
    graficoUsuarios: [820,870,910,960,1010,1060,1110,1160,1210,1247],
    graficoIngresos: [1800000,2100000,2300000,2500000,2650000,2750000,2800000,2820000,2840000,2850000],
  },
  Trimestre: {
    usuarios:  { total:1247, nuevos:524,  activos:891, activacion:71 },
    empresas:  { total:38,   nuevas:18,   pendientes:5, tiempoVerif:'2.4 días' },
    ingresos: {
      ars: { mrr:2850000,  arr:34200000,  crecimiento:34, recuerdos:1740000, cajaValores:4560000 },
      usd: { mrr:2850,     arr:34200,     crecimiento:34, recuerdos:1740,    cajaValores:4560    },
      btc: { total:0.541,  crecimiento:28 },
    },
    retencion:   { tasa:92, churn:8,  regresaron:289 },
    engagement:  { hitos:8432, capsulas:234, arboles:891, storage:'2.4 TB' },
    graficoUsuarios: [420,520,620,720,820,920,1020,1100,1180,1247],
    graficoIngresos: [800000,1100000,1400000,1700000,2000000,2200000,2400000,2600000,2750000,2850000],
  },
  Año: {
    usuarios:  { total:1247, nuevos:1247, activos:891, activacion:74 },
    empresas:  { total:38,   nuevas:38,   pendientes:5, tiempoVerif:'2.8 días' },
    ingresos: {
      ars: { mrr:2850000,  arr:34200000,  crecimiento:210, recuerdos:6960000, cajaValores:18240000 },
      usd: { mrr:2850,     arr:34200,     crecimiento:210, recuerdos:6960,    cajaValores:18240   },
      btc: { total:2.164,  crecimiento:180 },
    },
    retencion:   { tasa:89, churn:11, regresaron:891 },
    engagement:  { hitos:8432, capsulas:234, arboles:891, storage:'2.4 TB' },
    graficoUsuarios: [0,42,98,186,312,468,645,812,962,1080,1162,1247],
    graficoIngresos: [0,120000,380000,720000,1100000,1520000,1900000,2250000,2530000,2720000,2810000,2850000],
  },
};

interface Props {
  periodo: string;
  setPeriodo: (p: string) => void;
  moneda: 'ars' | 'usd' | 'btc';
  setMoneda: (m: 'ars' | 'usd' | 'btc') => void;
  showToast: (msg: string) => void;
}

export default function MetricasPanel({ periodo, setPeriodo, moneda, setMoneda, showToast }: Props) {
  const d   = METRICAS_DATA[periodo as keyof typeof METRICAS_DATA];
  const ing = d.ingresos;

  const fmt = (n: number) => moneda === 'ars'
    ? `$${n.toLocaleString('es-AR')}`
    : moneda === 'usd'
    ? `USD ${n.toLocaleString('en-US')}`
    : `₿ ${n}`;

  const maxU = Math.max(...d.graficoUsuarios);
  const maxI = Math.max(...d.graficoIngresos);

  return (
    <div className="la-modulo">
      <div className="la-modulo__header">
        <div>
          <h2 className="la-modulo__titulo">Métricas globales</h2>
          <p className="la-modulo__sub">Salud y crecimiento de la plataforma</p>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <div className="la-selector-grupo">
            {PERIODOS.map(p => (
              <button key={p}
                className={`la-selector-btn${periodo===p?' active':''}`}
                onClick={() => setPeriodo(p)}
              >{p}</button>
            ))}
          </div>
          <div className="la-selector-grupo">
            {[{id:'ars',label:'ARS $'},{id:'usd',label:'USD'},{id:'btc',label:'₿ BTC'}].map(m => (
              <button key={m.id}
                className={`la-selector-btn${moneda===m.id?' active':''}`}
                onClick={() => setMoneda(m.id as 'ars'|'usd'|'btc')}
              >{m.label}</button>
            ))}
          </div>
          <button className="la-btn-primary" onClick={() => showToast('⬇️ Exportando reporte...')}>
            <Download size={13} strokeWidth={2}/> Exportar
          </button>
        </div>
      </div>

      {/* ── Usuarios ── */}
      <div className="la-metricas-seccion">
        <h3 className="la-metricas-seccion__titulo">👥 Usuarios</h3>
        <div className="la-kpi-grid">
          {[
            { label:'Usuarios totales',   val: d.usuarios.total.toLocaleString(),   trend:`+${d.usuarios.nuevos} nuevos`,                               color:'#C9932A', pct:74, up:true  },
            { label:'Usuarios activos',   val: d.usuarios.activos.toLocaleString(), trend:`${Math.round(d.usuarios.activos/d.usuarios.total*100)}% del total`, color:'#4a7a4e', pct:72, up:true  },
            { label:'Tasa de activación', val: `${d.usuarios.activacion}%`,          trend:'de nuevos registros',                                       color:'#58a6ff', pct:d.usuarios.activacion, up:true },
            { label:'Tasa de retención',  val: `${d.retencion.tasa}%`,               trend:`churn ${d.retencion.churn}%`,                               color:'#855324', pct:d.retencion.tasa, up:d.retencion.tasa>90 },
          ].map((k,i) => (
            <div key={i} className="la-kpi">
              <div className="la-kpi__header">
                <span style={{color:k.color,fontSize:'0.6rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{k.label}</span>
                <span style={{color:k.up?'#86efac':'#f85149',fontSize:'0.7rem',fontWeight:700}}>{k.up?'↑':'↓'}</span>
              </div>
              <div className="la-kpi__val">{k.val}</div>
              <div className="la-kpi__label">{k.trend}</div>
              <div className="la-kpi__bar">
                <div className="la-kpi__bar-fill" style={{width:`${k.pct}%`,background:`linear-gradient(90deg,${k.color},${k.color}55)`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Empresas ── */}
      <div className="la-metricas-seccion">
        <h3 className="la-metricas-seccion__titulo">🏢 Empresas</h3>
        <div className="la-kpi-grid">
          {[
            { label:'Empresas totales',    val: d.empresas.total.toString(),      trend:`+${d.empresas.nuevas} nuevas`, color:'#3a5a8a', pct:60, up:true  },
            { label:'Pendientes verif.',   val: d.empresas.pendientes.toString(), trend:'en cola',                      color:'#f85149', pct:30, up:false },
            { label:'Tiempo verificación', val: d.empresas.tiempoVerif,           trend:'promedio SLA',                 color:'#855324', pct:55, up:true  },
            { label:'Regresaron',          val: d.retencion.regresaron.toString(),trend:'usuarios que volvieron',       color:'#58a6ff', pct:40, up:true  },
          ].map((k,i) => (
            <div key={i} className="la-kpi">
              <div className="la-kpi__header">
                <span style={{color:k.color,fontSize:'0.6rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{k.label}</span>
                <span style={{color:k.up?'#86efac':'#f85149',fontSize:'0.7rem',fontWeight:700}}>{k.up?'↑':'↓'}</span>
              </div>
              <div className="la-kpi__val">{k.val}</div>
              <div className="la-kpi__label">{k.trend}</div>
              <div className="la-kpi__bar">
                <div className="la-kpi__bar-fill" style={{width:`${k.pct}%`,background:`linear-gradient(90deg,${k.color},${k.color}55)`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ingresos ── */}
      <div className="la-metricas-seccion">
        <h3 className="la-metricas-seccion__titulo">💰 Ingresos por fuente · {periodo}</h3>
        <div className="la-ingresos-grid">
          {moneda !== 'btc' ? (
            <>
              {[
                { label:'MRR',                val: fmt((ing as any)[moneda].mrr),         desc:'Ingresos mensuales recurrentes',  color:'#C9932A', icono:'📈', crecimiento:(ing as any)[moneda].crecimiento },
                { label:'ARR proyectado',     val: fmt((ing as any)[moneda].arr),         desc:'Ingresos anuales proyectados',    color:'#4a7a4e', icono:'📊', crecimiento:(ing as any)[moneda].crecimiento },
                { label:'Venta de recuerdos', val: fmt((ing as any)[moneda].recuerdos),   desc:'Envíos + logística cobrada',      color:'#3a5a8a', icono:'💌', crecimiento:(ing as any)[moneda].crecimiento },
                { label:'Fondo de Legado',    val: fmt((ing as any)[moneda].cajaValores), desc:'Depósitos Caja de Valores',       color:'#855324', icono:'🏦', crecimiento:(ing as any)[moneda].crecimiento },
              ].map((item,i) => (
                <div key={i} className="la-ingreso-card">
                  <div className="la-ingreso-card__icono">{item.icono}</div>
                  <div className="la-ingreso-card__info">
                    <span className="la-ingreso-card__label">{item.label}</span>
                    <strong className="la-ingreso-card__val" style={{color:item.color}}>{item.val}</strong>
                    <span className="la-ingreso-card__desc">{item.desc}</span>
                  </div>
                  <span className="la-badge la-badge--verde" style={{marginLeft:'auto',alignSelf:'center'}}>
                    +{item.crecimiento}%
                  </span>
                </div>
              ))}
            </>
          ) : (
            <div className="la-ingreso-card la-ingreso-card--btc">
              <div className="la-ingreso-card__icono">₿</div>
              <div className="la-ingreso-card__info">
                <span className="la-ingreso-card__label">Total en Bitcoin</span>
                <strong className="la-ingreso-card__val" style={{color:'#f7931a'}}>₿ {ing.btc.total}</strong>
                <span className="la-ingreso-card__desc">Pagos recibidos en BTC · {periodo}</span>
              </div>
              <span className="la-badge la-badge--verde" style={{marginLeft:'auto',alignSelf:'center'}}>
                +{ing.btc.crecimiento}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Gráfico usuarios ── */}
      <div className="la-panel">
        <div className="la-panel__header">
          <span className="la-panel__titulo">Crecimiento de usuarios · {periodo}</span>
        </div>
        <div className="la-grafico-barras">
          {d.graficoUsuarios.map((v,i) => (
            <div key={i} className="la-grafico-barras__col">
              <span className="la-grafico-barras__val">{v > 0 ? v : ''}</span>
              <div className="la-grafico-barras__track">
                <div className="la-grafico-barras__fill"
                  style={{height:`${maxU > 0 ? (v/maxU)*100 : 0}%`,
                    background:'linear-gradient(to top,#C9932A,rgba(201,147,42,0.3))'}}/>
              </div>
              <span className="la-grafico-barras__label">{i+1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gráfico ingresos ── */}
      {moneda !== 'btc' && (
        <div className="la-panel">
          <div className="la-panel__header">
            <span className="la-panel__titulo">Evolución de ingresos · {periodo} · {moneda.toUpperCase()}</span>
          </div>
          <div className="la-grafico-barras">
            {d.graficoIngresos.map((v,i) => (
              <div key={i} className="la-grafico-barras__col">
                <span className="la-grafico-barras__val" style={{fontSize:'0.45rem'}}>
                  {v > 0 ? (moneda==='ars' ? `$${(v/1000).toFixed(0)}k` : `${v}`) : ''}
                </span>
                <div className="la-grafico-barras__track">
                  <div className="la-grafico-barras__fill"
                    style={{height:`${maxI > 0 ? (v/maxI)*100 : 0}%`,
                      background:'linear-gradient(to top,#4a7a4e,rgba(74,122,78,0.3))'}}/>
                </div>
                <span className="la-grafico-barras__label">{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Engagement ── */}
      <div className="la-metricas-seccion">
        <h3 className="la-metricas-seccion__titulo">⚡ Engagement y contenido</h3>
        <div className="la-engagement-grid">
          {[
            { emoji:'📌', label:'Hitos creados',       val: d.engagement.hitos.toLocaleString() },
            { emoji:'⏳', label:'Cápsulas programadas', val: d.engagement.capsulas.toString()    },
            { emoji:'🌳', label:'Árboles completados',  val: d.engagement.arboles.toString()     },
            { emoji:'💾', label:'Storage usado',        val: d.engagement.storage                },
          ].map((e,i) => (
            <div key={i} className="la-engagement-card">
              <span className="la-engagement-card__emoji">{e.emoji}</span>
              <strong className="la-engagement-card__val">{e.val}</strong>
              <span className="la-engagement-card__label">{e.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
