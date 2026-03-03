---
title: Proceso de desarrollo de FlatCMS
author: m87
tags:
  - desarrollo
  - arquitectura
  - nodejs
date: '2026-03-03T18:05:00.000Z'
updated_at: '2026-03-03T18:05:00.000Z'
---
# Proceso de desarrollo de FlatCMS

FlatCMS nació como una idea simple: publicar rápido, mantener control total y evitar complejidad innecesaria.

## 1) Primera versión: funcionalidad antes que forma

El primer objetivo fue claro: crear, editar y mostrar posts con un panel admin mínimo.

- Backend en Node.js
- Markdown para escribir más rápido
- Frontmatter YAML para metadatos
- Carga de imágenes local

## 2) Segunda fase: seguridad y estabilidad

Cuando el flujo básico funcionó, el foco cambió a robustez:

- Sanitización del HTML renderizado
- Cookies de sesión seguras
- Rate limit para login y uploads
- Validaciones de tamaño y tipo de imagen

## 3) Refactor a arquitectura modular

Con el crecimiento del proyecto, apareció la necesidad de separar responsabilidades.

Ahora la estructura está dividida en:

- `routes` para declarar endpoints
- `controllers` para orquestar requests/responses
- `services` para lógica de negocio
- `repositories` para acceso al sistema de archivos
- `middlewares` para auth, seguridad y errores

Esto permite mantener el proyecto limpio, escalable y más fácil de mantener.

## 4) Identidad visual y personalidad

Finalmente, se rediseñó la interfaz con una paleta pastel, mejor estructura visual y una línea editorial más personal.

FlatCMS ya no es solo un CMS funcional; ahora también tiene voz propia.

---

Seguimos iterando, pero siempre con la misma regla: **menos ruido, más claridad**.
