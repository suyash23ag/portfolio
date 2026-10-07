import { Component, type ErrorInfo, type ReactNode } from 'react'
export class AppErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(error:Error,info:ErrorInfo){console.error('Portfolio could not render',error,info.componentStack)}
  render(){return this.state.failed?<main style={{minHeight:'100vh',display:'grid',placeContent:'center',gap:'20px',padding:'30px',background:'#10151f',color:'#edf0f7',fontFamily:'sans-serif'}}><h1>Suyash Agarwal</h1><p>The portfolio hit a loading problem. Please reload to try again.</p><button style={{padding:'14px 22px',background:'#c7f0b3',color:'#10151f',border:0,borderRadius:'30px',cursor:'pointer'}} onClick={()=>window.location.reload()}>Reload portfolio</button><a href="mailto:suyashagarwal261@gmail.com">Contact Suyash</a></main>:this.props.children}
}
