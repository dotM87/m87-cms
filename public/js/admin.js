import { bindThemeToggle, initTheme } from "/js/theme.js";

const state = { currentSlug: null, authenticated: false };
const loginPanel = document.getElementById("login-panel");
const editorPanel = document.getElementById("editor-panel");
const postsList = document.getElementById("posts-list");
const editorTitle = document.getElementById("editor-title");
const editorMessage = document.getElementById("editor-message");
const loginError = document.getElementById("login-error");

function showEditorMessage(message, isError) {
  editorMessage.textContent = message;
  editorMessage.className = isError ? "error-text" : "info-text";
}

function setEditorMode(slug) {
  state.currentSlug = slug || null;
  editorTitle.textContent = state.currentSlug ? `Editar: ${state.currentSlug}` : "Nuevo post";
  document.getElementById("save-btn").textContent = state.currentSlug ? "Guardar cambios" : "Publicar";
}

function clearEditor() {
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("tags").value = "";
  document.getElementById("content").value = "";
  document.getElementById("image-file").value = "";
  setEditorMode(null);
  showEditorMessage("", false);
}

function setAuthenticated(authenticated) {
  state.authenticated = authenticated;
  loginPanel.classList.toggle("hidden", authenticated);
  editorPanel.classList.toggle("hidden", !authenticated);
}

async function checkSession() {
  const response = await fetch("/api/admin/session");
  const data = await response.json();
  setAuthenticated(Boolean(data.authenticated));
  if (data.authenticated) {
    await loadPosts();
  }
}

async function login() {
  loginError.textContent = "";
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    loginError.textContent = data.error || "No se pudo iniciar sesión";
    return;
  }

  document.getElementById("password").value = "";
  setAuthenticated(true);
  await loadPosts();
}

async function logout() {
  await fetch("/api/admin/logout", { method: "POST" });
  setAuthenticated(false);
  clearEditor();
  postsList.innerHTML = "";
}

async function loadPosts() {
  const response = await fetch("/api/posts");
  const posts = await response.json();
  postsList.innerHTML = posts
    .map(post => {
      const when = new Date(post.date).toLocaleString();
      const by = post.author || "Sin autor";
      const title = post.title || post.slug;
      return `<article class="admin-list-item"><div><h3>${title}</h3><p class="meta-text">${by} · ${when}</p></div><button class="btn btn-secondary" data-slug="${post.slug}" type="button">Editar</button></article>`;
    })
    .join("");

  postsList.querySelectorAll("button[data-slug]").forEach(button => {
    button.addEventListener("click", () => {
      loadPostForEdit(button.getAttribute("data-slug"));
    });
  });
}

async function loadPostForEdit(slug) {
  const response = await fetch(`/api/admin/post/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    showEditorMessage("No se pudo cargar el post", true);
    return;
  }

  const post = await response.json();
  document.getElementById("title").value = post.title || "";
  document.getElementById("author").value = post.author || "";
  document.getElementById("tags").value = (post.tags || []).join(", ");
  document.getElementById("content").value = post.markdown || "";
  setEditorMode(slug);
  showEditorMessage("Post cargado para edición", false);
}

async function savePost() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const tags = document.getElementById("tags").value.trim();
  const content = document.getElementById("content").value;

  if (!title || !content) {
    showEditorMessage("Título y contenido son obligatorios", true);
    return;
  }

  const isEdit = Boolean(state.currentSlug);
  const endpoint = isEdit ? `/api/posts/${encodeURIComponent(state.currentSlug)}` : "/api/posts";
  const method = isEdit ? "PUT" : "POST";
  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author, tags, content })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showEditorMessage(result.error || "No se pudo guardar", true);
    return;
  }

  showEditorMessage(isEdit ? "Post actualizado" : "Post publicado", false);
  if (!isEdit) {
    clearEditor();
  }
  await loadPosts();
}

async function uploadImage() {
  const input = document.getElementById("image-file");
  const file = input.files[0];
  if (!file) {
    showEditorMessage("Selecciona una imagen primero", true);
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch("/api/upload-image", { method: "POST", body: formData });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.url) {
    showEditorMessage(result.error || "Error al subir imagen", true);
    return;
  }

  const textarea = document.getElementById("content");
  const markdownImage = `\n![${file.name}](${result.url})\n`;
  const start = textarea.selectionStart || textarea.value.length;
  const end = textarea.selectionEnd || textarea.value.length;
  textarea.value = textarea.value.slice(0, start) + markdownImage + textarea.value.slice(end);
  textarea.focus();
  input.value = "";
  showEditorMessage("Imagen subida e insertada en el contenido", false);
}

document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("logout-btn").addEventListener("click", logout);
document.getElementById("save-btn").addEventListener("click", savePost);
document.getElementById("upload-btn").addEventListener("click", uploadImage);
document.getElementById("reset-btn").addEventListener("click", clearEditor);

initTheme();
bindThemeToggle("theme-toggle");
checkSession();
document.getElementById("username").value = "admin";
