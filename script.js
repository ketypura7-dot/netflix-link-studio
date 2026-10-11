'use strict';

/**
 * NF Link Studio
 * This page only reformats a Netflix-issued nftoken supplied by the user.
 * It does NOT mint session tokens, verify accounts, or access Netflix APIs.
 * Tokens are held in memory until the page is refreshed and are not persisted.
 */
const DAY_LIMIT = 3;
const STORAGE_KEY = 'nf-link-studio-demo-quota-v1';
const byId = (id) => document.getElementById(id);
const form = byId('generator-form');
const tokenInput = byId('token-input');
const quotaNumber = byId('quota-number');
const quotaProgress = byId('quota-progress');
const generateButton = byId('generate-button');
const quotaWarning = byId('quota-warning');
const formMessage = byId('form-message');
const toastEl = byId('toast');
let generatedLinks = null;
let knownExpiration = null;
let toastTimer = null;

function getDayKey(){
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
function readQuota(){
  try {
    const entry = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return entry && entry.date === getDayKey() ? Math.min(DAY_LIMIT,Math.max(0,Number(entry.used)||0)) : 0;
  } catch { return 0; }
}
function writeQuota(used){
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify({date:getDayKey(),used})); }
  catch { /* localStorage may be unavailable in private browsing */ }
}
let usedToday = readQuota();
function updateQuota(){
  const remaining = DAY_LIMIT - usedToday;
  quotaNumber.textContent = `${remaining} / ${DAY_LIMIT} restantes`;
  quotaProgress.style.width = `${(remaining/DAY_LIMIT)*100}%`;
  generateButton.disabled = remaining <= 0;
  quotaWarning.hidden = remaining > 0;
}
function showMessage(text){formMessage.textContent=text;formMessage.hidden=false;}
function clearMessage(){formMessage.textContent='';formMessage.hidden=true;}
function toast(text){
  toastEl.textContent=text;
  toastEl.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toastEl.classList.remove('visible'),2500);
}

function extractSuppliedToken(raw){
  const value=raw.trim();
  if (!value) throw new Error('Cole um token legítimo ou um link Netflix antes de continuar.');
  let token=value;
  if (/^https?:\/\//i.test(value)) {
    let url;
    try {url=new URL(value);}catch{throw new Error('O link informado não é uma URL válida.');}
    const host=url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || !['netflix.com','www.netflix.com'].includes(host)) {
      throw new Error('Por segurança, só são aceitos links HTTPS de netflix.com.');
    }
    token=url.searchParams.get('nftoken') || '';
    if (!token) throw new Error('O link informado não contém o parâmetro nftoken.');
  }
  // A token may contain +, /, _ and =. No tokens are generated here.
  if (token.length<16 || token.length>4096 || !/^[A-Za-z0-9+/_=.-]+$/.test(token)) {
    throw new Error('O token informado está em um formato inesperado. Confira se foi copiado corretamente.');
  }
  return token;
}
function makeLink(path,token){
  const url=new URL(path,'https://www.netflix.com');
  url.searchParams.set('nftoken',token);
  return url.toString();
}
function formatDate(date){
  return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'medium'}).format(date);
}
function renderLinks(token){
  generatedLinks={
    mobile:makeLink('/unsupported',token),
    web:makeLink('/login',token),
    tv:makeLink('/tv2',token),
  };
  for(const [kind,url] of Object.entries(generatedLinks)) byId(`${kind}-link`).textContent=url;
  const suppliedExpiry=byId('expiration-input').value;
  knownExpiration=suppliedExpiry?new Date(suppliedExpiry):null;
  const expirationValid=knownExpiration && !Number.isNaN(knownExpiration.valueOf());
  byId('expiry-display').textContent=expirationValid ? `Expiração informada: ${formatDate(knownExpiration)} (não verificada)` : 'Expiração: não informada pela ferramenta';
  byId('display-email').textContent=byId('email-input').value.trim() || 'Não informado';
  byId('display-plan').textContent=byId('plan-input').value.trim() || 'Não informado';
  byId('empty-results').hidden=true;
  byId('result-cards').hidden=false;
  byId('clear-button').hidden=false;
}
form.addEventListener('submit',(event)=>{
  event.preventDefault();
  clearMessage();
  if (usedToday>=DAY_LIMIT){showMessage('A cota demonstrativa diária foi atingida neste navegador.');return;}
  let token;
  try {token=extractSuppliedToken(tokenInput.value);} catch(error){showMessage(error.message);return;}
  renderLinks(token);
  usedToday+=1;
  writeQuota(usedToday);
  updateQuota();
  // Remove the token from the form; it remains only in generated links in memory.
  tokenInput.value='';
  toast('Links formatados localmente. Validade não verificada.');
  byId('results-heading').scrollIntoView({behavior:'smooth',block:'start'});
});

async function copyText(value){
  if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(value);return;}
  const temp=document.createElement('textarea');
  temp.value=value;temp.setAttribute('readonly','');temp.style.position='fixed';temp.style.top='-9999px';
  document.body.appendChild(temp);temp.select();
  const copied=document.execCommand('copy');temp.remove();
  if(!copied)throw new Error('Cópia bloqueada');
}
for(const button of document.querySelectorAll('[data-copy]')){
  button.addEventListener('click',async()=>{
    const kind=button.dataset.copy;
    if (!generatedLinks?.[kind]) return;
    try {await copyText(generatedLinks[kind]);toast('Link copiado! Mantenha-o privado.');}
    catch {toast('Não foi possível copiar. Selecione o link manualmente.');}
  });
}
for(const button of document.querySelectorAll('[data-open]')){
  button.addEventListener('click',()=>{
    const kind=button.dataset.open;
    if(!generatedLinks?.[kind])return;
    const tab=window.open(generatedLinks[kind],'_blank','noopener,noreferrer');
    if(!tab)toast('Se nada abriu, permita novas abas neste navegador.');
  });
}
byId('clear-button').addEventListener('click',()=>{
  generatedLinks=null;
  knownExpiration=null;
  for(const kind of ['mobile','web','tv'])byId(`${kind}-link`).textContent='';
  byId('display-email').textContent='Não informado';
  byId('display-plan').textContent='Não informado';
  byId('email-input').value='';
  byId('plan-input').value='';
  byId('expiration-input').value='';
  byId('result-cards').hidden=true;
  byId('empty-results').hidden=false;
  byId('clear-button').hidden=true;
  toast('Resultados removidos da tela.');
});
updateQuota();
