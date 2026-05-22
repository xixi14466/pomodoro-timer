# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 语言要求

**所有回答必须使用中文**，包括代码注释、技术解释、文件说明和任何与用户的交流。

**输出格式**：每个回答开头带一个 emoji，结尾带上"嘻嘻"。

## Project Overview

A macOS Pomodoro timer built with Electron. The app displays a countdown timer with three modes (focus, short break, long break) and shows native notifications when sessions complete.

## Commands

```bash
npm start          # Run in development mode
npm run build      # Build macOS app (outputs to dist/)
```

## Architecture

- **main.js**: Electron main process. Creates frameless BrowserWindow, handles IPC for notifications (`show-notification`), close (`close-app`), and minimize (`minimize-app`).
- **preload.js**: Exposes `window.pomodoro` API to renderer via `contextBridge` (notify, close, minimize).
- **timer.js**: Timer UI logic - manages state (mode, timeLeft, running), renders display, generates alarm sound via Web Audio API, handles keyboard shortcuts (Space=start, R=reset).
- **index.html**: UI structure with titlebar, mode tabs, progress ring, timer display, and controls.
- **style.css**: Dark theme (`#1a1a2e`) with accent colors per mode (yellow #FDE731, orange #FB8C18, purple #9C27B0).

## Key Implementation Details

- Frameless window with custom titlebar (drag region + close/minimize buttons)
- Progress ring SVG with `stroke-dashoffset` animation
- Alarm sound generated programmatically via Web Audio API (no external audio files)
- IPC communication: renderer → preload → main process for native features
- Modes cycle: focus → shortBreak → focus (repeat), longBreak → focus