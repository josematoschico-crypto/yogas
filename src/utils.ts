import { P } from "./constants";

export const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3) | 8).toString(16)
});

export const shortCode = () => {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({length:6}, () => c[Math.floor(Math.random() * c.length)]).join("")
};

export const safeGet = async (key: string, shared = false) => {
  try {
    const r = await window.storage.get(key, shared);
    return r ? JSON.parse(r.value) : null;
  } catch (e) {
    console.warn(`storage.get(${key}) falhou:`, e);
    return null;
  }
};

export const safeSet = async (key: string, val: any, shared = false) => {
  try {
    await window.storage.set(key, JSON.stringify(val), shared);
    return true;
  } catch (e) {
    console.warn(`storage.set(${key}) falhou:`, e);
    return false;
  }
};

export function montarMensagem(usuario: any, codigo: string) {
  return [
    "╔══════════════════════════════════════╗",
    "   YOGA EM CASA — Nova Inscrição",
    "╚══════════════════════════════════════╝",
    "",
    "DADOS DO USUÁRIO:",
    "  Nome:      " + (usuario.nome   || "-"),
    "  Email:     " + (usuario.email  || "-"),
    "  Telefone:  " + (usuario.phone  || "-"),
    "  Idade:     " + (usuario.idade  || "-") + " anos",
    "  País:      " + (usuario.pais   || "-"),
    "  Nível:     " + (usuario.nivel  || "-"),
    "  Objetivos: " + ((usuario.goals||[]).join(", ") || "-"),
    "  Bio:       " + (usuario.bio    || "-"),
    "  Data:      " + new Date().toLocaleString("pt-BR"),
    "",
    "══════════════════════════════════════════",
    "CÓDIGO DE ATIVAÇÃO: " + codigo,
    "══════════════════════════════════════════",
    "",
    "→ Use este código no painel admin para aprovar.",
    "→ Ou informe ao usuário para inserir na tela de pendente.",
  ].join("\n")
}

export async function tentarWeb3Forms(usuario: any, codigo: string) {
  try {
    const resp = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: "3c4c25c8-18e1-4940-abf1-6307294127cc",
        subject:    "[Yoga em Casa] Nova Inscrição — " + (usuario.nome || "Novo Usuário"),
        from_name:  "Yoga em Casa",
        email:      "josematos.chico@gmail.com",
        message:    montarMensagem(usuario, codigo),
        botcheck:   false,
      }),
    })
    const json = await resp.json()
    if (resp.ok && json.success) { console.log("✅ Web3Forms OK"); return true }
    console.warn("⚠️ Web3Forms falhou:", json.message)
    return false
  } catch(e: any) {
    console.warn("⚠️ Web3Forms erro de rede:", e.message)
    return false
  }
}

export function abrirGmailCompose(usuario: any, codigo: string) {
  try {
    const assunto = encodeURIComponent("[Yoga em Casa] Nova Inscrição — " + (usuario.nome||""))
    const corpo   = encodeURIComponent(montarMensagem(usuario, codigo))
    const url = "https://mail.google.com/mail/?view=cm" +
                "&to=josematos.chico@gmail.com" +
                "&su=" + assunto +
                "&body=" + corpo
    window.open(url, "_blank")
    return true
  } catch(e) { console.warn("Gmail compose erro:", e); return false }
}

export async function copiarParaClipboard(usuario: any, codigo: string) {
  try {
    await navigator.clipboard.writeText(montarMensagem(usuario, codigo))
    return true
  } catch(e) { return false }
}

export async function enviarNotificacao(usuario: any, codigo: string) {
  const resultado = { web3: false, gmail: false, clipboard: false }
  resultado.web3 = await tentarWeb3Forms(usuario, codigo)
  if (!resultado.web3) {
    resultado.gmail = abrirGmailCompose(usuario, codigo)
  }
  resultado.clipboard = await copiarParaClipboard(usuario, codigo)
  console.log("📧 Resultado notificação:", resultado)
  return resultado
}
