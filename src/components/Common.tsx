import React from "react";

export function Lotus({size=40, color="#2EC4B6", spin=false}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={spin ? {animation:"lotGl 4s ease-in-out infinite", transformOrigin:"center"} : {}}>
      <style>{`@keyframes lotGl{0%,100%{filter:drop-shadow(0 0 5px ${color}88)}50%{filter:drop-shadow(0 0 16px ${color})}}`}</style>
      {[0,40,80,120,160,200,240,280,320].map((r,i) =>
        <ellipse key={i} cx="50" cy="30" rx="7" ry="20" fill={color}
          opacity={i===0?.9:.55} transform={`rotate(${r} 50 50)`}/>)}
      {[0,72,144,216,288].map((r,i) =>
        <ellipse key={`n${i}`} cx="50" cy="35" rx="5.5" ry="15" fill={color}
          opacity=".85" transform={`rotate(${r} 50 50)`}/>)}
      <circle cx="50" cy="50" r="12" fill={color}/>
      <circle cx="50" cy="50" r="7" fill="#fff" opacity=".6"/>
      <circle cx="50" cy="50" r="4" fill={color}/>
    </svg>
  )
}

export function Toast({msg, type="ok"}) {
  const bg = {ok:"#2EC4B6", err:"#E5534B", warn:"#F59E0B", info:"#4A9CC8"}[type] || "#2EC4B6"
  return (
    <div style={{position:"fixed",bottom:88,left:"50%",transform:"translateX(-50%)",
      background:bg,color:"#fff",borderRadius:14,padding:"13px 22px",fontWeight:700,
      fontSize:14,fontFamily:"'Nunito',sans-serif",boxShadow:`0 6px 24px ${bg}55`,
      zIndex:9999,animation:"tIn .3s ease",maxWidth:"90vw",textAlign:"center"}}>
      <style>{`@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {msg}
    </div>
  )
}
