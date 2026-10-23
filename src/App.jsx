import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Activity, BookOpen, Cable, CheckCircle2, ChevronRight, CircleHelp, RotateCcw, Save, ShieldCheck, Sparkles, Zap } from 'lucide-react';

function Part({ position, color, label, type, onClick, selected }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {type === 'lamp' ? (
        <>
          <mesh position={[0, 0.18, 0]}><sphereGeometry args={[0.22, 24, 24]} /><meshStandardMaterial color={selected ? '#fff1a8' : color} emissive={selected ? '#ffbd39' : '#000000'} emissiveIntensity={selected ? 1.4 : 0} /></mesh>
          <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.11, 0.11, 0.16, 16]} /><meshStandardMaterial color="#9ca3af" metalness={0.7} /></mesh>
        </>
      ) : type === 'switch' ? (
        <><mesh><boxGeometry args={[0.55, 0.16, 0.42]} /><meshStandardMaterial color={selected ? '#2dd4bf' : '#dbe4ef'} /></mesh><mesh position={[0, 0.13, 0]} rotation={[0, 0, -0.25]}><boxGeometry args={[0.28, 0.07, 0.16]} /><meshStandardMaterial color="#334155" /></mesh></>
      ) : type === 'battery' ? (
        <><mesh><boxGeometry args={[0.7, 0.32, 0.4]} /><meshStandardMaterial color={selected ? '#2dd4bf' : '#253b58'} /></mesh><mesh position={[-0.23, 0.2, 0]}><cylinderGeometry args={[0.07,0.07,0.08,12]} /><meshStandardMaterial color="#e5e7eb" metalness={0.8} /></mesh><mesh position={[0.23, 0.2, 0]}><cylinderGeometry args={[0.07,0.07,0.08,12]} /><meshStandardMaterial color="#e5e7eb" metalness={0.8} /></mesh></>
      ) : (
        <><mesh><boxGeometry args={[0.62, 0.25, 0.38]} /><meshStandardMaterial color={selected ? '#2dd4bf' : color} /></mesh></>
      )}
      <Html position={[0, -0.42, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="part-label">{label}</div>
      </Html>
    </group>
  );
}

function Wire({ start, end, color = '#ef4444' }) {
  const points = useMemo(() => [start, end].map(p => new THREE.Vector3(...p)), [start, end]);
  return <primitive object={new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.035, 8, false), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }))} />;
}
// Three.js is exposed by @react-three/fiber dependency at build time.
import * as THREE from 'three';

function Lab({ connected, selected, setSelected, wireColor }) {
  return <Canvas camera={{ position: [4.6, 4.3, 6.2], fov: 45 }} dpr={[1, 1.5]}>
    <color attach="background" args={['#0b1728']} />
    <ambientLight intensity={1.1} />
    <directionalLight position={[4, 8, 4]} intensity={2} />
    <gridHelper args={[10, 20, '#29415d', '#1a2b40']} position={[0, -0.42, 0]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.44, 0]}><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#102137" /></mesh>
    <Part position={[-2, 0, 0]} type="battery" color="#253b58" label="Pilha 9 V" selected={selected === 'battery'} onClick={() => setSelected('battery')} />
    <Part position={[0, 0, 0]} type="switch" color="#dbe4ef" label="Interruptor" selected={selected === 'switch'} onClick={() => setSelected('switch')} />
    <Part position={[2, 0, 0]} type="lamp" color="#fbbf24" label="Lâmpada" selected={selected === 'lamp'} onClick={() => setSelected('lamp')} />
    {connected && <>
      <Wire start={[-1.65, 0.2, 0]} end={[-0.35, 0.1, 0]} color={wireColor} />
      <Wire start={[0.35, 0.1, 0]} end={[1.78, 0.2, 0]} color={wireColor} />
      <Wire start={[2, -0.12, 0.2]} end={[-2, -0.12, 0.2]} color="#38bdf8" />
    </>}
    <OrbitControls makeDefault minDistance={3} maxDistance={12} />
  </Canvas>;
}

export default function App() {
  const [page, setPage] = useState('lab');
  const [connected, setConnected] = useState(false);
  const [selected, setSelected] = useState('battery');
  const [wireColor, setWireColor] = useState('#ef4444');
  const [notice, setNotice] = useState('');
  const [plans, setPlans] = useState([]);
  const [projects, setProjects] = useState([]);
  const [health, setHealth] = useState('Verificando serviços…');

  React.useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => setHealth(d.database === 'connected' ? 'Banco conectado' : d.database === 'not_configured' ? 'Banco ainda não configurado' : 'Banco com erro')).catch(() => setHealth('API indisponível'));
    fetch('/api/plans').then(r => r.json()).then(setPlans).catch(() => {});
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(() => {});
  }, []);

  const saveProject = async () => {
    const name = window.prompt('Nome do projeto:');
    if (!name) return;
    try {
      const r = await fetch('/api/projects/save', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, project: { connected, selected, wireColor, version: 1 } }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Falha ao salvar');
      setNotice(`Projeto salvo na nuvem (ID ${data.id}).`);
    } catch (e) {
      localStorage.setItem('eletroeduca-project', JSON.stringify({ name, connected, selected, wireColor }));
      setNotice(`${e.message} Uma cópia local foi guardada neste navegador.`);
    }
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Zap size={22}/></div><div><b>EletroEduca</b><small>APRENDER • MONTAR • DESCOBRIR</small></div></div>
      <div className="side-caption">ESPAÇO DE APRENDIZAGEM</div>
      <button className={page === 'lab' ? 'nav active' : 'nav'} onClick={() => setPage('lab')}><Cable size={18}/> Laboratório 3D</button>
      <button className={page === 'projects' ? 'nav active' : 'nav'} onClick={() => setPage('projects')}><BookOpen size={18}/> Biblioteca de projetos</button>
      <button className={page === 'plans' ? 'nav active' : 'nav'} onClick={() => setPage('plans')}><Sparkles size={18}/> Planos</button>
      <div className="sidebar-bottom"><div className="safety"><ShieldCheck size={18}/><div><b>Ambiente virtual seguro</b><small>Simulações educativas. Não conecte a instalações reais.</small></div></div><small className="service-state"><span className="dot"/> {health}</small></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><span className="eyebrow">PLATAFORMA DE ENSINO</span><h1>{page === 'lab' ? 'Laboratório elétrico' : page === 'projects' ? 'Biblioteca de projetos' : 'Planos de acesso'}</h1></div><div className="user-chip"><div className="avatar">E</div><div><b>Visitante</b><small>Conta não configurada</small></div></div></header>
      {page === 'lab' && <section className="lab-page">
        <div className="welcome-row"><div><h2>Seu laboratório virtual</h2><p>Explore componentes e experimente ligações em um ambiente didático 3D.</p></div><span className="tag"><Activity size={14}/> SIMULAÇÃO DIDÁTICA</span></div>
        <div className="lab-layout">
          <div className="canvas-card"><div className="canvas-toolbar"><span><span className="live-dot"/> ÁREA DE MONTAGEM</span><div className="toolbar-actions"><button title="Reiniciar" onClick={() => {setConnected(false);setSelected('battery');setNotice('Montagem reiniciada.')}}><RotateCcw size={16}/></button><button title="Salvar projeto" onClick={saveProject}><Save size={16}/></button></div></div><div className="canvas-wrap"><Suspense fallback={<div className="loading">Carregando laboratório 3D…</div>}><Lab connected={connected} selected={selected} setSelected={setSelected} wireColor={wireColor}/></Suspense><div className="canvas-hint">Arraste para girar • Role para aproximar • Clique em um componente</div></div><div className="canvas-footer"><span><i className="legend red"/> Condutor selecionado</span><span><i className="legend blue"/> Retorno didático</span><span>Escala conceitual</span></div></div>
          <div className="control-card"><div className="panel-title"><div><h3>Painel de montagem</h3><p>Interaja com o circuito virtual</p></div><CircleHelp size={18}/></div>
            <div className="control-section"><label>COMPONENTE SELECIONADO</label><div className="selected-part"><div className="part-icon"><Zap size={19}/></div><div><b>{({battery:'Pilha 9 V',switch:'Interruptor',lamp:'Lâmpada'})[selected]}</b><small>Componente didático</small></div><CheckCircle2 size={17} className="check"/></div></div>
            <div className="control-section"><label>COR DO FIO DIDÁTICO</label><div className="color-options">{[['#ef4444','Vermelho'],['#38bdf8','Azul'],['#facc15','Amarelo'],['#22c55e','Verde']].map(([c,n])=><button key={c} className={wireColor===c?'color-choice chosen':'color-choice'} onClick={()=>setWireColor(c)}><i style={{background:c}}/>{n}</button>)}</div></div>
            <div className="control-section"><label>EXPERIMENTO</label><div className="experiment"><div className="experiment-icon"><Zap size={18}/></div><div><b>Pilha, interruptor e lâmpada</b><small>Objetivo: observar a continuidade conceitual de um circuito simples.</small></div></div><button className={connected?'primary-button connected':'primary-button'} onClick={()=>{setConnected(!connected);setNotice(!connected?'Fios ilustrativos exibidos. A validação elétrica ainda não está implementada.':'Fios removidos da visualização.')}}><Cable size={17}/>{connected?'Desconectar fios':'Conectar fios'}<ChevronRight size={16}/></button><p className="educational-note">Esta versão desenha conexões visuais para demonstrar a interface. Ela ainda não calcula corrente, tensão ou falhas elétricas.</p></div>
            {notice && <div className="notice">{notice}</div>}
          </div>
        </div>
        <div className="bottom-cards"><div className="mini-card"><div className="mini-icon purple"><BookOpen size={19}/></div><div><b>Aprenda por etapas</b><p>Projetos organizados por dificuldade.</p></div><ChevronRight size={17}/></div><div className="mini-card"><div className="mini-icon green"><CheckCircle2 size={19}/></div><div><b>Pratique com segurança</b><p>Experimentos somente virtuais.</p></div><ChevronRight size={17}/></div></div>
      </section>}
      {page === 'projects' && <section className="content-page"><p className="muted">Projetos iniciais para explorar. A biblioteca será ampliada conforme implementarmos os módulos didáticos.</p><div className="project-grid">{projects.map(p=><article className="project-card" key={p.id}><div className="project-art"><Zap size={27}/></div><span className="tag">{p.category}</span><h3>{p.title}</h3><p>{p.description}</p><button className="outline-button" onClick={()=>{setPage('lab');setNotice(`Projeto “${p.title}” selecionado como referência. A carga completa do projeto será implementada na próxima etapa.`)}}>Abrir projeto <ChevronRight size={15}/></button></article>)}</div></section>}
      {page === 'plans' && <section className="content-page"><div className="plans-intro"><span className="tag"><Sparkles size={14}/> ACESSO À PLATAFORMA</span><h2>Escolha como aprender</h2><p>Preços iniciais sugeridos no documento de requisitos. O checkout ainda não está ativado.</p></div><div className="plans-grid">{plans.map(p=><article className="plan-card" key={p.id}><h3>Plano {p.name.toLowerCase()}</h3><div className="price">R$ {(p.priceCents/100).toLocaleString('pt-BR',{minimumFractionDigits:2})}<small> / {p.durationMonths===1?'mês':`${p.durationMonths} meses`}</small></div><ul><li>Biblioteca educacional</li><li>Projetos de estudo</li><li>Recursos conforme disponibilidade</li></ul><button className="outline-button" onClick={()=>setNotice('Checkout indisponível: configure um provedor de pagamento real antes de receber cobranças.')}>Conhecer plano <ChevronRight size={15}/></button><small className="plan-warning">Pagamento não habilitado</small></article>)}</div></section>}
      <footer><span>© {new Date().getFullYear()} EletroEduca</span><span>Laboratório virtual educativo • Não substitui projeto técnico profissional</span></footer>
    </main>
  </div>;
}
