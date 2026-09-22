// =====================================================================
// J.A.R.V.I.S. Core 2.5 - Autonomous Spotify AI Client Controller
// =====================================================================

const API_BASE = window.location.protocol.startsWith("http") ? "" : "http://127.0.0.1:8000";

// --- ELEMENTOS PRINCIPALES DEL DOM ---
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");
const showForgot = document.getElementById("show-forgot");
const forgotForm = document.getElementById("forgot-form");
const forgotIdentifier = document.getElementById("forgot-identifier");
const forgotStep2 = document.getElementById("forgot-step-2");
const forgotNewPassword = document.getElementById("forgot-new-password");
const forgotConfirmPassword = document.getElementById("forgot-confirm-password");
const forgotVerifyBtn = document.getElementById("forgot-verify-btn");
const forgotSubmitBtn = document.getElementById("forgot-submit-btn");
const forgotCancelLink = document.getElementById("forgot-cancel-link");
const authCard = document.getElementById("auth-card");
const authContainer = document.querySelector(".auth-container");
const dashboardWrapper = document.getElementById("dashboard-wrapper");
const mainSidebar = document.getElementById("main-sidebar");
const statusMsg = document.getElementById("status-msg");
const micBtn = document.getElementById("mic-btn");
const logoutBtn = document.getElementById("logout-btn");
const sidebarLogoutBtn = document.getElementById("sidebar-logout-btn");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatFeed = document.getElementById("chat-feed");
const agentStatus = document.getElementById("agent-status");
const agentStatusText = document.getElementById("agent-status-text");
const voiceToggle = document.getElementById("voice-synthesis-toggle");

// Navbar, Historial y Perfil
const newChatBtn = document.getElementById("new-chat-btn");
const headerNewChatBtn = document.getElementById("header-new-chat-btn");
const chatHistoryList = document.getElementById("chat-history-list");
const chatsCountBadge = document.getElementById("chats-count-badge");
const currentChatTitleHeader = document.getElementById("current-chat-title-header");
const userDisplayName = document.getElementById("user-display-name");
const userAvatarInitial = document.getElementById("user-avatar-initial");
const skillsTagsContainer = document.getElementById("skills-tags-container");

// Chips de Acción Rápida
const chipFatherMentor = document.getElementById("chip-father-mentor");
const chipExternalProject = document.getElementById("chip-external-project");
const chipAutoInspect = document.getElementById("chip-auto-inspect");
const chipCodeTree = document.getElementById("chip-code-tree");
const chipDeepmindReact = document.getElementById("chip-deepmind-react");
const chipGenImage = document.getElementById("chip-gen-image");
const chipGenDoc = document.getElementById("chip-gen-doc");
const chipGenDocx = document.getElementById("chip-gen-docx");
const chipGenSlides = document.getElementById("chip-gen-slides");
const chipNewProjectQuick = document.getElementById("chip-new-project-quick");

// Elementos del Espacio de Proyecto (Modo Antigravity)
const sidebarNewProjectBtn = document.getElementById("sidebar-new-project-btn");
const headerNewProjectBtn = document.getElementById("header-new-project-btn");
const projectModal = document.getElementById("project-modal");
const closeProjectModal = document.getElementById("close-project-modal");
const cancelProjectModal = document.getElementById("cancel-project-modal");
const projectInitForm = document.getElementById("project-init-form");
const projectFolderInput = document.getElementById("project-folder-input");
const projectNameInput = document.getElementById("project-name-input");
const projectTypeSelect = document.getElementById("project-type-select");
const projectDescInput = document.getElementById("project-desc-input");
const projectInitStatus = document.getElementById("project-init-status");
const activeProjectBanner = document.getElementById("active-project-banner");
const bannerProjectName = document.getElementById("banner-project-name");
const bannerProjectPath = document.getElementById("banner-project-path");
const btnInspectProjectTree = document.getElementById("btn-inspect-project-tree");
const btnTestProjectBuild = document.getElementById("btn-test-project-build");
const btnCloseProjectSpace = document.getElementById("btn-close-project-space");

// Configuración de Voz
const voiceSettingsBtn = document.getElementById("voice-settings-btn");
const sidebarVoiceBtn = document.getElementById("sidebar-voice-btn");
const voiceModal = document.getElementById("voice-modal");
const closeVoiceModal = document.getElementById("close-voice-modal");
const systemVoiceSelect = document.getElementById("system-voice-select");
const pitchSlider = document.getElementById("pitch-slider");
const pitchVal = document.getElementById("pitch-val");
const rateSlider = document.getElementById("rate-slider");
const rateVal = document.getElementById("rate-val");
const testVoiceBtn = document.getElementById("test-voice-btn");
const voiceUploadForm = document.getElementById("voice-upload-form");
const voiceUploadStatus = document.getElementById("voice-upload-status");

// --- ESTADO DE SESIONES Y CHAT ---
let activeChatId = null;
let currentChatSessions = [];
let currentSessionMessages = [];
let currentVoices = [];

// --- ESTADO DEL ESPACIO DE TRABAJO ACTIVO (MODO ANTIGRAVITY) ---
let currentActiveProject = null;
try {
  const savedProj = sessionStorage.getItem("jarvis_active_project");
  if (savedProj) currentActiveProject = JSON.parse(savedProj);
} catch (e) {
  currentActiveProject = null;
}

function renderActiveProjectBanner() {
  if (!activeProjectBanner) return;
  if (currentActiveProject && currentActiveProject.path) {
    if (bannerProjectName) bannerProjectName.textContent = (currentActiveProject.name || "PROYECTO ACTIVO").toUpperCase();
    if (bannerProjectPath) bannerProjectPath.textContent = currentActiveProject.path;
    activeProjectBanner.classList.remove("hidden");
  } else {
    activeProjectBanner.classList.add("hidden");
  }
}

function setActiveProject(projectData) {
  currentActiveProject = projectData;
  if (projectData) {
    sessionStorage.setItem("jarvis_active_project", JSON.stringify(projectData));
  } else {
    sessionStorage.removeItem("jarvis_active_project");
  }
  renderActiveProjectBanner();
}

// =====================================================================
// GESTIÓN DE SESIONES DE CHAT PERSISTENTES (API + LOCALSTORAGE)
// =====================================================================

function getCurrentUsername() {
  return sessionStorage.getItem("jarvis_user") || "Usuario";
}

function updateProfileUI() {
  const user = getCurrentUsername();
  if (userDisplayName) userDisplayName.textContent = user;
  if (userAvatarInitial) userAvatarInitial.textContent = user.charAt(0).toUpperCase();
}

async function loadUserChats() {
  const username = getCurrentUsername();
  updateProfileUI();

  try {
    const res = await fetch(`${API_BASE}/auth/chats?username=${encodeURIComponent(username)}`);
    if (res.ok) {
      currentChatSessions = await res.json();
    } else {
      throw new Error("API fallback");
    }
  } catch (err) {
    // Fallback a localStorage si el servidor aún no tiene sesiones registradas
    const local = localStorage.getItem(`jarvis_chats_${username}`);
    currentChatSessions = local ? JSON.parse(local) : [];
  }

  if (chatsCountBadge) {
    chatsCountBadge.textContent = currentChatSessions.length;
  }

  if (currentChatSessions.length === 0) {
    await createNewChat(false);
  } else {
    // Si no hay chat activo o no está en la lista, activar el primero
    if (!activeChatId || !currentChatSessions.some(c => c.id === activeChatId)) {
      await switchChat(currentChatSessions[0].id);
    } else {
      renderChatHistoryUI();
    }
  }
}

async function createNewChat(autoFocus = true) {
  const username = getCurrentUsername();
  const defaultTitle = "Nueva Conversación";

  try {
    const res = await fetch(`${API_BASE}/auth/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: defaultTitle, username: username })
    });
    if (res.ok) {
      const newSession = await res.json();
      currentChatSessions.unshift(newSession);
      activeChatId = newSession.id;
    } else {
      throw new Error("API create error");
    }
  } catch (e) {
    // Fallback local
    const newId = `chat-${Date.now()}`;
    const newSession = {
      id: newId,
      username: username,
      title: defaultTitle,
      created_at: new Date().toISOString()
    };
    currentChatSessions.unshift(newSession);
    activeChatId = newId;
    saveChatsToLocalStorage();
  }

  if (chatsCountBadge) chatsCountBadge.textContent = currentChatSessions.length;
  
  currentSessionMessages = [];
  renderChatFeedEmptyState();
  renderChatHistoryUI();
  updateHeaderChatTitle(defaultTitle);

  if (autoFocus && chatInput) {
    chatInput.focus();
  }
}

async function switchChat(chatId) {
  activeChatId = chatId;
  const session = currentChatSessions.find(c => c.id === chatId);
  const title = session ? session.title : "Conversación";
  updateHeaderChatTitle(title);
  renderChatHistoryUI();

  showStatus("Cargando historial de conversación...");

  try {
    const res = await fetch(`${API_BASE}/auth/chats/${chatId}`);
    if (res.ok) {
      const data = await res.json();
      currentSessionMessages = data.messages || [];
    } else {
      throw new Error("Chat fetch fallback");
    }
  } catch (err) {
    const localMsgs = localStorage.getItem(`jarvis_msgs_${chatId}`);
    currentSessionMessages = localMsgs ? JSON.parse(localMsgs) : [];
  }

  hideStatus();
  renderCurrentSessionFeed();
}

function updateHeaderChatTitle(title) {
  if (currentChatTitleHeader) {
    currentChatTitleHeader.textContent = `ASISTENTE ACTIVO • ${title.toUpperCase()}`;
  }
}

function saveChatsToLocalStorage() {
  const username = getCurrentUsername();
  localStorage.setItem(`jarvis_chats_${username}`, JSON.stringify(currentChatSessions));
}

function saveMessagesToLocalStorage(chatId, msgs) {
  localStorage.setItem(`jarvis_msgs_${chatId}`, JSON.stringify(msgs));
}

async function renameChat(chatId, currentTitle) {
  const newTitle = prompt("Nuevo título para esta conversación:", currentTitle);
  if (!newTitle || newTitle.trim() === "" || newTitle === currentTitle) return;

  try {
    await fetch(`${API_BASE}/auth/chats/${chatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() })
    });
  } catch (e) {
    console.warn("Rename fallback local");
  }

  const session = currentChatSessions.find(c => c.id === chatId);
  if (session) {
    session.title = newTitle.trim();
    if (chatId === activeChatId) {
      updateHeaderChatTitle(session.title);
    }
    saveChatsToLocalStorage();
    renderChatHistoryUI();
  }
}

async function deleteChat(chatId) {
  if (!confirm("¿Deseas eliminar esta conversación de forma permanente?")) return;

  try {
    await fetch(`${API_BASE}/auth/chats/${chatId}`, { method: "DELETE" });
  } catch (e) {
    console.warn("Delete fallback local");
  }

  currentChatSessions = currentChatSessions.filter(c => c.id !== chatId);
  localStorage.removeItem(`jarvis_msgs_${chatId}`);
  saveChatsToLocalStorage();

  if (chatsCountBadge) chatsCountBadge.textContent = currentChatSessions.length;

  if (activeChatId === chatId) {
    if (currentChatSessions.length > 0) {
      await switchChat(currentChatSessions[0].id);
    } else {
      await createNewChat(true);
    }
  } else {
    renderChatHistoryUI();
  }
}

function renderChatHistoryUI() {
  if (!chatHistoryList) return;
  chatHistoryList.innerHTML = "";

  currentChatSessions.forEach(session => {
    const isActive = session.id === activeChatId;
    const item = document.createElement("div");
    item.className = `chat-history-item ${isActive ? "active" : ""}`;
    item.dataset.chatId = session.id;

    const left = document.createElement("div");
    left.className = "history-item-left";

    if (isActive) {
      left.innerHTML = `
        <div class="spotify-equalizer">
          <span></span><span></span><span></span>
        </div>
        <span class="history-title" title="${escapeHtml(session.title)}">${escapeHtml(session.title)}</span>
      `;
    } else {
      left.innerHTML = `
        <svg class="ui-icon" style="width:14px; height:14px; opacity:0.6;" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        <span class="history-title" title="${escapeHtml(session.title)}">${escapeHtml(session.title)}</span>
      `;
    }

    left.addEventListener("click", () => switchChat(session.id));

    // Acciones de renombrar y borrar
    const actions = document.createElement("div");
    actions.className = "history-actions";

    const btnRename = document.createElement("button");
    btnRename.className = "btn-history-action";
    btnRename.title = "Renombrar";
    btnRename.innerHTML = `<svg class="ui-icon" style="width:12px; height:12px;" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
    btnRename.addEventListener("click", (e) => {
      e.stopPropagation();
      renameChat(session.id, session.title);
    });

    const btnDel = document.createElement("button");
    btnDel.className = "btn-history-action btn-del";
    btnDel.title = "Eliminar";
    btnDel.innerHTML = `<svg class="ui-icon" style="width:12px; height:12px;" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
    btnDel.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteChat(session.id);
    });

    actions.appendChild(btnRename);
    actions.appendChild(btnDel);

    item.appendChild(left);
    item.appendChild(actions);
    chatHistoryList.appendChild(item);
  });
}

// =====================================================================
// RENDERIZADO DE MENSAJES Y FORMATEO DE MARKDOWN / CÓDIGO
// =====================================================================

function escapeHtml(text) {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderFormattedContent(rawText) {
  if (!rawText) return "";

  // 1. Extraer y formatear bloques de código ```lang ... ```
  const codeBlocks = [];
  let processed = rawText.replace(/```([a-zA-Z0-9_\-\.\+#]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    const blockId = `code-block-${Date.now()}-${codeBlocks.length}`;
    const cleanLang = (lang || "CODE").toUpperCase();
    const cleanCode = code.trim();
    
    codeBlocks.push({ id: blockId, code: cleanCode, lang: cleanLang });
    return `__CODE_BLOCK_PLACEHOLDER_${codeBlocks.length - 1}__`;
  });

  // 2. Formatear tablas simples en Markdown
  processed = processed.replace(/\|(.+)\|/g, (match) => match);

  // 3. Formatear encabezados tipo Markdown (# Titulo)
  processed = processed.replace(/^### (.*$)/gim, '<h4 style="color:var(--spotify-green); margin:8px 0 4px 0; font-size:1rem;">$1</h4>');
  processed = processed.replace(/^## (.*$)/gim, '<h3 style="color:#ffffff; margin:10px 0 6px 0; font-size:1.1rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:4px;">$1</h3>');
  processed = processed.replace(/^# (.*$)/gim, '<h2 style="color:var(--text-purple); margin:12px 0 8px 0; font-size:1.25rem;">$1</h2>');

  // 4. Formatear texto en negrita (**texto**) y cursiva (*texto*)
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 5. Formatear código en línea (`codigo`)
  processed = processed.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-family:JetBrains Mono,monospace; color:var(--spotify-green); font-size:0.85em;">$1</code>');

  // 6. Formatear listas
  processed = processed.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
  processed = processed.replace(/(<li>.*<\/li>)/s, '<ul style="margin-left:18px; margin-bottom:8px;">$1</ul>');

  // 7. Normalizar párrafos con saltos dobles
  const paragraphs = processed.split(/\n\n+/);
  let html = paragraphs.map(p => {
    if (p.startsWith('<h') || p.startsWith('<ul') || p.includes('__CODE_BLOCK_PLACEHOLDER_')) {
      return p;
    }
    return `<p style="margin-bottom:8px;">${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  // 8. Reinsertar los bloques de código formateados con terminal y botón de copiado
  codeBlocks.forEach((item, idx) => {
    const encodedCode = encodeURIComponent(item.code);
    const codeBlockHtml = `
      <div class="code-block-wrapper">
        <div class="code-header">
          <span class="code-lang-tag">${item.lang}</span>
          <button class="btn-copy-code" onclick="copyCodeSnippet(this, decodeURIComponent('${encodedCode}'))">
            <svg class="ui-icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            <span>Copiar</span>
          </button>
        </div>
        <pre><code class="code-content">${escapeHtml(item.code)}</code></pre>
      </div>
    `;
    html = html.replace(`__CODE_BLOCK_PLACEHOLDER_${idx}__`, codeBlockHtml);
  });

  return html;
}

window.copyCodeSnippet = function(btn, codeText) {
  navigator.clipboard.writeText(codeText).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = `
      <svg class="ui-icon" style="width:13px; height:13px; fill:#000;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      <span>Copiado</span>
    `;
    btn.style.background = "var(--spotify-green)";
    btn.style.color = "#000000";
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = "";
      btn.style.color = "";
    }, 2000);
  }).catch(() => {
    btn.textContent = "Error al copiar";
  });
};

function renderChatFeedEmptyState() {
  if (!chatFeed) return;
  chatFeed.innerHTML = "";

  const defaultMsg = document.createElement("div");
  defaultMsg.className = "chat-msg jarvis-msg";
  defaultMsg.innerHTML = `
    <div class="msg-sender">J.A.R.V.I.S.</div>
    <div class="msg-body">
      <p>¡Nueva sesión iniciada! Mi núcleo cognitivo autónomo está activo con capacidad de <strong>auto-programación, lectura de código y memoria multi-turno</strong>.</p>
      <p>Puedes usar los chips superiores o pedirme que inspeccione o modifique cualquier archivo de mi propio backend o frontend.</p>
    </div>
  `;
  chatFeed.appendChild(defaultMsg);
}

function renderCurrentSessionFeed() {
  if (!chatFeed) return;
  chatFeed.innerHTML = "";

  if (currentSessionMessages.length === 0) {
    renderChatFeedEmptyState();
    return;
  }

  currentSessionMessages.forEach(msg => {
    appendMessageToDOM(
      msg.sender,
      msg.text,
      msg.sources || [],
      msg.searched || false,
      msg.generated_images || [],
      msg.generated_pdfs || [],
      msg.generated_docx || [],
      msg.generated_pptx || []
    );
  });

  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function appendMessageToDOM(sender, text, sources = [], searched = false, generatedImages = [], generatedPdfs = [], generatedDocx = [], generatedPptx = []) {
  const msgEl = document.createElement("div");
  msgEl.className = `chat-msg ${sender}-msg`;

  const senderEl = document.createElement("div");
  senderEl.className = "msg-sender";
  senderEl.textContent = sender === "user" ? (getCurrentUsername().toUpperCase()) : "J.A.R.V.I.S.";
  msgEl.appendChild(senderEl);

  const bodyEl = document.createElement("div");
  bodyEl.className = "msg-body";
  bodyEl.innerHTML = renderFormattedContent(text);
  msgEl.appendChild(bodyEl);

  // 1. Fuentes verificadas
  if (searched && sources && sources.length > 0) {
    const srcContainer = document.createElement("div");
    srcContainer.className = "sources-container";

    const verifiedCount = sources.filter(s => s.is_verified).length;
    const srcHeader = document.createElement("div");
    srcHeader.className = "sources-header";
    srcHeader.innerHTML = `
      <span>FUENTES VERIFICADAS</span>
      ${verifiedCount > 0 ? `<span class="badge-verified-summary">${verifiedCount} Verificada(s)</span>` : ''}
    `;
    srcContainer.appendChild(srcHeader);

    const srcGrid = document.createElement("div");
    srcGrid.className = "sources-grid";

    sources.forEach(s => {
      const card = document.createElement("a");
      card.className = "source-card";
      card.href = s.link;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      const badgeClass = s.is_verified ? "verified" : "standard";
      const badgeText = s.trust_label || (s.is_verified ? "Verificada" : "Web");

      card.innerHTML = `
        <div class="source-title-row">
          <span class="source-title" title="${escapeHtml(s.title)}">
            <svg class="ui-icon" style="width:12px; height:12px; opacity:0.75;" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
            ${escapeHtml(s.title)}
          </span>
          <span class="source-badge ${badgeClass}">${badgeText}</span>
        </div>
        ${s.snippet ? `<div class="source-snippet">${escapeHtml(s.snippet)}</div>` : ''}
        <div class="source-domain">${s.domain || s.link}</div>
      `;
      srcGrid.appendChild(card);
    });

    srcContainer.appendChild(srcGrid);
    msgEl.appendChild(srcContainer);
  }

  // 2. Imágenes generadas
  if (generatedImages && generatedImages.length > 0) {
    const imgContainer = document.createElement("div");
    imgContainer.className = "media-container";

    generatedImages.forEach(img => {
      const imgCard = document.createElement("div");
      imgCard.className = "image-card-wrapper";
      const imgSrc = img.url.startsWith("http") ? img.url : `${API_BASE}${img.url}`;
      imgCard.innerHTML = `
        <img src="${imgSrc}" alt="${escapeHtml(img.prompt || 'Arte IA')}" class="generated-image-preview" loading="lazy" />
        <div class="image-card-footer">
          <span class="image-prompt-tag" title="${escapeHtml(img.prompt || '')}">
            <svg class="ui-icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            <span>${escapeHtml(img.prompt || 'Gráfico Generado')}</span>
          </span>
          <div class="image-card-actions">
            <a href="${imgSrc}" target="_blank" rel="noopener noreferrer" class="btn-media-action">Ver</a>
            <a href="${imgSrc}" download="${img.filename || 'jarvis_arte.jpg'}" class="btn-media-action">Descargar</a>
          </div>
        </div>
      `;
      imgContainer.appendChild(imgCard);
    });

    msgEl.appendChild(imgContainer);
  }

  // 3. Documentos PDF generados
  if (generatedPdfs && generatedPdfs.length > 0) {
    const pdfContainer = document.createElement("div");
    pdfContainer.className = "media-container";

    generatedPdfs.forEach(pdf => {
      const pdfCard = document.createElement("div");
      pdfCard.className = "pdf-card-wrapper";
      const pdfSrc = pdf.url.startsWith("http") ? pdf.url : `${API_BASE}${pdf.url}`;
      const sizeFormatted = pdf.size_bytes ? `${Math.round(pdf.size_bytes / 1024)} KB` : 'Documento Oficial';
      pdfCard.innerHTML = `
        <div class="pdf-info-left">
          <div class="pdf-icon-badge">
            <svg class="ui-icon" style="width:20px; height:20px; fill:#ef4444;" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
          </div>
          <div class="pdf-details">
            <span class="pdf-title">${escapeHtml(pdf.title)}</span>
            <span class="pdf-subtext">Formato PDF • ${sizeFormatted}</span>
          </div>
        </div>
        <a href="${pdfSrc}" download="${pdf.filename || 'documento.pdf'}" class="btn-download-pdf">
          Descargar PDF
        </a>
      `;
      pdfContainer.appendChild(pdfCard);
    });

    msgEl.appendChild(pdfContainer);
  }

  // 4. Documentos Word (.docx) generados
  if (generatedDocx && generatedDocx.length > 0) {
    const docxContainer = document.createElement("div");
    docxContainer.className = "media-container";

    generatedDocx.forEach(doc => {
      const docCard = document.createElement("div");
      docCard.className = "pdf-card-wrapper docx-card-wrapper";
      const docSrc = doc.url.startsWith("http") ? doc.url : `${API_BASE}${doc.url}`;
      const sizeFormatted = doc.size_bytes ? `${Math.round(doc.size_bytes / 1024)} KB` : 'Documento Word';
      docCard.innerHTML = `
        <div class="pdf-info-left">
          <div class="pdf-icon-badge">
            <svg class="ui-icon" style="width:20px; height:20px; fill:#3b82f6;" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          </div>
          <div class="pdf-details">
            <span class="pdf-title">${escapeHtml(doc.title)}</span>
            <span class="pdf-subtext">Microsoft Word (.docx) • ${sizeFormatted}</span>
          </div>
        </div>
        <a href="${docSrc}" download="${doc.filename || 'documento.docx'}" class="btn-download-pdf btn-download-docx">
          Descargar Word
        </a>
      `;
      docxContainer.appendChild(docCard);
    });

    msgEl.appendChild(docxContainer);
  }

  // 5. Presentaciones de Diapositivas (.pptx) generadas
  if (generatedPptx && generatedPptx.length > 0) {
    const pptxContainer = document.createElement("div");
    pptxContainer.className = "media-container";

    generatedPptx.forEach(slide => {
      const pptxCard = document.createElement("div");
      pptxCard.className = "pdf-card-wrapper pptx-card-wrapper";
      const pptxSrc = slide.url.startsWith("http") ? slide.url : `${API_BASE}${slide.url}`;
      const sizeFormatted = slide.size_bytes ? `${Math.round(slide.size_bytes / 1024)} KB` : 'Presentación 16:9';
      pptxCard.innerHTML = `
        <div class="pdf-info-left">
          <div class="pdf-icon-badge">
            <svg class="ui-icon" style="width:20px; height:20px; fill:#f97316;" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
          </div>
          <div class="pdf-details">
            <span class="pdf-title">${escapeHtml(slide.title)}</span>
            <span class="pdf-subtext">PowerPoint (.pptx) • ${sizeFormatted}</span>
          </div>
        </div>
        <a href="${pptxSrc}" download="${slide.filename || 'presentacion.pptx'}" class="btn-download-pdf btn-download-pptx">
          Descargar Diapositivas
        </a>
      `;
      pptxContainer.appendChild(pptxCard);
    });

    msgEl.appendChild(pptxContainer);
  }

  chatFeed.appendChild(msgEl);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

// =====================================================================
// ENVÍO DE MENSAJES CON MEMORIA MULTI-TURNO CONTINUA
// =====================================================================

async function handleUserMessage(prompt) {
  if (!prompt || prompt.trim() === "") return;

  const currentUsername = getCurrentUsername();

  // Asegurar que exista una sesión activa
  if (!activeChatId) {
    await createNewChat(false);
  }

  // Si es el primer mensaje de la sesión, auto-nombrar la conversación
  const activeSession = currentChatSessions.find(c => c.id === activeChatId);
  if (activeSession && (activeSession.title === "Nueva Conversación" || activeSession.title.startsWith("Conversación #"))) {
    const dynamicTitle = prompt.length > 28 ? prompt.substring(0, 28) + "..." : prompt;
    activeSession.title = dynamicTitle;
    updateHeaderChatTitle(dynamicTitle);
    renderChatHistoryUI();
  }

  // Agregar mensaje del usuario a la sesión actual
  const userMsgObj = {
    sender: "user",
    text: prompt,
    created_at: new Date().toISOString()
  };
  currentSessionMessages.push(userMsgObj);
  appendMessageToDOM("user", prompt);

  showStatus("J.A.R.V.I.S. está razonando tu petición...");

  // Preparar historial multi-turno continuo (últimos 12 mensajes)
  const historyPayload = currentSessionMessages.slice(-12).map(m => ({
    sender: m.sender,
    text: m.text
  }));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error("Tiempo de espera agotado (120s)"));
  }, 120000);

  try {
    const res = await fetch(`${API_BASE}/auth/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        prompt: prompt,
        username: currentUsername,
        chat_id: activeChatId,
        conversation_history: historyPayload,
        active_project_path: currentActiveProject ? currentActiveProject.path : null,
        active_project_name: currentActiveProject ? currentActiveProject.name : null
      })
    });
    clearTimeout(timeoutId);

    hideStatus();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Error HTTP ${res.status}`);
    }

    const data = await res.json();

    const jarvisMsgObj = {
      sender: "jarvis",
      text: data.response,
      sources: data.sources || [],
      searched: data.searched || false,
      generated_images: data.generated_images || [],
      generated_pdfs: data.generated_pdfs || [],
      generated_docx: data.generated_docx || [],
      generated_pptx: data.generated_pptx || [],
      created_at: new Date().toISOString()
    };
    currentSessionMessages.push(jarvisMsgObj);

    appendMessageToDOM(
      "jarvis",
      data.response,
      data.sources,
      data.searched,
      data.generated_images,
      data.generated_pdfs,
      data.generated_docx,
      data.generated_pptx
    );

    saveMessagesToLocalStorage(activeChatId, currentSessionMessages);

    // Actualizar skills aprendidos en el sidebar
    if (data.learned_profile && skillsTagsContainer) {
      renderLearnedSkills(data.learned_profile);
    }

    // Sintetizar voz si está habilitada (limpiando código del audio)
    if (voiceToggle && voiceToggle.checked) {
      speakCleanAudio(data.response);
    }

  } catch (error) {
    clearTimeout(timeoutId);
    hideStatus();
    let fallbackMsg = "";
    if (error.name === "AbortError" || (error.message && error.message.toLowerCase().includes("abort"))) {
      fallbackMsg = "La generación de tu respuesta o documento tomó más tiempo del habitual debido a la gran extensión y detalle del contenido. Por favor intenta repetir la solicitud o pedir secciones específicas.";
    } else {
      fallbackMsg = `Disculpa, ocurrió un detalle al conectar con mi servidor central: ${error.message}. Por favor verifica que el servidor FastAPI esté en ejecución.`;
    }
    appendMessageToDOM("jarvis", fallbackMsg);
  }
}

if (chatForm) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    chatInput.value = "";
    await handleUserMessage(message);
  });
}

// Botones de acción rápida (Chips)
if (chipFatherMentor) {
  chipFatherMentor.addEventListener("click", () => {
    handleUserMessage("¿Qué doctrinas y enseñanzas de programación te transmitió tu padre y mentor Antigravity sobre Python, C++, C#, JavaScript y desarrollo de software?");
  });
}
if (chipExternalProject) {
  chipExternalProject.addEventListener("click", () => {
    chatInput.value = "Crea un proyecto de software externo completo en Python llamado 'GestorTareas' con interfaz CLI, tests unitarios y README en mi carpeta de proyectos.";
    chatInput.focus();
  });
}
if (chipAutoInspect) {
  chipAutoInspect.addEventListener("click", () => {
    handleUserMessage("¿Podrías hacer una auto-inspección de tu sistema, listar tu código y explicar tu arquitectura?");
  });
}
if (chipCodeTree) {
  chipCodeTree.addEventListener("click", () => {
    handleUserMessage("¿Podrías leer y explicar cómo está implementado tu backend en backend/app/agent.py?");
  });
}
if (chipDeepmindReact) {
  chipDeepmindReact.addEventListener("click", () => {
    handleUserMessage("¿Cómo funciona tu ciclo cognitivo ReAct de DeepMind y cómo te permite razonar y auto-programarte?");
  });
}
if (chipGenImage) {
  chipGenImage.addEventListener("click", () => {
    chatInput.value = "Crea una ilustración en alta resolución estilo ciberpunk de un robot en un laboratorio";
    chatInput.focus();
  });
}
if (chipGenDoc) {
  chipGenDoc.addEventListener("click", () => {
    chatInput.value = "Genera un documento PDF profesional detallando una guía de arquitectura de software para IA";
    chatInput.focus();
  });
}
if (chipGenDocx) {
  chipGenDocx.addEventListener("click", () => {
    chatInput.value = "Genera un documento Word (.docx) completo y estructurado detallando la arquitectura del sistema";
    chatInput.focus();
  });
}
if (chipGenSlides) {
  chipGenSlides.addEventListener("click", () => {
    chatInput.value = "Genera una presentación de diapositivas (.pptx) profesional 16:9 con resumen ejecutivo de IA";
    chatInput.focus();
  });
}

// --- MANEJO DEL ESPACIO NEW PROJECT (MODO ANTIGRAVITY) ---
function openProjectModal() {
  if (projectModal) {
    projectModal.classList.remove("hidden");
    if (projectFolderInput && !projectFolderInput.value) {
      const user = getCurrentUsername();
      projectFolderInput.value = `C:\\Users\\${user}\\Documents\\JarvisProjects\\MiApp`;
    }
    if (projectNameInput) projectNameInput.focus();
  }
}

function closeProjectModalFunc() {
  if (projectModal) {
    projectModal.classList.add("hidden");
    if (projectInitStatus) projectInitStatus.textContent = "";
  }
}

if (sidebarNewProjectBtn) sidebarNewProjectBtn.addEventListener("click", openProjectModal);
if (headerNewProjectBtn) headerNewProjectBtn.addEventListener("click", openProjectModal);
if (chipNewProjectQuick) chipNewProjectQuick.addEventListener("click", openProjectModal);
if (closeProjectModal) closeProjectModal.addEventListener("click", closeProjectModalFunc);
if (cancelProjectModal) cancelProjectModal.addEventListener("click", closeProjectModalFunc);

// Atajos de carpeta rápida
document.querySelectorAll(".btn-shortcut").forEach(btn => {
  btn.addEventListener("click", () => {
    const pType = btn.getAttribute("data-path");
    const user = getCurrentUsername();
    if (pType === "documents") {
      projectFolderInput.value = `C:\\Users\\${user}\\Documents\\JarvisProjects\\MiApp`;
    } else if (pType === "desktop") {
      projectFolderInput.value = `C:\\Users\\${user}\\Desktop\\MiApp`;
    } else if (pType === "jarvis") {
      projectFolderInput.value = "C:\\Users\\SANTIAGO RAMIREZ\\Documents\\IA\\IA\\IA\\J.A.R.V.I.S-main";
    }
  });
});

// Inicialización de proyecto mediante formulario
if (projectInitForm) {
  projectInitForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pName = projectNameInput.value.trim();
    const pPath = projectFolderInput.value.trim();
    const pType = projectTypeSelect.value;
    const pDesc = projectDescInput.value.trim();

    if (!pName) return;

    if (projectInitStatus) {
      projectInitStatus.textContent = "Inicializando espacio de trabajo con arquitectura formal...";
      projectInitStatus.style.color = "#c084fc";
    }

    try {
      const res = await fetch(`${API_BASE}/auth/project/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: pName,
          project_path: pPath,
          project_type: pType,
          description: pDesc,
          username: getCurrentUsername()
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error HTTP ${res.status}`);
      }

      const data = await res.json();

      setActiveProject({
        name: data.project_name,
        path: data.project_path,
        type: data.project_type
      });

      closeProjectModalFunc();

      // Inyectar mensaje de bienvenida del proyecto en el chat
      appendMessageToDOM("jarvis", data.initial_message);
      currentSessionMessages.push({
        sender: "jarvis",
        text: data.initial_message,
        created_at: new Date().toISOString()
      });
      saveMessagesToLocalStorage(activeChatId, currentSessionMessages);

      if (voiceToggle && voiceToggle.checked) {
        speakCleanAudio(`Espacio de trabajo activado para ${pName}.`);
      }

    } catch (err) {
      if (projectInitStatus) {
        projectInitStatus.textContent = `Error: ${err.message}`;
        projectInitStatus.style.color = "#ef4444";
      }
    }
  });
}

// Botones del banner activo
if (btnInspectProjectTree) {
  btnInspectProjectTree.addEventListener("click", () => {
    if (!currentActiveProject) return;
    handleUserMessage(`Inspecciona y muéstrame la estructura de archivos de mi proyecto activo '${currentActiveProject.name}' con análisis arquitectónico.`);
  });
}

if (btnTestProjectBuild) {
  btnTestProjectBuild.addEventListener("click", () => {
    if (!currentActiveProject) return;
    handleUserMessage(`Valida la sintaxis de todos los archivos y ejecuta las pruebas de mi proyecto activo '${currentActiveProject.name}', aplicando auto-sanación si encuentras errores.`);
  });
}

if (btnCloseProjectSpace) {
  btnCloseProjectSpace.addEventListener("click", () => {
    const oldName = currentActiveProject ? currentActiveProject.name : "Proyecto";
    setActiveProject(null);
    appendMessageToDOM("jarvis", `Has cerrado el espacio de trabajo de **${oldName}**. Has vuelto al modo asistente general.`);
  });
}

function renderLearnedSkills(profile) {
  const currentSkills = new Set(["Go (go.dev)", "Python", "PHP", "C#", "C++", "JavaScript"]);
  if (profile.interests) {
    profile.interests.forEach(i => currentSkills.add(i.toUpperCase()));
  }
  skillsTagsContainer.innerHTML = "";
  Array.from(currentSkills).slice(0, 8).forEach(skill => {
    const tag = document.createElement("span");
    tag.className = "skill-tag";
    tag.textContent = skill;
    skillsTagsContainer.appendChild(tag);
  });
}

function showStatus(text) {
  if (agentStatusText && agentStatus) {
    agentStatusText.textContent = text;
    agentStatus.classList.remove("hidden");
  }
}

function hideStatus() {
  if (agentStatus) agentStatus.classList.add("hidden");
}

// =====================================================================
// VOZ & SÍNTESIS ACÚSTICA (LIMPIANDO CÓDIGO DE LA VOZ)
// =====================================================================

function cleanTextForSpeech(text) {
  if (!text) return "";
  // Eliminar bloques de código enteros de la lectura de voz para que no lea sintaxis técnica
  let clean = text.replace(/```[\s\S]*?```/g, "Te he preparado el fragmento de código correspondiente en la pantalla.");
  // Eliminar almohadillas, asteriscos y corchetes
  clean = clean.replace(/#{1,6}\s*/g, '');
  clean = clean.replace(/[*_`~]/g, '');
  clean = clean.replace(/\[.*?\]\(.*?\)/g, '');
  return clean.trim();
}

function speakCleanAudio(text, force = false) {
  if (!window.speechSynthesis) return;
  if (!force && voiceToggle && !voiceToggle.checked) return;

  const spokenText = cleanTextForSpeech(text);
  if (!spokenText) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = "es-ES";

  const pitch = pitchSlider ? (parseFloat(pitchSlider.value) || 1.05) : 1.05;
  const rate = rateSlider ? (parseFloat(rateSlider.value) || 1.0) : 1.0;
  utterance.pitch = pitch;
  utterance.rate = rate;

  if (systemVoiceSelect && currentVoices.length > 0) {
    const selectedVoiceName = systemVoiceSelect.value;
    if (selectedVoiceName && selectedVoiceName !== "default") {
      const matched = currentVoices.find(v => v.name === selectedVoiceName);
      if (matched) utterance.voice = matched;
    }
  }

  window.speechSynthesis.speak(utterance);
}

function populateVoiceList() {
  if (!window.speechSynthesis) return;
  currentVoices = window.speechSynthesis.getVoices();
  if (!systemVoiceSelect) return;
  systemVoiceSelect.innerHTML = "";

  const spanishVoices = currentVoices.filter(v => v.lang.startsWith("es"));
  if (spanishVoices.length === 0) {
    const opt = document.createElement("option");
    opt.value = "default";
    opt.textContent = "Voz estándar del sistema";
    systemVoiceSelect.appendChild(opt);
  } else {
    spanishVoices.forEach((voice, i) => {
      const opt = document.createElement("option");
      opt.value = voice.name;
      const isNatural = voice.name.includes("Natural") || voice.name.includes("Online") || voice.name.includes("Google");
      opt.textContent = `${voice.name} (${voice.lang})${isNatural ? ' (Alta Fidelidad)' : ''}`;
      if (i === 0 || isNatural) opt.selected = true;
      systemVoiceSelect.appendChild(opt);
    });
  }
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = populateVoiceList;
  populateVoiceList();
}

if (testVoiceBtn) {
  testVoiceBtn.addEventListener("click", () => {
    speakCleanAudio("Bienvenido. La síntesis acústica del sistema J.A.R.V.I.S. se encuentra calibrada y funcionando con normalidad.", true);
  });
}

// Modal de voz
function openVoiceModal() { if (voiceModal) voiceModal.classList.remove("hidden"); }
function closeVoiceModalFn() { if (voiceModal) voiceModal.classList.add("hidden"); }
if (voiceSettingsBtn) voiceSettingsBtn.addEventListener("click", openVoiceModal);
if (sidebarVoiceBtn) sidebarVoiceBtn.addEventListener("click", openVoiceModal);
if (closeVoiceModal) closeVoiceModal.addEventListener("click", closeVoiceModalFn);

if (pitchSlider) {
  pitchSlider.addEventListener("input", (e) => {
    pitchVal.textContent = parseFloat(e.target.value).toFixed(2);
  });
}
if (rateSlider) {
  rateSlider.addEventListener("input", (e) => {
    rateVal.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
  });
}

// Reconocimiento de voz por micrófono
if (micBtn) {
  micBtn.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta entrada de voz directa.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";

    recognition.onstart = () => {
      micBtn.classList.add("listening");
      showStatus("Escuchando entrada de voz...");
    };
    recognition.onresult = async (event) => {
      micBtn.classList.remove("listening");
      const transcript = event.results[0][0].transcript;
      hideStatus();
      await handleUserMessage(transcript);
    };
    recognition.onerror = () => {
      micBtn.classList.remove("listening");
      hideStatus();
    };
    recognition.onend = () => {
      micBtn.classList.remove("listening");
    };
    recognition.start();
  });
}

// Subida de muestra de audio
if (voiceUploadForm) {
  voiceUploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const profileName = document.getElementById("voice-profile-name").value;
    const audioFile = document.getElementById("voice-audio-file").files[0];
    if (!audioFile) return;

    const formData = new FormData();
    formData.append("voice_name", profileName);
    formData.append("audio_file", audioFile);

    voiceUploadStatus.style.color = "var(--spotify-green)";
    voiceUploadStatus.textContent = "Procesando perfil acústico...";

    try {
      const res = await fetch(`${API_BASE}/auth/voice/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error al subir");

      voiceUploadStatus.textContent = `Perfil '${profileName}' calibrado exitosamente.`;
      speakCleanAudio(`Calibración acústica completada para el perfil ${profileName}.`);
    } catch (err) {
      voiceUploadStatus.style.color = "#f87171";
      voiceUploadStatus.textContent = err.message;
    }
  });
}

// =====================================================================
// AUTENTICACIÓN & LOGIN / REGISTRO
// =====================================================================

if (showRegister) {
  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    if (forgotForm) forgotForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    statusMsg.textContent = "";
  });
}
if (showLogin) {
  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.add("hidden");
    if (forgotForm) forgotForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    statusMsg.textContent = "";
  });
}

// Navegación hacia recuperación de contraseña
if (showForgot) {
  showForgot.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    registerForm.classList.add("hidden");
    if (forgotForm) {
      forgotForm.classList.remove("hidden");
      resetForgotFormState();
    }
    statusMsg.textContent = "";
  });
}

if (forgotCancelLink) {
  forgotCancelLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (forgotForm) forgotForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    statusMsg.textContent = "";
  });
}

function resetForgotFormState() {
  if (forgotStep2) {
    forgotStep2.classList.remove("show");
  }
  if (forgotVerifyBtn) {
    forgotVerifyBtn.classList.remove("hidden");
    forgotVerifyBtn.textContent = "VERIFICAR CUENTA";
    forgotVerifyBtn.disabled = false;
  }
  if (forgotSubmitBtn) forgotSubmitBtn.classList.add("hidden");
  if (forgotIdentifier) {
    forgotIdentifier.disabled = false;
    forgotIdentifier.focus();
  }
  if (forgotNewPassword) forgotNewPassword.value = "";
  if (forgotConfirmPassword) forgotConfirmPassword.value = "";
}

// Paso 1: Verificar Identificador de Cuenta
if (forgotVerifyBtn) {
  forgotVerifyBtn.addEventListener("click", async () => {
    const identifier = forgotIdentifier.value.trim();
    if (!identifier) {
      statusMsg.style.color = "#f87171";
      statusMsg.textContent = "Por favor, ingresa tu usuario o correo.";
      forgotIdentifier.focus();
      return;
    }

    forgotVerifyBtn.textContent = "Verificando...";
    forgotVerifyBtn.disabled = true;
    statusMsg.style.color = "var(--purple-accent)";
    statusMsg.textContent = "Consultando base de datos neural...";

    try {
      const res = await fetch(`${API_BASE}/auth/verify-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_or_email: identifier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Usuario no encontrado");

      statusMsg.style.color = "var(--spotify-green)";
      statusMsg.textContent = `Cuenta verificada (${data.username}). Ingresa tu nueva clave de acceso.`;
      
      // Bloquear identificador y revelar paso 2 con animación
      forgotIdentifier.disabled = true;
      forgotVerifyBtn.classList.add("hidden");
      if (forgotStep2) {
        forgotStep2.classList.add("show");
      }
      if (forgotSubmitBtn) {
        forgotSubmitBtn.classList.remove("hidden");
      }
      if (forgotNewPassword) forgotNewPassword.focus();

      speakCleanAudio(`Identidad confirmada para ${data.username}. Por favor, ingresa tu nueva clave de acceso.`);
    } catch (err) {
      forgotVerifyBtn.textContent = "VERIFICAR CUENTA";
      forgotVerifyBtn.disabled = false;
      statusMsg.style.color = "#f87171";
      statusMsg.textContent = err.message;
    }
  });
}

// Paso 2: Actualizar Contraseña en la Base de Datos
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = forgotIdentifier.value.trim();
    const newPwd = forgotNewPassword.value;
    const confirmPwd = forgotConfirmPassword.value;

    if (!newPwd || newPwd.length < 4) {
      statusMsg.style.color = "#f87171";
      statusMsg.textContent = "La nueva clave debe tener al menos 4 caracteres.";
      return;
    }

    if (newPwd !== confirmPwd) {
      statusMsg.style.color = "#f87171";
      statusMsg.textContent = "Las contraseñas no coinciden. Verifícalas con atención.";
      return;
    }

    if (forgotSubmitBtn) {
      forgotSubmitBtn.textContent = "Actualizando...";
      forgotSubmitBtn.disabled = true;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username_or_email: identifier,
          new_password: newPwd
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error al actualizar clave");

      statusMsg.style.color = "var(--spotify-green)";
      statusMsg.textContent = data.message;
      speakCleanAudio("Tu clave de acceso ha sido actualizada con éxito en la base de datos.");

      // Volver a login después de breve pausa
      setTimeout(() => {
        if (forgotForm) forgotForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        const loginUserInput = document.getElementById("login-username");
        if (loginUserInput) {
          loginUserInput.value = data.username || identifier;
        }
        const loginPwdInput = document.getElementById("login-password");
        if (loginPwdInput) {
          loginPwdInput.value = "";
          loginPwdInput.focus();
        }
        resetForgotFormState();
      }, 1500);

    } catch (err) {
      if (forgotSubmitBtn) {
        forgotSubmitBtn.textContent = "ACTUALIZAR CONTRASEÑA";
        forgotSubmitBtn.disabled = false;
      }
      statusMsg.style.color = "#f87171";
      statusMsg.textContent = err.message;
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error en el registro");

      statusMsg.style.color = "var(--spotify-green)";
      statusMsg.textContent = "¡Cuenta creada! Identifícate para ingresar.";
      registerForm.reset();
      showLogin.click();
    } catch (err) {
      statusMsg.style.color = "#f87171";
      statusMsg.textContent = err.message;
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error de credenciales");

      sessionStorage.setItem("jarvis_token", data.access_token);
      sessionStorage.setItem("jarvis_user", username);
      showAppInterface();
      await loadUserChats();
      speakCleanAudio(`¡Bienvenido de nuevo, ${username}! Todos los sistemas de auto-programación están a tu servicio.`);
    } catch (err) {
      statusMsg.style.color = "#f87171";
      statusMsg.textContent = err.message;
    }
  });
}

function showAppInterface() {
  if (authContainer) authContainer.classList.add("hidden");
  if (dashboardWrapper) dashboardWrapper.classList.remove("hidden");
  if (mainSidebar) mainSidebar.classList.remove("hidden");
  renderActiveProjectBanner();
}

function hideAppInterface() {
  if (dashboardWrapper) dashboardWrapper.classList.add("hidden");
  if (mainSidebar) mainSidebar.classList.add("hidden");
  if (authContainer) authContainer.classList.remove("hidden");
}

function performLogout() {
  sessionStorage.removeItem("jarvis_token");
  sessionStorage.removeItem("jarvis_user");
  setActiveProject(null);
  activeChatId = null;
  currentChatSessions = [];
  currentSessionMessages = [];
  hideAppInterface();
}

if (logoutBtn) logoutBtn.addEventListener("click", performLogout);
if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener("click", performLogout);
if (newChatBtn) newChatBtn.addEventListener("click", () => createNewChat(true));
if (headerNewChatBtn) headerNewChatBtn.addEventListener("click", () => createNewChat(true));

// Auto-login si ya existe token
if (sessionStorage.getItem("jarvis_token") || sessionStorage.getItem("jarvis_user")) {
  showAppInterface();
  loadUserChats();
}

// =====================================================================
// CANVAS VISUALIZADOR SPOTIFY DJ (ONDA ORGÁNICA VERDE / CIAN / PÚRPURA)
// =====================================================================

const canvas = document.getElementById("jarvis-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const neonPurplePalettes = [
  { core: "#c084fc", glow: "rgba(192, 132, 252, ", secondary: "#9333ea" },
  { core: "#a855f7", glow: "rgba(168, 85, 247, ", secondary: "#d8b4fe" },
  { core: "#e879f9", glow: "rgba(232, 121, 249, ", secondary: "#7c3aed" }
];
let palIdx = 0;

window.addEventListener("click", (e) => {
  if (!e.target.closest(".dashboard-card") && !e.target.closest(".sidebar") && !e.target.closest(".voice-modal")) {
    palIdx = (palIdx + 1) % neonPurplePalettes.length;
  }
});

let time = 0;
const waveNodes = Array.from({ length: 40 }, (_, i) => ({
  x: (window.innerWidth / 40) * i,
  y: window.innerHeight * 0.75,
  baseY: window.innerHeight * 0.75,
  speed: 0.02 + Math.random() * 0.02
}));

function animateSpotifyVisualizer() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  time += 0.025;

  const pal = neonPurplePalettes[palIdx];

  // Orbe ambiental flotante
  const orbRadius = 120 + Math.sin(time) * 15;
  const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, orbRadius * 1.8);
  gradient.addColorStop(0, pal.glow + "0.15)");
  gradient.addColorStop(0.5, pal.glow + "0.05)");
  gradient.addColorStop(1, "transparent");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, orbRadius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Ondas bio-acústicas inferiores
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);

  for (let i = 0; i < waveNodes.length; i++) {
    const node = waveNodes[i];
    const waveY = node.baseY + Math.sin(time * 2 + i * 0.3) * 20 + Math.cos(time + i * 0.2) * 15;
    node.y += (waveY - node.y) * 0.1;
    ctx.lineTo(node.x, node.y);
  }

  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();

  const waveGrad = ctx.createLinearGradient(0, canvas.height * 0.6, canvas.width, canvas.height);
  waveGrad.addColorStop(0, "rgba(30, 215, 96, 0.04)");
  waveGrad.addColorStop(0.5, "rgba(0, 210, 255, 0.05)");
  waveGrad.addColorStop(1, "rgba(168, 85, 247, 0.04)");

  ctx.fillStyle = waveGrad;
  ctx.fill();

  requestAnimationFrame(animateSpotifyVisualizer);
}

animateSpotifyVisualizer();


// =====================================================================
// MÓDULO: CODE EDITOR — EXPLORADOR DE ARCHIVOS + EDITOR + DIFF VIEWER
// Capacidades: Cloud Code / Antigravity / Cursor dentro de J.A.R.V.I.S.
// =====================================================================

const CodeEditor = (() => {
  // Estado interno del editor
  let _currentFilePath = null;
  let _originalContent = '';
  let _currentProjectPath = null;
  let _allTreeItems = [];

  // Referencias DOM (se inicializan al arrancar el módulo)
  let _modal, _overlay, _textarea, _lineNumbers, _filename, _modifiedBadge,
      _tabEditor, _tabDiff, _editorPanel, _diffPanel, _diffOutput,
      _diffAdditions, _diffDeletions, _cursorPos, _langLabel, _saveStatus,
      _explorerPanel, _treeContainer, _searchInput, _explorerSearchInput;

  // Tipos de archivo → clase CSS de color
  const EXT_COLOR = {
    py: 'file-ext-py', js: 'file-ext-js', ts: 'file-ext-ts',
    html: 'file-ext-html', htm: 'file-ext-html', css: 'file-ext-css',
    json: 'file-ext-json', md: 'file-ext-md', go: 'file-ext-go',
    cs: 'file-ext-cs', cpp: 'file-ext-cpp', h: 'file-ext-cpp', c: 'file-ext-cpp'
  };

  // SVG icons compactos
  const ICON_FILE = `<svg class="tree-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
  const ICON_DIR  = `<svg class="tree-icon" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>`;

  // ─── UTILIDADES ──────────────────────────────────────────────────

  function _getExt(path) {
    const parts = (path || '').split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  function _getLangFromExt(ext) {
    const map = { py: 'Python', js: 'JavaScript', ts: 'TypeScript', html: 'HTML',
                  css: 'CSS', json: 'JSON', go: 'Go', cs: 'C#', cpp: 'C++', c: 'C',
                  md: 'Markdown', txt: 'Texto', rs: 'Rust', sh: 'Shell',
                  bat: 'Batch', yaml: 'YAML', yml: 'YAML', xml: 'XML' };
    return map[ext] || ext.toUpperCase() || 'Texto';
  }

  function _showSaveStatus(msg, color = '#4ade80') {
    if (!_saveStatus) return;
    _saveStatus.textContent = msg;
    _saveStatus.style.color = color;
    _saveStatus.style.opacity = '1';
    setTimeout(() => { _saveStatus.style.opacity = '0'; }, 3000);
  }

  // ─── NÚMEROS DE LÍNEA ─────────────────────────────────────────────

  function _syncLineNumbers() {
    if (!_textarea || !_lineNumbers) return;
    const lines = _textarea.value.split('\n');
    _lineNumbers.innerHTML = lines.map((_, i) => `<div>${i + 1}</div>`).join('');
    // Sincronizar scroll
    _lineNumbers.scrollTop = _textarea.scrollTop;
  }

  function _updateCursorPos() {
    if (!_textarea || !_cursorPos) return;
    const text = _textarea.value.substring(0, _textarea.selectionStart);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    _cursorPos.textContent = `Ln ${line}, Col ${col}`;
  }

  // ─── ÁRBOL DE ARCHIVOS ────────────────────────────────────────────

  function _renderFileTree(items) {
    if (!_treeContainer) return;

    // Agrupar por tipo (dirs primero)
    const dirs = items.filter(i => i.type === 'directory').sort((a, b) => a.path.localeCompare(b.path));
    const files = items.filter(i => i.type === 'file').sort((a, b) => a.path.localeCompare(b.path));
    const sorted = [...dirs, ...files];

    _allTreeItems = sorted;
    _treeContainer.innerHTML = '';

    if (sorted.length === 0) {
      _treeContainer.innerHTML = '<div class="file-tree-empty">El proyecto no tiene archivos visibles</div>';
      return;
    }

    sorted.forEach(item => {
      const depth = (item.path.match(/\//g) || []).length;
      const name = item.path.split('/').pop();
      const ext = _getExt(name);
      const isDir = item.type === 'directory';

      const el = document.createElement('div');
      el.className = 'file-tree-item' + (isDir ? ' dir-item' : '');
      if (EXT_COLOR[ext] && !isDir) el.classList.add(EXT_COLOR[ext]);
      el.dataset.path = item.path;
      el.dataset.isDir = isDir ? '1' : '0';
      el.title = item.path;

      // Indentación
      let indentHtml = '';
      for (let i = 0; i < depth; i++) indentHtml += '<span class="file-tree-indent"></span>';

      el.innerHTML = `${indentHtml}${isDir ? ICON_DIR : ICON_FILE}<span>${name}</span>`;

      if (!isDir) {
        el.addEventListener('click', () => {
          document.querySelectorAll('.file-tree-item.active').forEach(a => a.classList.remove('active'));
          el.classList.add('active');
          openFileInEditor(item.path);
        });
      }

      _treeContainer.appendChild(el);
    });
  }

  function _filterTree(query) {
    if (!_treeContainer) return;
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.file-tree-item').forEach(el => {
      const p = (el.dataset.path || '').toLowerCase();
      el.style.display = (!q || p.includes(q)) ? '' : 'none';
    });
  }

  // ─── ABRIR ARCHIVO EN EDITOR ──────────────────────────────────────

  async function openFileInEditor(filePath) {
    try {
      const projectPath = _currentProjectPath || '';
      const fullPath = filePath.startsWith('/') || /^[a-zA-Z]:/.test(filePath)
        ? filePath
        : (projectPath ? projectPath + '/' + filePath : filePath);

      const res = await fetch(`${API_BASE}/auth/project/file/read?file_path=${encodeURIComponent(fullPath)}&max_lines=2000`);
      const data = await res.json();

      if (!data.success) {
        _showSaveStatus(`Error: ${data.error || 'No se pudo leer el archivo'}`, '#f87171');
        return;
      }

      // Strip line numbers (format "1: content")
      const content = (data.content || '').replace(/^\d+: /mg, '');

      _currentFilePath = fullPath;
      _originalContent = content;

      if (_textarea) _textarea.value = content;
      if (_filename) _filename.textContent = filePath.split('/').pop();
      if (_modifiedBadge) _modifiedBadge.classList.add('hidden');

      const ext = _getExt(filePath);
      if (_langLabel) _langLabel.textContent = _getLangFromExt(ext);

      _syncLineNumbers();
      _switchToEditorTab();
      openEditorModal();
    } catch (err) {
      console.error('[CODE EDITOR] Error al abrir archivo:', err);
      _showSaveStatus('Error de conexión', '#f87171');
    }
  }

  // ─── GUARDAR ARCHIVO ──────────────────────────────────────────────

  async function saveCurrentFile() {
    if (!_currentFilePath) {
      _showSaveStatus('No hay archivo abierto', '#fbbf24');
      return;
    }
    const content = _textarea ? _textarea.value : '';

    try {
      const res = await fetch(`${API_BASE}/auth/project/file/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: _currentFilePath, content, backup: true })
      });
      const data = await res.json();
      if (data.success) {
        _originalContent = content;
        if (_modifiedBadge) _modifiedBadge.classList.add('hidden');
        _showSaveStatus(`Guardado — ${data.bytes_written} bytes`, '#4ade80');
      } else {
        _showSaveStatus(`Error: ${data.error || data.detail || 'Fallo al guardar'}`, '#f87171');
      }
    } catch (err) {
      _showSaveStatus('Error de red al guardar', '#f87171');
    }
  }

  // ─── DIFF PREVIEW ─────────────────────────────────────────────────

  async function showDiffPreview() {
    if (!_currentFilePath) return;
    const newContent = _textarea ? _textarea.value : '';

    try {
      const res = await fetch(`${API_BASE}/auth/project/file/diff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: _currentFilePath, new_content: newContent })
      });
      const data = await res.json();

      if (!data.success) { _showSaveStatus('Error al generar diff', '#f87171'); return; }

      if (_diffAdditions) _diffAdditions.textContent = `+${data.additions}`;
      if (_diffDeletions) _diffDeletions.textContent = `-${data.deletions}`;

      // Renderizar diff con coloreado de líneas
      if (_diffOutput) {
        if (!data.has_changes) {
          _diffOutput.innerHTML = '<span style="color:#94a3b8;font-style:italic;">Sin cambios detectados respecto al archivo guardado.</span>';
        } else {
          const htmlLines = (data.diff || '').split('\n').map(line => {
            const esc = line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            if (line.startsWith('+++') || line.startsWith('---')) return `<span class="diff-line-hunk">${esc}</span>`;
            if (line.startsWith('+')) return `<span class="diff-line-add">${esc}</span>`;
            if (line.startsWith('-')) return `<span class="diff-line-del">${esc}</span>`;
            if (line.startsWith('@@')) return `<span class="diff-line-hunk">${esc}</span>`;
            return `<span>${esc}</span>`;
          });
          _diffOutput.innerHTML = htmlLines.join('\n');
        }
      }

      _switchToDiffTab();
    } catch (err) {
      _showSaveStatus('Error de red al generar diff', '#f87171');
    }
  }

  // ─── TABS ─────────────────────────────────────────────────────────

  function _switchToEditorTab() {
    if (_tabEditor) _tabEditor.classList.add('active');
    if (_tabDiff) _tabDiff.classList.remove('active');
    if (_editorPanel) _editorPanel.classList.remove('hidden');
    if (_diffPanel) _diffPanel.classList.add('hidden');
  }

  function _switchToDiffTab() {
    if (_tabDiff) _tabDiff.classList.add('active');
    if (_tabEditor) _tabEditor.classList.remove('active');
    if (_diffPanel) _diffPanel.classList.remove('hidden');
    if (_editorPanel) _editorPanel.classList.add('hidden');
  }

  // ─── ABRIR / CERRAR MODAL ─────────────────────────────────────────

  function openEditorModal() {
    if (_modal) _modal.classList.remove('hidden');
  }

  function closeEditorModal() {
    if (_modal) _modal.classList.add('hidden');
  }

  // ─── EXPLORADOR DE ARCHIVOS ───────────────────────────────────────

  function openFileExplorer() {
    if (_explorerPanel) _explorerPanel.classList.remove('hidden');
    if (_currentProjectPath) refreshFileTree();
  }

  function closeFileExplorer() {
    if (_explorerPanel) _explorerPanel.classList.add('hidden');
  }

  async function refreshFileTree(projectPath) {
    if (projectPath) _currentProjectPath = projectPath;
    if (!_treeContainer) return;
    _treeContainer.innerHTML = '<div class="file-tree-empty">Cargando archivos...</div>';

    try {
      const path = _currentProjectPath || '';
      const res = await fetch(`${API_BASE}/auth/project/tree?project_path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.success && data.items) {
        _renderFileTree(data.items);
      } else {
        _treeContainer.innerHTML = '<div class="file-tree-empty">Error al cargar el árbol de archivos</div>';
      }
    } catch (err) {
      _treeContainer.innerHTML = '<div class="file-tree-empty">Error de conexión</div>';
    }
  }

  // ─── ENVIAR ARCHIVO AL CHAT ───────────────────────────────────────

  function sendCurrentFileToChat() {
    if (!_currentFilePath || !_textarea) return;
    const content = _textarea.value;
    const fname = _currentFilePath.split('/').pop();
    const ext = _getExt(fname);
    const prompt = `Analiza el siguiente archivo: \`${fname}\`\n\n\`\`\`${ext}\n${content}\n\`\`\``;

    const chatInputEl = document.getElementById('chat-input');
    if (chatInputEl) {
      chatInputEl.value = prompt;
      chatInputEl.focus();
    }
    closeEditorModal();
  }

  // ─── NUEVO ARCHIVO ────────────────────────────────────────────────

  async function createNewFile(filePath, initialContent = '') {
    if (!filePath) return;
    const fullPath = (_currentProjectPath && !filePath.startsWith('/') && !/^[a-zA-Z]:/.test(filePath))
      ? _currentProjectPath + '/' + filePath
      : filePath;
    try {
      const res = await fetch(`${API_BASE}/auth/project/file/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: fullPath, content: initialContent, backup: false })
      });
      const data = await res.json();
      if (data.success) {
        await refreshFileTree();
        openFileInEditor(fullPath);
      }
    } catch (err) { console.error('[CODE EDITOR] Error creando archivo:', err); }
  }

  // ─── INICIALIZACIÓN ───────────────────────────────────────────────

  function init() {
    _modal          = document.getElementById('code-editor-modal');
    _overlay        = document.getElementById('code-editor-overlay');
    _textarea       = document.getElementById('code-editor-textarea');
    _lineNumbers    = document.getElementById('editor-line-numbers');
    _filename       = document.getElementById('code-editor-filename');
    _modifiedBadge  = document.getElementById('code-editor-modified-badge');
    _tabEditor      = document.getElementById('tab-editor');
    _tabDiff        = document.getElementById('tab-diff');
    _editorPanel    = document.getElementById('editor-panel');
    _diffPanel      = document.getElementById('diff-panel');
    _diffOutput     = document.getElementById('diff-output');
    _diffAdditions  = document.getElementById('diff-additions');
    _diffDeletions  = document.getElementById('diff-deletions');
    _cursorPos      = document.getElementById('editor-cursor-pos');
    _langLabel      = document.getElementById('editor-lang-label');
    _saveStatus     = document.getElementById('editor-save-status');
    _explorerPanel  = document.getElementById('file-explorer-panel');
    _treeContainer  = document.getElementById('file-tree-container');
    _explorerSearchInput = document.getElementById('file-tree-search');

    if (!_modal || !_textarea) return; // No está en el DOM todavía

    // Textarea: sincronizar números de línea + detectar modificaciones
    _textarea.addEventListener('input', () => {
      _syncLineNumbers();
      if (_modifiedBadge) {
        const modified = _textarea.value !== _originalContent;
        _modifiedBadge.classList.toggle('hidden', !modified);
      }
    });
    _textarea.addEventListener('scroll', () => {
      if (_lineNumbers) _lineNumbers.scrollTop = _textarea.scrollTop;
    });
    _textarea.addEventListener('keyup', _updateCursorPos);
    _textarea.addEventListener('click', _updateCursorPos);
    _textarea.addEventListener('keydown', e => {
      // Tab → 2 espacios
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = _textarea.selectionStart;
        const v = _textarea.value;
        _textarea.value = v.substring(0, s) + '  ' + v.substring(_textarea.selectionEnd);
        _textarea.selectionStart = _textarea.selectionEnd = s + 2;
        _syncLineNumbers();
      }
      // Ctrl+S → guardar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
    });

    // Tabs
    _tabEditor && _tabEditor.addEventListener('click', _switchToEditorTab);
    _tabDiff   && _tabDiff.addEventListener('click', () => showDiffPreview());

    // Botones
    document.getElementById('btn-editor-save')         ?.addEventListener('click', saveCurrentFile);
    document.getElementById('btn-editor-diff-preview') ?.addEventListener('click', showDiffPreview);
    document.getElementById('btn-editor-send-to-chat') ?.addEventListener('click', sendCurrentFileToChat);
    document.getElementById('btn-close-code-editor')   ?.addEventListener('click', closeEditorModal);
    _overlay && _overlay.addEventListener('click', closeEditorModal);

    // Explorador
    document.getElementById('btn-toggle-file-explorer') ?.addEventListener('click', openFileExplorer);
    document.getElementById('btn-close-file-explorer')  ?.addEventListener('click', closeFileExplorer);
    document.getElementById('btn-refresh-tree')         ?.addEventListener('click', () => refreshFileTree());
    document.getElementById('btn-new-file-in-tree')     ?.addEventListener('click', () => {
      const name = prompt('Nombre del nuevo archivo (ej: main.py, utils.js):');
      if (name && name.trim()) createNewFile(name.trim());
    });

    // Búsqueda en árbol
    _explorerSearchInput?.addEventListener('input', e => _filterTree(e.target.value));

    // Botón "Explorar" en el banner del proyecto activo
    const btnInspect = document.getElementById('btn-inspect-project-tree');
    if (btnInspect) {
      const _origClick = btnInspect.onclick;
      btnInspect.addEventListener('click', () => {
        openFileExplorer();
      });
    }
  }

  // ─── API PÚBLICA ──────────────────────────────────────────────────
  return {
    init,
    openFileInEditor,
    openEditorModal,
    closeEditorModal,
    openFileExplorer,
    closeFileExplorer,
    refreshFileTree,
    saveCurrentFile,
    showDiffPreview,
    createNewFile,
    setProjectPath(path) { _currentProjectPath = path; }
  };
})();

// ─── Integración con el ciclo de vida de J.A.R.V.I.S. ────────────────

// Inicializar Code Editor cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  CodeEditor.init();
});

// También intentar inicializar si el DOM ya está listo
if (document.readyState !== 'loading') {
  CodeEditor.init();
}

// Hook en el evento de inicialización de proyecto
// Cuando se activa un proyecto, actualizar la ruta del Code Editor
(function hookProjectInit() {
  const _origInit = window._onProjectInitSuccess;
  window._onProjectInitSuccess = function(projectPath, projectName) {
    if (_origInit) _origInit(projectPath, projectName);
    CodeEditor.setProjectPath(projectPath);
    CodeEditor.refreshFileTree(projectPath);
  };
})();

// Exponer globalmente para que el sistema de proyectos pueda invocar el refresh del árbol
window.CodeEditor = CodeEditor;

// Interceptar la respuesta del agente: cuando JARVIS escribe archivos,
// actualizar automáticamente el árbol de archivos
(function patchAgentFileSync() {
  const chatFeedEl = document.getElementById('chat-feed');
  if (!chatFeedEl) return;

  const obs = new MutationObserver(() => {
    // Si hay un proyecto activo y el árbol está abierto, hacer un refresh silencioso
    const explorerPanel = document.getElementById('file-explorer-panel');
    if (explorerPanel && !explorerPanel.classList.contains('hidden')) {
      const bannerPath = document.getElementById('banner-project-path');
      if (bannerPath && bannerPath.textContent && bannerPath.textContent !== 'C:/...') {
        setTimeout(() => CodeEditor.refreshFileTree(), 600);
      }
    }
  });
  obs.observe(chatFeedEl, { childList: true, subtree: false });
})();