import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { ArrowUpRight, ArrowDown, CodeXml as Github, Code2, UserRound as Linkedin, Mail, Pause, Play, Menu, X, MapPin, Trophy, GitBranch, Sparkles, Download } from 'lucide-react'
import { PoemAnimation } from '@/components/ui/3d-animation'
import { PixelText } from '@/components/ui/pixel-text'
import { AnimatedProjects } from '@/components/ui/animated-projects'
import { profile, skills } from './data'
import { WelcomeIntro } from '@/components/ui/welcome-intro'
import { MusicPlayer, type MusicHandle } from '@/components/ui/music-player'
import { IntroNotebook } from '@/components/ui/intro-notebook'
import { SkillsLaptop } from '@/components/ui/skills-laptop'
import './App.css'
import './experience.css'
import './theme.css'
import './project-cards.css'
import './music.css'
import './water-scene.css'
import './welcome-theme.css'
import { SectionTransition } from '@/components/ui/section-transition'

const navItems = [['About', 'about'], ['Projects', 'projects'], ['Skills', 'skills'], ['Journey', 'achievements']]
function App() {
  const [showIntro, setShowIntro] = useState(true)
  const music = useRef<MusicHandle>(null)
  const content = useRef<HTMLDivElement>(null)
  const enterPortfolio = () => {
    setShowIntro(false)
    setActiveSection('home')
    history.replaceState(null, '', '#home')
    requestAnimationFrame(() => {
      window.scrollTo({top: 0, behavior: 'instant'})
      content.current?.querySelector<HTMLAnchorElement>('.wordmark')?.focus({preventScroll: true})
    })
  }
  const [destination,setDestination]=useState<{id:string;label:string}|null>(null)
  const [activeSection,setActiveSection]=useState('home')
  useEffect(()=>{
    let frame=0
    const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{let current='home';for(const id of ['home','about','projects','skills','achievements','contact']){const element=document.getElementById(id);if(element&&element.getBoundingClientRect().top<=180)current=id}setActiveSection(current)})}
    window.addEventListener('scroll',update,{passive:true});update()
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',update)}
  },[])
  const sectionLabels:Record<string,string>={home:'Welcome',about:'The notebook',projects:'Selected projects',skills:'The workspace',achievements:'The journey',contact:'Let’s connect'}
  const navigate=useCallback(()=>{
    if(!destination)return
    const element=document.getElementById(destination.id)
    const hash = `#${destination.id}`
    if (location.hash !== hash) history.pushState(null, '', hash)
    if (destination.id === 'home') window.scrollTo({top: 0, behavior: 'instant'})
    else element?.scrollIntoView({behavior:'instant',block:'start'})
    setActiveSection(destination.id)
  },[destination, setActiveSection])
  const finishNavigation=useCallback(()=>{
    const id=destination?.id
    setDestination(null)
    requestAnimationFrame(()=>{const heading=document.querySelector<HTMLElement>(`#${id} h1, #${id} h2`);if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}})
  },[destination, setDestination])
  const handleSectionClick=(event:MouseEvent<HTMLDivElement>)=>{
    if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return
    const anchor=event.target instanceof Element?event.target.closest('a'):null
    if(anchor?.classList.contains('wordmark')) {
      event.preventDefault();setMenuOpen(false);setShowIntro(true)
      return
    }
    const href=anchor?.getAttribute('href')
    if(!href?.startsWith('#')||href==='#main')return
    const id=href.slice(1)||'home'
    if(!document.getElementById(id))return
    event.preventDefault();setMenuOpen(false);setDestination({id,label:sectionLabels[id]||id})
  }
  const [menuOpen, setMenuOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  return <>
    <WelcomeIntro open={showIntro} onEnter={enterPortfolio} onStartMusic={() => music.current?.startUnlessMuted()}><MusicPlayer apiRef={music}/></WelcomeIntro>{destination && <SectionTransition label={destination.label} onCovered={navigate} onDone={finishNavigation}/>}<div ref={content} inert={showIntro || !!destination} onClick={handleSectionClick}>
    <a href="#main" className="skip-link">Skip to content</a>
    <nav className="nav-shell" aria-label="Main navigation">
      <a href="#welcome" className="wordmark" aria-label="Open Suyash Agarwal welcome screen">sa<span>.</span></a>
      <div className="desktop-nav">{navItems.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={activeSection===id?"location":undefined}>{label}</a>)}</div>
      <a className="nav-contact" href="#contact">Let’s talk <ArrowUpRight size={16} /></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      {menuOpen && <div id="mobile-nav" className="mobile-nav">{navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}</div>}
    </nav>
    <main id="main">
      <header id="home" className="hero page-width">
        <div className="hero-copy"><div className="eyebrow"><span className="status-dot" /> FINAL-YEAR CSE · CLASS OF 2027</div>
          <h1>A curious mind.<br />A builder<br />at <span className="serif accent">heart.</span></h1>
          <p className="hero-intro">Hey, I’m <strong>Suyash Agarwal.</strong> A full-stack developer turning everyday problems into thoughtful digital experiences.</p>
          <div className="hero-actions"><a className="primary-button" href="#projects">Explore my work <ArrowUpRight size={18} /></a><a className="text-button" href="/Suyash-Agarwal-Resume.pdf" download>Resume <Download size={16} /></a></div>
          <div className="hero-location"><MapPin size={14} /> Jaipur, India <span> / </span> Building for the web & beyond</div>
        </div>
        <div className="hero-art"><PoemAnimation paused={paused} /><button className="motion-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play hero animation' : 'Pause hero animation'}>{paused ? <Play size={13} /> : <Pause size={13} />} {paused ? 'Play' : 'Pause'} motion</button></div>
        <div className="hero-footer"><span>GOOD SOFTWARE STARTS WITH A GOOD QUESTION.</span><a href="#about">SCROLL TO EXPLORE <ArrowDown size={14} /></a></div>
      </header>
      <div className="page-width"><PixelText paused={paused} /></div><section id="about" className="section page-width"><div className="section-heading"><div><p className="eyebrow">01 / A LITTLE ABOUT ME</p><h2>From “what if”<br />to <span className="serif">“it works.”</span></h2></div><p className="section-aside">Every builder has a backstory.<br />Here are a few pages of mine.</p></div><IntroNotebook /></section>
      <section id="projects" className="section projects-section"><div className="section-heading"><div><p className="eyebrow">02 / SELECTED WORK</p><h2>Ideas, <span className="serif">made real.</span></h2></div><a className="text-button" href={profile.github} target="_blank" rel="noreferrer">More on GitHub <ArrowUpRight size={16} /></a></div><AnimatedProjects /></section>
      <section id="skills" className="section skills-section"><div className="page-width"><p className="eyebrow">03 / MY TOOLKIT</p><div className="skills-heading-row"><h2>Inside my<br /><span className="serif">workspace.</span></h2><p className="section-aside">Explore the tools behind the work.<br />Select a symbol. Turn the laptop. Get curious.</p></div><SkillsLaptop /><div className="skills-grid">{skills.map((group, index) => <div className="skill-group" key={group.name}><span className="skill-index">0{index + 1} / {group.subtitle}</span><h3>{group.name}</h3><div className="skill-list">{group.items.map(item => <span key={item}>{item}</span>)}</div></div>)}</div></div></section>
      <section id="achievements" className="section page-width"><div className="section-heading"><div><p className="eyebrow">04 / ALONG THE WAY</p><h2>Small steps. <span className="serif">Real progress.</span></h2></div></div><div className="achievement-list"><div><Trophy /><h3>Top 10 · Code Slayer</h3><p>NIT Delhi hackathon. Selected among the top 64 teams from 10,000+ participants; finished in the Top 10.</p></div><div><GitBranch /><h3>Open source contributor</h3><p>Selected for GirlScript Summer of Code 2026. Learning and contributing alongside the community.</p></div><div><Sparkles /><h3>Building beyond the classroom</h3><p>Top 100 teams at House of Hack. Completed Ninja Playground’s 21-day coding challenge. Co-built Escape, published on Google Play.</p></div></div><div className="certifications"><span>CONTINUOUS LEARNING</span><p>Google Cloud Engineering Certificate · Nov 2025<br />Delta Full Stack Web Development, Apna College · Jul 2025</p></div></section>
      <section className="profiles section page-width" aria-labelledby="profiles-title"><p className="eyebrow">05 / FIND ME BUILDING</p><h2 id="profiles-title">The work <span className="serif">continues.</span></h2><div className="profile-links"><a href={profile.github} target="_blank" rel="noreferrer"><Github /><div><h3>GitHub</h3><p>Projects, experiments & source code</p></div><ArrowUpRight /></a><a href={profile.leetcode} target="_blank" rel="noreferrer"><Code2 /><div><h3>LeetCode</h3><p>One problem. One better solution.</p></div><ArrowUpRight /></a></div></section>
      <section id="contact" className="contact section page-width"><p className="eyebrow">HAVE AN IDEA OR AN OPPORTUNITY?</p><h2>Let’s build<br />something <span className="serif accent">meaningful.</span></h2><a className="email-link" href={`mailto:${profile.email}`}>{profile.email} <ArrowUpRight /></a><div className="socials"><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn</a><a href={profile.github} target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a><a href={`mailto:${profile.email}`}><Mail size={17} /> Email me</a></div></section>
    </main><footer className="footer page-width"><span>© {new Date().getFullYear()} Suyash Agarwal</span><a href="#">BACK TO TOP ↑</a></footer></div>
  </>
}
export default App
