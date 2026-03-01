import { useState, useEffect, useRef } from "react";
import { P, TH, MODULES, COUNTRIES, LEVELS, GOALS, LANGS } from "./constants";
import { uuid, shortCode, safeGet, safeSet, enviarNotificacao, abrirGmailCompose, copiarParaClipboard } from "./utils";
import { Lotus, Toast } from "./components/Common";

const ADMIN_EMAIL  = "josematos.chico@gmail.com";
const ADMIN_PASS   = "lotus2024";
const LOTUS_CLICKS = 7;

function BreathController({steps, active, phase, setPhase, count, setCount, timer, setTimer}: any) {
  const ref = useRef<any>(null)
  useEffect(() => {
    if (!active || !steps?.length) return
    if (ref.current) clearInterval(ref.current)
    const currentStep = steps[phase % steps.length]
    const totalSec = currentStep?.sec || 4
    setCount(totalSec)
    let remaining = totalSec
    const iv = setInterval(() => {
      remaining--
      setCount(remaining)
      if (remaining <= 0) {
        clearInterval(iv)
        setPhase((p: number) => p + 1)
      }
    }, 1000)
    ref.current = iv
    setTimer(iv)
    return () => clearInterval(iv)
  }, [active, phase])

  useEffect(() => {
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [])

  return null
}

export default function App() {
  const [dark, setDark]           = useState(false)
  const [lang, setLang]           = useState("pt-BR")
  const [scr, setScr]             = useState("splash")
  const [tab, setTab]             = useState("home")
  const [authTab, setAuthTab]     = useState("login")
  const [user, setUser]           = useState<any>(null)
  const [mod, setMod]             = useState<any>(null)
  const [cls, setCls]             = useState<any>(null)
  const [tasks, setTasks]         = useState<any[]>([])
  const [prog, setProg]           = useState<any>({})
  const [regs, setRegs]           = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [tokens, setTokens]       = useState<any>({})
  const [aiMsgs, setAiMsgs]       = useState<any[]>([])
  const [aiTxt, setAiTxt]         = useState("")
  const [aiLoad, setAiLoad]       = useState(false)
  const [toast, setToast]         = useState<any>(null)
  const [lClicks, setLClicks]     = useState(0)
  const [adminPw, setAdminPw]     = useState("")
  const [adminStep, setAdminStep] = useState("pw")
  const [adminQ, setAdminQ]       = useState("")
  const [mailSt, setMailSt]       = useState<any>(null)
  const [actCode, setActCode]     = useState("")
  const [codeSt, setCodeSt]       = useState<any>(null)
  const [taskF, setTaskF]         = useState({title:"",module:"",assignee:"",deadline:"",status:"pendente",notes:""})
  const [showTF, setShowTF]       = useState(false)
  const [loginF, setLoginF]       = useState({email:"", password:""})
  const [regF, setRegF]           = useState({nome:"",email:"",idade:"",pais:"Brasil",nivel:"Iniciante",goals:[],phone:"",password:"",bio:""})
  const [regLoading, setRegLoading]   = useState(false)
  const [breathActive, setBreathActive] = useState(false)
  const [breathPhase, setBreathPhase]   = useState(0)
  const [breathCount, setBreathCount]   = useState(0)
  const [breathTimer, setBreathTimer]   = useState<any>(null)
  const [openPose, setOpenPose]         = useState<any>(null)
  const [testEmail, setTestEmail]   = useState<any>(null)
  const lTimer = useRef<any>(null)
  const T = dark ? TH.dark : TH.light

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Nunito:wght@300;400;600;700;800&display=swap');
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes shim{0%,100%{opacity:.5}50%{opacity:1}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    .hov:hover{opacity:.88;transform:translateY(-1px)!important}.hov{transition:all .2s!important}
    .cHov:hover{transform:translateY(-3px)!important;box-shadow:0 10px 32px rgba(46,196,182,.22)!important}.cHov{transition:all .25s!important}
    input:focus,textarea:focus,select:focus{border-color:${P.trq}!important;outline:none}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${P.trq}44;border-radius:3px}
    .chip{background:${dark?"#1E2A40":"#EEE8FF"};border:1.5px solid ${T.brd};border-radius:8px;padding:6px 12px;font-size:13px;cursor:pointer;color:${T.text};font-family:'Nunito',sans-serif;transition:all .18s}
    .chip.on{background:${P.trq};color:#fff;border-color:${P.trq}}
  `

  const sh = (msg: string, type: string = "ok", ms: number = 3500) => {
    setToast({msg, type})
    setTimeout(() => setToast(null), ms)
  }

  const s: any = {
    wrap: {minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'Nunito',sans-serif", transition:"all .4s"},
    card: {background:T.card, borderRadius:16, padding:20, boxShadow:T.shd, border:`1px solid ${T.brd}`},
    btn:  (bg=P.trq, fg="#fff") => ({background:bg, color:fg, border:"none", borderRadius:12, padding:"12px 24px", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"'Nunito',sans-serif", transition:"all .2s", boxShadow:`0 4px 14px ${bg}44`}),
    inp:  {background:T.inp, border:`1.5px solid ${T.brd}`, borderRadius:10, padding:"11px 14px", color:T.text, fontFamily:"'Nunito',sans-serif", fontSize:15, width:"100%", outline:"none", boxSizing:"border-box"},
    lbl:  {fontSize:13, fontWeight:700, color:T.sec, marginBottom:5, display:"block"},
  }

  useEffect(() => {
    const init = async () => {
      const u = await safeGet("yoga_user");      if (u) setUser(u)
      const p = await safeGet("yoga_prog");      if (p) setProg(p)
      const tk = await safeGet("yoga_tasks");    if (tk) setTasks(tk)
      const r = await safeGet("yoga_regs",true); if (r) setRegs(r)
      const a = await safeGet("yoga_appr",true); if (a) setApprovals(a)
      const t = await safeGet("yoga_tok",true);  if (t) setTokens(t)
    }
    init()
    setTimeout(() => setScr("auth"), 2700)
  }, [])

  const checkApproval = async () => {
    if (!user) return
    const list = await safeGet("yoga_appr", true) || []
    if (list.includes(user.email)) { setScr("app"); sh("Acesso liberado! 🪷") }
    else sh("Ainda aguardando ativação...","info")
  }

  const processarCodigo = async (input: string) => {
    const all = await safeGet("yoga_tok", true) || {}
    const hit = Object.entries(all).find(([k,v]: any) =>
      k === input || v.code === input.toUpperCase()
    )
    if (!hit) return "invalido"
    const [tok, data]: any = hit
    if (data.used) return "usado"
    const lista = await safeGet("yoga_appr", true) || []
    if (!lista.includes(data.email)) lista.push(data.email)
    await safeSet("yoga_appr", lista, true)
    setApprovals(lista)
    all[tok] = {...data, used:true, usedAt:new Date().toISOString()}
    await safeSet("yoga_tok", all, true)
    setTokens(all)
    return data.email
  }

  const applyCode = async () => {
    if (!actCode.trim()) return sh("Digite o código","err")
    setCodeSt("ch")
    const resultado = await processarCodigo(actCode.trim())
    if (resultado === "invalido") { sh("Código inválido ❌","err"); setCodeSt("fail") }
    else if (resultado === "usado") { sh("Código já utilizado ⚠️","warn"); setCodeSt("fail") }
    else {
      setCodeSt("ok")
      const curUser = await safeGet("yoga_user")
      if (curUser && curUser.email === resultado) {
        setTimeout(() => { setScr("app"); sh("✅ App ativado! Bem-vinda(o)! 🪷") }, 500)
      } else {
        sh(`✅ ${resultado} ativado!`)
      }
    }
    setTimeout(() => setCodeSt(null), 3000)
  }

  const doRegister = async () => {
    if (!regF.nome || !regF.email || !regF.idade || !regF.password)
      return sh("Preencha os campos obrigatórios ⚠️","err")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regF.email))
      return sh("E-mail inválido ❌","err")
    if (regF.password.length < 6)
      return sh("Senha deve ter no mínimo 6 caracteres","err")

    setRegLoading(true)

    try {
      const listAtual = await safeGet("yoga_regs", true) || []
      if (listAtual.find((r: any) => r.email === regF.email)) {
        setRegLoading(false)
        return sh("E-mail já cadastrado. Faça login.","err")
      }

      const entrada = {
        ...regF,
        createdAt: new Date().toISOString(),
        id: Date.now(),
      }

      listAtual.push(entrada)
      await safeSet("yoga_regs", listAtual, true)
      await safeSet("yoga_user", entrada)
      setUser(entrada)
      setRegs(listAtual)

      const codigo = shortCode()
      const tokenId = uuid()
      const todosTokens = await safeGet("yoga_tok", true) || {}
      todosTokens[tokenId] = {
        email: regF.email,
        code: codigo,
        createdAt: new Date().toISOString(),
        used: false,
        userName: regF.nome,
      }
      await safeSet("yoga_tok", todosTokens, true)
      setTokens(todosTokens)

      setRegLoading(false)
      setScr("pending")
      setMailSt("sending")
      sh("✅ Cadastro realizado! Enviando notificação...","ok", 4000)

      try {
        const resultado = await enviarNotificacao(entrada, codigo)
        if (resultado.web3) {
          setMailSt("sent")
        } else if (resultado.gmail) {
          setMailSt("gmail")
        } else if (resultado.clipboard) {
          setMailSt("clipboard")
        } else {
          setMailSt("fallback")
          abrirGmailCompose(entrada, codigo)
        }
      } catch(emailErro) {
        console.warn("Notificacao erro:", emailErro)
        setMailSt("fallback")
        abrirGmailCompose(entrada, codigo)
      }

    } catch(erroGeral: any) {
      console.error("Erro no cadastro:", erroGeral)
      setRegLoading(false)
      sh(`Erro: ${erroGeral?.message || "Tente novamente"}`, "err")
    }
  }

  const doLogin = async () => {
    if (!loginF.email) return sh("Informe seu e-mail","err")
    const lista = await safeGet("yoga_regs", true) || []
    const found = lista.find((r: any) => r.email === loginF.email)
    if (!found) return sh("E-mail não encontrado. Cadastre-se.","err")
    setUser(found)
    await safeSet("yoga_user", found)
    const aList = await safeGet("yoga_appr", true) || []
    if (aList.includes(found.email)) { setScr("app"); sh(`Bem-vinda(o), ${found.nome?.split(" ")[0]}! 🪷`) }
    else setScr("pending")
  }

  const markDone = async (id: string) => {
    const n = {...prog, [id]:true}
    setProg(n); await safeSet("yoga_prog", n)
    sh("Aula concluída! Parabéns 🎉")
  }

  const saveTasks = async (arr: any[]) => { setTasks(arr); await safeSet("yoga_tasks", arr) }
  const addTask = () => {
    if (!taskF.title) return sh("Informe o título","err")
    saveTasks([...tasks, {...taskF, id:Date.now(), createdAt:new Date().toISOString()}])
    setTaskF({title:"",module:"",assignee:"",deadline:"",status:"pendente",notes:""})
    setShowTF(false); sh("Tarefa criada ✅")
  }
  const changeTS = (id: number, status: string) => saveTasks(tasks.map(t => t.id===id ? {...t,status} : t))
  const delTask = (id: number) => saveTasks(tasks.filter(t => t.id!==id))

  const lotusClick = () => {
    const n = lClicks + 1; setLClicks(n)
    if (lTimer.current) clearTimeout(lTimer.current)
    if (n >= LOTUS_CLICKS) { setScr("admin"); setAdminStep("pw"); setLClicks(0) }
    else lTimer.current = setTimeout(() => setLClicks(0), 3000)
  }

  const approveUser = async (email: string) => {
    const lista = await safeGet("yoga_appr", true) || []
    if (!lista.includes(email)) lista.push(email)
    await safeSet("yoga_appr", lista, true)
    setApprovals(lista); sh(`✅ ${email} aprovado!`)
  }

  const revokeUser = async (email: string) => {
    const lista = (await safeGet("yoga_appr", true) || []).filter((e: string) => e !== email)
    await safeSet("yoga_appr", lista, true)
    setApprovals(lista); sh(`${email} revogado`)
  }

  const resendEmail = async (reg: any) => {
    const all = await safeGet("yoga_tok", true) || {}
    const hit = Object.entries(all).find(([,v]: any) => v.email === reg.email && !v.used)
    let codigo = hit ? (hit[1] as any).code : shortCode()
    if (!hit) {
      const newTok = uuid()
      all[newTok] = {email:reg.email, code:codigo, createdAt:new Date().toISOString(), used:false, userName:reg.nome}
      await safeSet("yoga_tok", all, true)
    }
    const r = await enviarNotificacao(reg, codigo)
    if (!r.web3 && !r.gmail) abrirGmailCompose(reg, codigo)
    sh("📧 E-mail reenviado!")
  }

  const sendAI = async () => {
    if (!aiTxt.trim() || aiLoad) return
    const msg = aiTxt.trim(); setAiTxt("")
    setAiMsgs(c => [...c, {r:"u", t:msg}]); setAiLoad(true)
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"Você é Ananda, professora de yoga carinhosa. Responda sempre em português com emojis de yoga e flores. Dê dicas práticas de posturas, respiração, meditação e bem-estar.",
          messages:[...aiMsgs.map(m=>({role:m.r==="u"?"user":"assistant",content:m.t})),{role:"user",content:msg}]
        })
      })
      const d = await res.json()
      const reply = d.content?.find((c: any)=>c.type==="text")?.text || "🙏 Tente novamente em breve."
      setAiMsgs(c => [...c, {r:"a", t:reply}])
    } catch {
      setAiMsgs(c => [...c, {r:"a", t:"🧘 Estou meditando... tente novamente em instantes."}])
    }
    setAiLoad(false)
  }

  if (scr === "splash") return (
    <div style={{...s.wrap,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
      <style>{CSS}</style>
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        {[P.trq,P.lil,P.cel].map((c,i)=>(<div key={i} style={{position:"absolute",borderRadius:"50%",border:`1.5px solid ${c}44`,width:180+i*130,height:180+i*130,top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:`pulse ${2.5+i}s ease-in-out ${i*.6}s infinite`}}/>))}
      </div>
      <div onClick={lotusClick} style={{cursor:"pointer",animation:"float 3s ease-in-out infinite"}}><Lotus size={88} color={P.trq} spin/></div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:36,color:P.trq,marginTop:18,animation:"fadeUp .8s .3s ease both",opacity:0}}>Yoga em Casa</h1>
      <p style={{color:T.sec,fontStyle:"italic",animation:"fadeUp .8s .6s ease both",opacity:0,marginTop:4}}>Respire. Mova-se. Transforme-se.</p>
      <p style={{fontSize:12,color:T.sec,marginTop:44,animation:"shim 1.8s infinite"}}>🌸 Carregando...</p>
    </div>
  )

  if (scr === "auth") return (
    <div style={{...s.wrap,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto",minHeight:"100vh"}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:440,paddingBottom:40}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div onClick={lotusClick} style={{cursor:"pointer",display:"inline-block"}}><Lotus size={64} color={P.trq} spin/></div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:28,color:P.trq,marginTop:8}}>Yoga em Casa</h1>
          {lClicks > 0 && <p style={{fontSize:11,color:P.lil}}>{"◆".repeat(lClicks)}{"◇".repeat(LOTUS_CLICKS-lClicks)}</p>}
        </div>

        <div style={{display:"flex",background:T.card,borderRadius:12,padding:4,marginBottom:16,border:`1px solid ${T.brd}`}}>
          {[["login","🔑 Entrar"],["register","🌸 Cadastrar"]].map(([k,v])=>(
            <button key={k} onClick={()=>setAuthTab(k)} style={{flex:1,padding:"10px 0",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Nunito',sans-serif",transition:"all .2s",background:authTab===k?P.trq:"transparent",color:authTab===k?"#fff":T.sec}}>{v}</button>
          ))}
        </div>

        <div style={s.card}>
          {authTab === "login" ? (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22}}>Bem-vinda(o) de volta 🙏</h2>
              {[{k:"email",l:"E-mail",t:"email",p:"seu@email.com"},{k:"password",l:"Senha",t:"password",p:"••••••••"}].map((f: any)=>(
                <div key={f.k}><label style={s.lbl}>{f.l}</label>
                  <input style={s.inp} type={f.t} placeholder={f.p} value={(loginF as any)[f.k]}
                    onChange={e=>setLoginF({...loginF,[f.k]:e.target.value})}
                    onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
              ))}
              <button className="hov" onClick={doLogin} style={s.btn(P.trq)}>Entrar →</button>
              <p style={{textAlign:"center",fontSize:13,color:T.sec}}>Sem conta? <span onClick={()=>setAuthTab("register")} style={{color:P.trq,cursor:"pointer",fontWeight:700}}>Cadastre-se</span></p>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22}}>Inicie sua jornada 🌸</h2>
              <div style={{padding:"8px 12px",background:`${P.trq}11`,borderRadius:8,borderLeft:`3px solid ${P.trq}`,fontSize:12,color:T.sec,lineHeight:1.5}}>
                📋 Seus dados são enviados ao administrador para ativação do acesso.
              </div>
              {[
                {k:"nome",    l:"Nome completo *",      t:"text",     p:"Seu nome"},
                {k:"email",   l:"E-mail *",             t:"email",    p:"seu@email.com"},
                {k:"phone",   l:"Telefone / WhatsApp",  t:"tel",      p:"+55 (11) 99999-9999"},
                {k:"idade",   l:"Idade *",              t:"number",   p:"Ex: 28"},
                {k:"password",l:"Criar senha *",        t:"password", p:"Mínimo 6 caracteres"},
              ].map((f: any)=>(
                <div key={f.k}><label style={s.lbl}>{f.l}</label>
                  <input style={s.inp} type={f.t} placeholder={f.p} value={(regF as any)[f.k]}
                    onChange={e=>setRegF({...regF,[f.k]:e.target.value})}/></div>
              ))}
              <div><label style={s.lbl}>País *</label>
                <select style={{...s.inp,cursor:"pointer"}} value={regF.pais} onChange={e=>setRegF({...regF,pais:e.target.value})}>
                  {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                </select></div>
              <div><label style={s.lbl}>Nível de experiência</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {LEVELS.map(l=><button key={l} className={`chip${regF.nivel===l?" on":""}`} onClick={()=>setRegF({...regF,nivel:l})}>{l}</button>)}
                </div></div>
              <div><label style={s.lbl}>Objetivos</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {GOALS.map(g=>{const on=(regF.goals||[]).includes(g);return(
                    <button key={g} className={`chip${on?" on":""}`}
                      onClick={()=>{const c=regF.goals||[];setRegF({...regF,goals:on?c.filter(x=>x!==g):[...c,g]})}}>
                      {g}</button>
                  )})}
                </div></div>
              <div><label style={s.lbl}>Sobre você (opcional)</label>
                <textarea style={{...s.inp,resize:"vertical",minHeight:60}} placeholder="Sua história com yoga..."
                  value={regF.bio} onChange={e=>setRegF({...regF,bio:e.target.value})}/></div>
              <button className="hov" onClick={doRegister} disabled={regLoading}
                style={{...s.btn(P.trq), opacity:regLoading?.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
                {regLoading
                  ? <><span style={{width:16,height:16,border:"2px solid #ffffff44",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/> Salvando...</>
                  : "Enviar Cadastro 🪷"}
              </button>
              <p style={{fontSize:11,color:T.sec,textAlign:"center"}}>Após o cadastro, um código de ativação é enviado ao administrador.</p>
            </div>
          )}
        </div>

        <select value={lang} onChange={e=>setLang(e.target.value)}
          style={{...s.inp,width:"auto",display:"block",margin:"12px auto 0",fontSize:13,padding:"6px 10px"}}>
          {Object.entries(LANGS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </div>
  )

  if (scr === "pending") return (
    <div style={{...s.wrap,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <style>{CSS}</style>
      <div style={{animation:"float 4s ease-in-out infinite"}}><Lotus size={76} color={P.lil} spin/></div>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:26,color:P.lil,marginTop:16}}>Cadastro Realizado 🌸</h2>
      <p style={{color:T.sec,maxWidth:340,marginTop:10,lineHeight:1.7,fontSize:14}}>
        Seus dados foram salvos. Um código de ativação foi enviado para <strong>{ADMIN_EMAIL}</strong>.
        Assim que o administrador aprovar, seu acesso será liberado.
      </p>

      <div style={{...s.card,marginTop:16,maxWidth:380,width:"100%",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <span style={{fontSize:22}}>
            {mailSt==="sent"?"✅":mailSt==="gmail"?"📬":mailSt==="clipboard"?"📋":mailSt==="sending"?"⏳":"📧"}
          </span>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>
              {mailSt==="sent"      ?"✅ E-mail enviado automaticamente!":
               mailSt==="gmail"     ?"📬 Gmail aberto — clique Enviar na nova aba":
               mailSt==="clipboard" ?"📋 Dados copiados para o clipboard":
               mailSt==="sending"   ?"⏳ Enviando notificação...":
               mailSt==="fallback"  ?"⚠️ Use os botões abaixo para notificar":
               "Aguardando envio..."}
            </div>
            <div style={{fontSize:12,color:T.sec}}>Para: {ADMIN_EMAIL}</div>
          </div>
        </div>
      </div>

      <div style={{...s.card,marginTop:12,maxWidth:380,width:"100%"}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:10}}>📬 Ações de Notificação</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <button className="hov" onClick={()=>user&&abrirGmailCompose(user, (Object.values(tokens) as any[]).find((t: any)=>t.email===user?.email&&!t.used)?.code||"XXXXXX")}
            style={{...s.btn(P.trq),fontSize:13,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            📬 Abrir Gmail com dados preenchidos
          </button>
          <button className="hov" onClick={async()=>{
            const cod = (Object.values(tokens) as any[]).find((t: any)=>t.email===user?.email&&!t.used)?.code||"XXXXXX"
            const ok = await copiarParaClipboard(user||{}, cod)
            sh(ok?"📋 Dados copiados! Cole no Gmail.":"Use o botão do Gmail acima.", ok?"ok":"info")
          }} style={{...s.btn(T.cardAlt,T.text),fontSize:13,padding:"10px 16px",boxShadow:"none",border:`1.5px solid ${T.brd}`,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            📋 Copiar todos os dados
          </button>
        </div>
      </div>

      <div style={{...s.card,marginTop:12,maxWidth:380,width:"100%",textAlign:"left"}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:6}}>🔑 Tem um código de ativação?</div>
        <div style={{display:"flex",gap:10}}>
          <input style={{...s.inp,flex:1,textTransform:"uppercase",letterSpacing:4,fontWeight:800,fontSize:18,textAlign:"center"}}
            placeholder="ABC123" maxLength={6} value={actCode}
            onChange={e=>setActCode(e.target.value.toUpperCase())}
            onKeyDown={e=>e.key==="Enter"&&applyCode()}/>
          <button className="hov" onClick={applyCode} style={{...s.btn(P.trq),whiteSpace:"nowrap",padding:"11px 18px"}}>
            {codeSt==="ch"?"...":"Ativar →"}
          </button>
        </div>
      </div>

      <div style={{display:"flex",gap:12,marginTop:16,flexWrap:"wrap",justifyContent:"center"}}>
        <button className="hov" onClick={checkApproval} style={s.btn(P.trq)}>🔄 Verificar Status</button>
        <button onClick={()=>{setUser(null);setScr("auth")}} style={{...s.btn(T.cardAlt,T.sec),boxShadow:"none",border:`1px solid ${T.brd}`}}>← Voltar</button>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </div>
  )

  if (scr === "admin") return (
    <div style={{...s.wrap,padding:20,overflowY:"auto"}}>
      <style>{CSS}</style>
      <div style={{maxWidth:720,margin:"0 auto",paddingBottom:40}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
          <Lotus size={36} color={P.trq}/>
          <div><h1 style={{fontSize:18,fontWeight:800,color:P.trq}}>Painel Administrativo</h1></div>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <button onClick={()=>setDark(!dark)} style={{...s.btn(T.cardAlt,""),padding:"7px 10px",boxShadow:"none",border:`1px solid ${T.brd}`}}>{dark?"☀️":"🌙"}</button>
            <button className="hov" onClick={()=>setScr("auth")} style={{...s.btn(P.brn),padding:"8px 16px",fontSize:13}}>← Sair</button>
          </div>
        </div>

        {adminStep === "pw" ? (
          <div style={{...s.card,maxWidth:340,margin:"50px auto",textAlign:"center"}}>
            <Lotus size={48} color={P.trq} spin/>
            <h3 style={{margin:"12px 0 16px"}}>🔐 Acesso Restrito</h3>
            <input style={{...s.inp,textAlign:"center",marginBottom:12}} type="password"
              placeholder="Senha do administrador" value={adminPw}
              onChange={e=>setAdminPw(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&(adminPw===ADMIN_PASS?setAdminStep("panel"):sh("Senha incorreta","err"))}/>
            <button className="hov" onClick={()=>adminPw===ADMIN_PASS?setAdminStep("panel"):sh("Senha incorreta","err")} style={s.btn(P.trq)}>Entrar</button>
          </div>
        ):(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {[
                {l:"Inscrições",v:regs.length,c:P.trq,i:"📋"},
                {l:"Aprovados",v:approvals.length,c:P.grn,i:"✅"},
                {l:"Pendentes",v:regs.length-approvals.length,c:P.lil,i:"⏳"},
              ].map(x=>(
                <div key={x.l} style={{...s.card,textAlign:"center",padding:14,borderTop:`3px solid ${x.c}`}}>
                  <div style={{fontSize:20}}>{x.i}</div>
                  <div style={{fontSize:26,fontWeight:800,color:x.c}}>{x.v}</div>
                  <div style={{fontSize:11,color:T.sec}}>{x.l}</div>
                </div>
              ))}
            </div>

            <div style={{marginBottom:12}}>
              <input style={s.inp} placeholder="🔍 Buscar..." value={adminQ} onChange={e=>setAdminQ(e.target.value)}/>
            </div>

            <div style={{...s.card,marginBottom:14,borderLeft:`4px solid ${P.gld}`,background:`${P.gld}11`}}>
              <h3 style={{fontWeight:800,marginBottom:6,color:P.gld}}>🔧 Testar Envio de E-mail</h3>
              <p style={{fontSize:12,color:T.sec,marginBottom:10}}>
                Clique para enviar um e-mail de teste para <strong>{ADMIN_EMAIL}</strong> e confirmar as notificações.
              </p>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <button className="hov" onClick={async()=>{
                  setTestEmail("loading")
                  const usuario = {nome:"Teste Admin",email:"admin@yoga.com",idade:"30",pais:"Brasil",nivel:"Iniciante",goals:["Teste"],phone:"99999",bio:"Teste"}
                  const r = await enviarNotificacao(usuario, "TESTE1")
                  if (r.web3)      setTestEmail("web3_ok")
                  else if (r.gmail) setTestEmail("gmail_ok")
                  else if (r.clipboard) setTestEmail("clip_ok")
                  else setTestEmail("falhou")
                  setTimeout(()=>setTestEmail(null), 10000)
                }} disabled={testEmail==="loading"} style={{...s.btn(P.gld,"#fff"),padding:"9px 18px",fontSize:13}}>
                  {testEmail==="loading" ? "⏳ Testando..." : "🧪 Testar Envio Agora"}
                </button>
                {testEmail && testEmail!=="loading" && (
                  <div style={{padding:"10px 14px",borderRadius:10,fontSize:13,fontWeight:700,
                    background: testEmail.includes("ok") ? `${P.grn}22` : `${P.red}22`,
                    color: testEmail.includes("ok") ? P.grn : P.red,
                    border:`1px solid ${testEmail.includes("ok")?P.grn:P.red}44`}}>
                    {testEmail==="web3_ok"  && "✅ Web3Forms funcionou!"}
                    {testEmail==="gmail_ok" && "📬 Gmail aberto!"}
                    {testEmail==="clip_ok"  && "📋 Dados copiados!"}
                    {testEmail==="falhou"   && "❌ Falhou. Verifique o console."}
                  </div>
                )}
              </div>
            </div>

            <div style={s.card}>
              <h3 style={{fontWeight:800,marginBottom:14}}>👥 Inscrições</h3>
              {regs.filter(r=>!adminQ||r.nome?.toLowerCase().includes(adminQ.toLowerCase())||r.email?.toLowerCase().includes(adminQ.toLowerCase())).length === 0
                ? <p style={{color:T.sec,textAlign:"center",padding:20}}>{adminQ?"Sem resultados.":"Nenhuma inscrição ainda."}</p>
                : regs.filter(r=>!adminQ||r.nome?.toLowerCase().includes(adminQ.toLowerCase())||r.email?.toLowerCase().includes(adminQ.toLowerCase())).map(r=>{
                    const ok = approvals.includes(r.email)
                    const tokenEntry = Object.entries(tokens).find(([,v]: any)=>v.email===r.email&&!v.used)
                    const codigo = tokenEntry ? (tokenEntry[1] as any).code : null
                    return (
                      <div key={r.id} style={{borderBottom:`1px solid ${T.brd}`,padding:"14px 0"}}>
                        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                          <div style={{width:42,height:42,borderRadius:"50%",flexShrink:0,background:ok?`${P.grn}22`:`${P.lil}22`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:ok?P.grn:P.lilD}}>
                            {r.nome?.[0]?.toUpperCase()}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:800,fontSize:15}}>{r.nome}</div>
                            <div style={{fontSize:12,color:T.sec,marginTop:2}}>📧 {r.email} · 📞 {r.phone||"—"} · 🌍 {r.pais}</div>
                            <div style={{fontSize:11,color:T.sec}}>🧘 {r.nivel} · 🎯 {(r.goals||[]).join(", ")||"—"}</div>
                            <div style={{fontSize:11,color:T.sec}}>📅 {new Date(r.createdAt).toLocaleString("pt-BR")}</div>
                            {r.bio&&<div style={{fontSize:11,color:T.sec,fontStyle:"italic"}}>💬 {r.bio}</div>}
                            {!ok && codigo && (
                              <div style={{marginTop:8,background:T.cardAlt,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:10}}>
                                <span style={{fontSize:12,color:T.sec}}>🔑 Código:</span>
                                <span style={{fontWeight:800,fontSize:18,letterSpacing:3,color:P.trq}}>{codigo}</span>
                              </div>
                            )}
                            {ok && <span style={{display:"inline-block",marginTop:6,background:`${P.grn}22`,color:P.grn,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>✅ Acesso Ativo</span>}
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
                            {!ok
                              ? <>
                                  <button className="hov" onClick={()=>approveUser(r.email)} style={{...s.btn(P.trq),padding:"7px 14px",fontSize:13}}>✓ Aprovar</button>
                                  <button className="hov" onClick={()=>resendEmail(r)} style={{...s.btn(P.brnL,"#fff"),padding:"6px 12px",fontSize:12}}>📧 Reenviar</button>
                                </>
                              : <button className="hov" onClick={()=>revokeUser(r.email)} style={{...s.btn(P.red,"#fff"),padding:"6px 12px",fontSize:12}}>Revogar</button>
                            }
                          </div>
                        </div>
                      </div>
                    )
                  })
              }
            </div>
          </>
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </div>
  )

  if (scr !== "app") return null
  const allCls = MODULES.flatMap(m => m.classes)
  const done = Object.keys(prog).length

  if (cls) {
    const m = MODULES.find(m => m.classes.find(c => c.id === cls.id))
    return (
      <div style={{...s.wrap,overflowY:"auto"}}>
        <style>{CSS}</style>
        <div style={{maxWidth:680,margin:"0 auto",paddingBottom:50}}>
          <div style={{position:"relative",height:240,overflow:"hidden"}}>
            <img src={cls.img} alt={cls.title} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={(e: any)=>{e.target.style.display="none"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.72),transparent 55%)"}}/>
            <button onClick={()=>{setCls(null);setBreathActive(false);setOpenPose(null);}} style={{position:"absolute",top:14,left:14,background:"rgba(0,0,0,.4)",border:"none",borderRadius:10,color:"#fff",padding:"8px 14px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif"}}>← Voltar</button>
            <div style={{position:"absolute",bottom:16,left:20,right:20}}>
              <span style={{background:`${m?.color}DD`,color:m?.tc||"#fff",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>{cls.level}</span>
              <h1 style={{color:"#fff",fontFamily:"'Playfair Display',serif",fontSize:24,marginTop:6,textShadow:"0 2px 12px rgba(0,0,0,.6)"}}>{cls.title}</h1>
              <p style={{color:"rgba(255,255,255,.85)",fontSize:13}}>⏱ {cls.min} min · {cls.music}</p>
            </div>
          </div>
          <div style={{padding:"0 14px"}}>
            <div style={{...s.card,marginTop:14,padding:0,overflow:"hidden"}}>
              <div style={{background:`${m?.color}22`,padding:"10px 16px",borderBottom:`1px solid ${T.brd}`, fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8}}>
                🎬 Aula em Vídeo
              </div>
              <a href={cls.videoUrl||`https://www.youtube.com/watch?v=${cls.videoId}`}
                target="_blank" rel="noreferrer"
                style={{display:"block",position:"relative",paddingTop:"56.25%",background:"#000",cursor:"pointer",textDecoration:"none"}}>
                <img
                  src={cls.thumb||`https://img.youtube.com/vi/${cls.videoId}/maxresdefault.jpg`}
                  alt={cls.title}
                  style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover"}}
                  onError={(e: any)=>{e.target.src=`https://img.youtube.com/vi/${cls.videoId}/hqdefault.jpg`}}
                />
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.25)"}}>
                  <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(255,0,0,0.92)", display:"flex",alignItems:"center",justifyContent:"center", boxShadow:"0 4px 24px rgba(0,0,0,0.5)",transition:"transform .2s"}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </a>
            </div>

            <div style={{...s.card,marginTop:12,borderLeft:`4px solid ${P.trq}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontWeight:800,fontSize:15}}>🫁 Técnica de Respiração</div></div>
                <button onClick={()=>{
                  if(breathActive){
                    setBreathActive(false)
                    if(breathTimer) clearInterval(breathTimer)
                    setBreathTimer(null)
                    setBreathPhase(0)
                    setBreathCount(0)
                  } else {
                    setBreathActive(true)
                    setBreathPhase(0)
                    setBreathCount(0)
                  }
                }} style={{...s.btn(breathActive?P.red:P.trq),padding:"8px 16px",fontSize:13,flexShrink:0}}>
                  {breathActive?"⏹ Parar":"▶ Iniciar"}
                </button>
              </div>
              {breathActive && cls.breathSteps && (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 0"}}>
                  <div style={{position:"relative",width:140,height:140,marginBottom:16}}>
                    <div style={{ position:"absolute",inset:0,borderRadius:"50%", border:`3px solid ${cls.breathSteps[breathPhase%cls.breathSteps.length]?.color||P.trq}`, animation: cls.breathSteps[breathPhase%cls.breathSteps.length]?.phase?.includes("spire")||cls.breathSteps[breathPhase%cls.breathSteps.length]?.phase?.includes("nha") ? "breathIn 1s ease-in-out forwards" : "breathOut 1s ease-in-out forwards", boxShadow:`0 0 24px ${cls.breathSteps[breathPhase%cls.breathSteps.length]?.color||P.trq}55`, }}/>
                    <div style={{ position:"absolute",inset:16,borderRadius:"50%", background:`${cls.breathSteps[breathPhase%cls.breathSteps.length]?.color||P.trq}22`, display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center", }}>
                      <div style={{fontWeight:800,fontSize:22,color:cls.breathSteps[breathPhase%cls.breathSteps.length]?.color||P.trq}}>{breathCount}</div>
                    </div>
                  </div>
                  <div style={{fontWeight:800,fontSize:20,color:cls.breathSteps[breathPhase%cls.breathSteps.length]?.color||P.trq}}>{cls.breathSteps[breathPhase%cls.breathSteps.length]?.phase}</div>
                  <BreathController steps={cls.breathSteps} active={breathActive} phase={breathPhase} setPhase={setBreathPhase} count={breathCount} setCount={setBreathCount} timer={breathTimer}  setTimer={setBreathTimer} />
                </div>
              )}
            </div>

            <div style={{...s.card,marginTop:12}}>
              <h3 style={{fontWeight:800,marginBottom:8}}>📖 Sobre esta aula</h3>
              <p style={{color:T.sec,lineHeight:1.8,fontSize:14}}>{cls.desc}</p>
            </div>

            <div style={{...s.card,marginTop:12}}>
              <h3 style={{fontWeight:800,marginBottom:12}}>🧘 Posturas da Aula</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {(cls.poses||[]).map((p: any,i: number)=>{
                  const pObj = typeof p === "object" ? p : {name:p, emoji:"🧘", desc:""}
                  const isOpen = openPose === i
                  return (
                    <div key={i}
                      onClick={()=>setOpenPose(isOpen?null:i)}
                      style={{
                        background: isOpen ? `${m?.color||P.trq}18` : T.cardAlt,
                        border:`1.5px solid ${isOpen ? m?.color||P.trq : T.brd}`,
                        borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"all .25s",
                      }}>
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px"}}>
                        <div style={{width:34,height:34,borderRadius:10,background:`${m?.color||P.trq}22`,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                          {pObj.emoji||"🧘"}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:14}}>{pObj.name||pObj}</div>
                        </div>
                        <span style={{color:T.sec,fontSize:16,transition:"transform .25s",
                            transform:isOpen?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>▾</span>
                      </div>
                      {isOpen && pObj.desc && (
                        <div style={{padding:"0 14px 14px",borderTop:`1px solid ${m?.color||P.trq}22`}}>
                          <p style={{color:T.sec,fontSize:14,lineHeight:1.75,margin:0,marginTop:10}}>
                            {pObj.desc}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{...s.card,marginTop:12}}>
              <h3 style={{fontWeight:800,marginBottom:14}}>✨ Benefícios desta Prática</h3>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {(cls.benefits||[]).map((b: any,i: number)=>{
                  const bObj = typeof b === "object" ? b : {text:b, icon:"◆", intensity:75}
                  return (
                    <div key={i}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                        <span style={{fontSize:20,flexShrink:0}}>{bObj.icon||"◆"}</span>
                        <span style={{fontSize:14,fontWeight:600,flex:1}}>{bObj.text||b}</span>
                        <span style={{fontSize:12,color:P.trq,fontWeight:800,flexShrink:0}}>{bObj.intensity||""}%</span>
                      </div>
                      {bObj.intensity && (
                        <div style={{background:T.cardAlt,borderRadius:99,height:6,overflow:"hidden",marginLeft:30}}>
                          <div style={{
                            height:"100%",borderRadius:99,
                            background:`linear-gradient(90deg,${m?.color||P.trq},${P.trq})`,
                            width:`${bObj.intensity}%`,
                            transition:"width 1s ease",
                          }}/>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <button className="hov" onClick={()=>markDone(cls.id)} style={{...s.btn(prog[cls.id]?P.grn:P.trq),width:"100%",marginTop:18,fontSize:16,padding:"14px"}}>
              {prog[cls.id]?"✅ Aula Concluída!":"Marcar como Concluída 🎉"}
            </button>
          </div>
        </div>
        {toast && <Toast msg={toast.msg} type={toast.type}/>}
      </div>
    )
  }

  return (
    <div style={{...s.wrap,paddingBottom:76}}>
      <style>{CSS}</style>

      <div style={{position:"sticky",top:0,zIndex:100,background:T.nav,backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.brd}`,padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}>
        <div onClick={lotusClick} style={{cursor:"pointer"}}><Lotus size={28} color={P.trq}/></div>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,color:P.trq}}>Yoga em Casa</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setDark(!dark)} style={{background:T.cardAlt,border:`1px solid ${T.brd}`,borderRadius:10,padding:"6px 10px",cursor:"pointer",fontSize:15,lineHeight:1}}>{dark?"☀️":"🌙"}</button>
          <div style={{width:32,height:32,borderRadius:"50%",background:`${P.trq}22`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:P.trq,fontSize:14}}>{user?.nome?.[0]?.toUpperCase()||"U"}</div>
        </div>
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"14px 14px 0"}}>
        {tab==="home"&&(
          <div style={{animation:"fadeUp .45s ease both"}}>
            <div style={{...s.card,marginBottom:13,background:`linear-gradient(135deg,${P.trq}18,${P.lil}18)`,border:`1px solid ${P.trq}33`}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <Lotus size={48} color={P.trq} spin/>
                <div><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20}}>Namastê, {user?.nome?.split(" ")[0]} 🙏</h2></div>
              </div>
            </div>
            <div style={{...s.card,marginBottom:13}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <h3 style={{fontWeight:800}}>Progresso Geral</h3>
                <span style={{color:P.trq,fontWeight:800}}>{done}/{allCls.length}</span>
              </div>
              <div style={{background:T.cardAlt,borderRadius:99,height:10,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${P.trq},${P.lil})`,width:`${(done/allCls.length)*100}%`,transition:"width .6s"}}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:13}}>
              {[{i:"🎯",v:done,l:"Aulas"},{i:"📋",v:tasks.filter(t=>t.status!=="concluido").length,l:"Tarefas"},{i:"🔥",v:MODULES.filter(m=>m.classes.some(c=>prog[c.id])).length,l:"Módulos"}].map(x=>(
                <div key={x.l} style={{...s.card,textAlign:"center",padding:12}}>
                  <div style={{fontSize:20}}>{x.i}</div><div style={{fontSize:24,fontWeight:800,color:P.trq}}>{x.v}</div>
                  <div style={{fontSize:11,color:T.sec,marginTop:1}}>{x.l}</div>
                </div>
              ))}
            </div>
            {(()=>{const next=allCls.find(c=>!prog[c.id]);const m=next&&MODULES.find(m=>m.classes.find(c=>c.id===next.id));if(!next)return null;return(
              <div className="cHov" style={{...s.card,marginBottom:13,cursor:"pointer",padding:0,overflow:"hidden"}} onClick={()=>setCls(next)}>
                <div style={{position:"relative",height:120,overflow:"hidden",background:"#000"}}>
                  <img src={next.thumb||`https://img.youtube.com/vi/${next.videoId}/hqdefault.jpg`} alt=""
                    style={{width:"100%",height:"100%",objectFit:"cover",opacity:.8}} onError={(e: any)=>{e.target.src=next.img}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,.6),transparent)"}}>
                    <div style={{padding:"10px 14px"}}>
                      <div style={{fontSize:11,color:P.trq,fontWeight:800,background:"rgba(0,0,0,.5)",display:"inline-block",borderRadius:5,padding:"2px 8px",marginBottom:4}}>▶ PRÓXIMA AULA</div>
                      <div style={{color:"#fff",fontWeight:800,fontSize:16,textShadow:"0 1px 6px rgba(0,0,0,.8)"}}>{next.title}</div>
                      <div style={{color:"rgba(255,255,255,.8)",fontSize:12,marginTop:3}}>⏱ {next.min} min · 🎵 {next.audioLabel||next.music}</div>
                    </div>
                  </div>
                  <div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",width:44,height:44,borderRadius:"50%",background:"rgba(255,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
            )})()}
            <h3 style={{fontWeight:800,marginBottom:10}}>Módulos</h3>
            {MODULES.map(m=>{const d=m.classes.filter(c=>prog[c.id]).length;return(
              <div key={m.id} className="cHov" style={{...s.card,marginBottom:10,cursor:"pointer"}} onClick={()=>{setMod(m);setTab("modules")}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:`${m.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{m.emoji}</div>
                  <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{m.title}</div></div>
                  <span style={{color:T.sec,fontSize:13}}>{d}/{m.classes.length}</span>
                </div>
              </div>
            )})}
          </div>
        )}

        {tab==="modules"&&(
          <div style={{animation:"fadeUp .45s ease both"}}>
            {!mod?(
              <>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,marginBottom:14}}>🧘 Módulos de Yoga</h2>
                {MODULES.map(m=>(
                  <div key={m.id} className="cHov" style={{...s.card,marginBottom:14,cursor:"pointer"}} onClick={()=>setMod(m)}>
                    <div style={{display:"flex",gap:12,marginBottom:10}}><span style={{fontSize:32}}>{m.emoji}</span>
                      <div><div style={{fontWeight:800,fontSize:18}}>{m.title}</div><div style={{fontSize:13,color:T.sec}}>{m.sub}</div></div></div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                      <span style={{background:`${m.color}22`,color:m.tc,borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700}}>{m.level}</span>
                      <span style={{background:T.cardAlt,borderRadius:6,padding:"3px 10px",fontSize:12}}>📚 {m.classes.length} aulas</span>
                      <span style={{background:T.cardAlt,borderRadius:6,padding:"3px 10px",fontSize:12}}>📅 {m.weeks} semanas</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.sec,marginBottom:4}}><span>Progresso</span><span>{m.classes.filter((c: any)=>prog[c.id]).length}/{m.classes.length}</span></div>
                    <div style={{background:T.cardAlt,borderRadius:99,height:8,overflow:"hidden"}}>
                      <div style={{height:"100%",background:m.color,borderRadius:99,width:`${(m.classes.filter((c: any)=>prog[c.id]).length/m.classes.length)*100}%`,transition:"width .5s"}}/>
                    </div>
                  </div>
                ))}
              </>
            ):(
              <>
                <button onClick={()=>setMod(null)} style={{background:"transparent",border:"none",color:T.sec,cursor:"pointer",marginBottom:12,fontSize:13,fontFamily:"'Nunito',sans-serif"}}>← Módulos</button>
                <div style={{...s.card,marginBottom:14,borderTop:`4px solid ${mod.color}`}}>
                  <div style={{fontSize:32,marginBottom:6}}>{mod.emoji}</div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20}}>{mod.title}</h2>
                  <p style={{color:T.sec,fontSize:13,marginTop:4}}>{mod.sub}</p>
                </div>
                {mod.classes.map((c: any,i: number)=>(
                  <div key={c.id} className="cHov" style={{...s.card,marginBottom:12,cursor:"pointer",animation:`fadeUp .4s ${i*.07}s ease both`,opacity:0,padding:0,overflow:"hidden"}} onClick={()=>{setCls(c);setBreathActive(false);setBreathPhase(0);setBreathCount(0);setOpenPose(null);}}>
                    <div style={{position:"relative",height:130,overflow:"hidden",background:"#000"}}>
                      <img
                        src={c.thumb||`https://img.youtube.com/vi/${c.videoId}/hqdefault.jpg`}
                        alt={c.title}
                        style={{width:"100%",height:"100%",objectFit:"cover",opacity:.85}}
                        onError={(e: any)=>{e.target.src=c.img}}
                      />
                      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 12px rgba(0,0,0,.4)"}}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                      {prog[c.id]&&<div style={{position:"absolute",top:8,right:8,background:P.grn,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>✓ Feita</div>}
                      <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,.75)",color:"#fff",borderRadius:5,padding:"2px 7px",fontSize:11,fontWeight:700}}>{c.min} min</div>
                    </div>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:15,marginBottom:3}}>{c.title}</div>
                        <div style={{fontSize:12,color:T.sec,display:"flex",gap:12}}>
                          <span>🎯 {c.level}</span>
                          <span>🎵 {c.audioLabel||c.music}</span>
                        </div>
                      </div>
                      <span style={{color:T.sec,fontSize:22,flexShrink:0}}>›</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab==="tasks"&&(
          <div style={{animation:"fadeUp .45s ease both"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22}}>📋 Tarefas</h2>
              <button className="hov" onClick={()=>setShowTF(!showTF)} style={s.btn(P.trq)}>{showTF?"✕ Cancelar":"+ Nova"}</button>
            </div>
            {showTF&&(
              <div style={{...s.card,marginBottom:14,borderTop:`3px solid ${P.trq}`}}>
                <h3 style={{fontWeight:800,marginBottom:12}}>Nova Tarefa</h3>
                <div style={{display:"flex",flexDirection:"column",gap:11}}>
                  {[{k:"title",l:"Título *",t:"text",p:"Ex: Praticar yoga pela manhã"},{k:"assignee",l:"Responsável",t:"text",p:"Nome"},{k:"deadline",l:"Prazo",t:"date"}].map((f: any)=>(
                    <div key={f.k}><label style={s.lbl}>{f.l}</label>
                      <input style={s.inp} type={f.t} placeholder={f.p||""} value={(taskF as any)[f.k]} onChange={e=>setTaskF({...taskF,[f.k]:e.target.value})}/></div>
                  ))}
                  <div><label style={s.lbl}>Módulo</label>
                    <select style={{...s.inp,cursor:"pointer"}} value={taskF.module} onChange={e=>setTaskF({...taskF,module:e.target.value})}>
                      <option value="">Nenhum</option>
                      {MODULES.map(m=><option key={m.id} value={m.title}>{m.emoji} {m.title}</option>)}
                    </select></div>
                  <div><label style={s.lbl}>Status</label>
                    <select style={{...s.inp,cursor:"pointer"}} value={taskF.status} onChange={e=>setTaskF({...taskF,status:e.target.value})}>
                      <option value="pendente">⏳ Pendente</option><option value="em_progresso">🔄 Em Progresso</option><option value="concluido">✅ Concluído</option>
                    </select></div>
                  <div><label style={s.lbl}>Notas</label>
                    <textarea style={{...s.inp,resize:"vertical",minHeight:60}} value={taskF.notes} onChange={e=>setTaskF({...taskF,notes:e.target.value})}/></div>
                  <button className="hov" onClick={addTask} style={s.btn(P.trq)}>Salvar ✓</button>
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {[{s:"pendente",l:"Pendentes",c:P.lil},{s:"em_progresso",l:"Progresso",c:P.celD},{s:"concluido",l:"Concluídos",c:P.grn}].map(x=>(
                <div key={x.s} style={{...s.card,textAlign:"center",padding:12,borderTop:`3px solid ${x.c}`}}>
                  <div style={{fontSize:22,fontWeight:800,color:x.c}}>{tasks.filter(t=>t.status===x.s).length}</div>
                  <div style={{fontSize:11,color:T.sec}}>{x.l}</div>
                </div>
              ))}
            </div>
            {tasks.length===0
              ? <div style={{...s.card,textAlign:"center",padding:40}}><div style={{fontSize:44,marginBottom:10}}>📋</div><p style={{color:T.sec}}>Nenhuma tarefa ainda.</p></div>
              : tasks.map(t=>{
                  const ST: any ={pendente:{c:P.lil},em_progresso:{c:P.celD},concluido:{c:P.grn}}
                  const st=ST[t.status]||ST.pendente
                  return(
                    <div key={t.id} style={{...s.card,marginBottom:10,borderLeft:`4px solid ${st.c}`,opacity:t.status==="concluido"?.75:1}}>
                      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:15,textDecoration:t.status==="concluido"?"line-through":"none"}}>{t.title}</div>
                          <div style={{fontSize:12,color:T.sec,marginTop:2}}>
                            {t.assignee&&<span>👤 {t.assignee} · </span>}
                            {t.deadline&&<span>📅 {new Date(t.deadline+"T12:00:00").toLocaleDateString("pt-BR")} · </span>}
                            {t.module&&<span>📚 {t.module}</span>}
                          </div>
                          {t.notes&&<p style={{fontSize:12,color:T.sec,marginTop:4,fontStyle:"italic"}}>{t.notes}</p>}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:7,flexShrink:0}}>
                          <select value={t.status} onChange={e=>changeTS(t.id,e.target.value)}
                            style={{background:`${st.c}22`,border:`1px solid ${st.c}`,borderRadius:8,padding:"4px 8px",fontSize:12,color:T.text,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
                            <option value="pendente">⏳ Pendente</option><option value="em_progresso">🔄 Progresso</option><option value="concluido">✅ Concluído</option>
                          </select>
                          <button onClick={()=>delTask(t.id)} style={{background:`${P.red}18`,border:`1px solid ${P.red}44`,borderRadius:8,padding:"4px 8px",fontSize:11,color:P.red,cursor:"pointer"}}>🗑</button>
                        </div>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        )}

        {tab==="ai"&&(
          <div style={{animation:"fadeUp .45s ease both",display:"flex",flexDirection:"column",height:"calc(100vh - 166px)"}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,marginBottom:4}}>🤖 Ananda — IA Professora</h2>
            <p style={{fontSize:13,color:T.sec,marginBottom:12}}>Tire dúvidas sobre yoga, posturas, respiração e bem-estar.</p>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingRight:4}}>
              {aiMsgs.length===0&&(
                <div style={{...s.card,textAlign:"center",padding:28}}>
                  <Lotus size={52} color={P.lil} spin/>
                  <p style={{marginTop:10,color:T.sec,fontSize:14,lineHeight:1.7}}>Olá! Sou Ananda 🌸<br/>Como posso ajudar sua prática?</p>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:12}}>
                    {["Como fazer a postura do guerreiro?","Yoga para iniciantes?","Como respirar na prática?","Benefícios do yin yoga"].map(q=>(
                      <button key={q} className="hov" onClick={()=>setAiTxt(q)} style={{...s.btn(`${P.trq}18`,P.trq),padding:"7px 11px",fontSize:12,boxShadow:"none",border:`1px solid ${P.trq}44`}}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {aiMsgs.map((m,i)=>(
                <div key={i} style={{display:"flex",gap:8,flexDirection:m.r==="u"?"row-reverse":"row",alignItems:"flex-end"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,background:m.r==="u"?P.trq:`${P.lil}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
                    {m.r==="u"?"🧘":<Lotus size={18} color={P.lil}/>}
                  </div>
                  <div style={{background:m.r==="u"?P.trq:T.card,color:m.r==="u"?"#fff":T.text,borderRadius:m.r==="u"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",maxWidth:"78%",fontSize:14,lineHeight:1.65,border:m.r==="a"?`1px solid ${T.brd}`:"none"}}>{m.t}</div>
                </div>
              ))}
              {aiLoad&&(<div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:`${P.lil}33`,display:"flex",alignItems:"center",justifyContent:"center"}}><Lotus size={18} color={P.lil}/></div>
                <div style={{...s.card,padding:"10px 14px"}}><span style={{animation:"shim 1s infinite",display:"inline-block"}}>Ananda está digitando... 🌸</span></div>
              </div>)}
            </div>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              <input style={{...s.inp,flex:1}} placeholder="Pergunte sobre yoga..." value={aiTxt}
                onChange={e=>setAiTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAI()}/>
              <button className="hov" onClick={sendAI} disabled={aiLoad} style={s.btn(P.trq)}>➤</button>
            </div>
          </div>
        )}

        {tab==="profile"&&(
          <div style={{animation:"fadeUp .45s ease both"}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,marginBottom:14}}>👤 Meu Perfil</h2>
            <div style={{...s.card,marginBottom:14,textAlign:"center",padding:28}}>
              <div style={{width:68,height:68,borderRadius:"50%",background:`${P.trq}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,color:P.trq,margin:"0 auto 10px"}}>{user?.nome?.[0]?.toUpperCase()}</div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20}}>{user?.nome}</h3>
              <p style={{color:T.sec,fontSize:13,marginTop:3}}>{user?.email}</p>
            </div>
            <button className="hov" onClick={()=>{setUser(null);setScr("auth");setTab("home")}} style={{...s.btn(P.red,"#fff"),width:"100%",marginTop:14}}>Sair da Conta</button>
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.nav,backdropFilter:"blur(12px)",borderTop:`1px solid ${T.brd}`,display:"flex",justifyContent:"space-around",padding:"6px 0 8px",zIndex:100}}>
        {[{id:"home",i:"🏠",l:"Início"},{id:"modules",i:"🧘",l:"Aulas"},{id:"tasks",i:"📋",l:"Tarefas"},{id:"ai",i:"🤖",l:"IA Yoga"},{id:"profile",i:"👤",l:"Perfil"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setMod(null)}}
            style={{background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 12px",borderRadius:10,fontFamily:"'Nunito',sans-serif",opacity:tab===t.id?1:.45,transition:"all .2s"}}>
            <span style={{fontSize:20}}>{t.i}</span>
            <span style={{fontSize:10,fontWeight:700,color:tab===t.id?P.trq:T.sec}}>{t.l}</span>
          </button>
        ))}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </div>
  )
}

