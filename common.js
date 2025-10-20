/**
 * EveKuru for Organizers - Common JavaScript Functions
 */

// --- Configuration ---
export const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyDfNZbhu3xOLjApPQ1a2anibwh-Ck6ZlaO88RcrVtcJX9-EAvdiWgCPvi-xlGfBi-XzQ/exec";
export const GITHUB_USER = 'qcda-dev';
export const GITHUB_REPO = 'EveKuru-for-Organizers';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Renders the common header and menu into the placeholder.
 * @param {string} appName - The name of the application.
 */
function renderHeaderAndMenu(appName) {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    headerPlaceholder.innerHTML = `
      <header class="app-header">
          <div class="container">
              <a href="index.html" class="app-header-title">${appName}</a>
              <button id="menu-button" class="menu-button" aria-label="Menu">
                  <i class="fas fa-bars fa-lg"></i>
              </button>
          </div>
      </header>
      <div id="menu-overlay" class="is-hidden"></div>
      <nav id="menu" class="is-closed">
          <ul class="menu-list">
              <li class="menu-list-item"><a href="guide.html" class="menu-link">使い方ガイド</a></li>
              <li class="menu-list-item"><a href="https://docs.google.com/forms/d/e/1FAIpQLSckrrhDeGQajywfDx9mnGqzDiT1fUPevqi32mAK1JjutlFSlw/viewform?usp=sharing" target="_blank" class="menu-link">お問い合わせ</a></li>
              <li class="menu-list-item"><a href="release-notes.html" class="menu-link">リリースノート</a></li>
          </ul>
          <hr class="my-4 border-gray-200">
          <ul class="menu-list">
              <li class="menu-list-item"><a href="https://qcda-dev.github.io/HP/" target="_blank" class="menu-link">QcDa Projectとは</a></li>
          </ul>
          <p class="menu-version">ver 2.5.0</p>
      </nav>
    `;
}

/**
 * Initializes menu toggle functionality.
 */
function initMenu() {
    const menuButton = document.getElementById('menu-button');
    const menu = document.getElementById('menu');
    const menuOverlay = document.getElementById('menu-overlay');

    const toggleMenu = () => {
        if (!menu || !menuOverlay) return;
        const isClosed = menu.classList.toggle('is-closed');
        menuOverlay.classList.toggle('is-hidden', isClosed);
    };

    if (menuButton) menuButton.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);
}

// --- UI Functions ---
export function showLoader() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}

export function hideLoader() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

/**
 * Displays a message in a designated message box.
 * @param {string} elementId - The ID of the message box element.
 * @param {string} message - The message to display.
 * @param {'error' | 'success' | 'info'} type - The type of message.
 */
export function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = 'message-box'; // Reset classes
    el.classList.add(`is-${type}`, 'is-visible');
}


/**
 * Initializes a standard page with header, menu, and auth guard.
 * @param {object} config - The page configuration.
 * @param {string} config.auth - 'public' or 'private'.
 * @param {string} config.title - The page title.
 */
export function initPage(config) {
    document.addEventListener('DOMContentLoaded', () => {
        renderHeaderAndMenu('EveKuru for Organizers');
        document.title = `${config.title} - EveKuru for Organizers`;
        initMenu();
        if (config.auth === 'private') {
            authGuard();
        }
        // Hide loader only after the main setup is done.
        // For login page, specific logic will handle this.
        if (config.auth !== 'public-login') {
            hideLoader();
        }
    });
}

// --- Auth & API ---

/**
 * Saves session data to both sessionStorage (for the current tab) and localStorage (for persistence).
 * @param {object} sessionData - The session data to save { sheetId, eventName, exportId }.
 */
export function saveSession(sessionData) {
    sessionStorage.setItem('sheetId', sessionData.sheetId);
    sessionStorage.setItem('eventName', sessionData.eventName);
    sessionStorage.setItem('exportId', sessionData.exportId);

    const sessionWithExpiry = {
        ...sessionData,
        expiry: new Date().getTime() + SESSION_DURATION
    };
    localStorage.setItem('evekuru-organizer-session', JSON.stringify(sessionWithExpiry));
}

/**
 * Clears session data from both sessionStorage and localStorage.
 */
export function clearSession() {
    sessionStorage.clear();
    localStorage.removeItem('evekuru-organizer-session');
}

/**
 * Checks for a valid session. First checks sessionStorage, then localStorage.
 * If a valid localStorage session is found, it populates sessionStorage.
 * Redirects to index.html if no valid session is found.
 * @returns {object | null} The session data or null if invalid.
 */
export function authGuard() {
    // 1. Check sessionStorage first (for current tab)
    let sheetId = sessionStorage.getItem('sheetId');
    if (sheetId) {
        return {
            sheetId,
            eventName: sessionStorage.getItem('eventName'),
            exportId: sessionStorage.getItem('exportId')
        };
    }
    
    // 2. If not in sessionStorage, check localStorage (for persistent login)
    const storedSession = localStorage.getItem('evekuru-organizer-session');
    if (storedSession) {
        const session = JSON.parse(storedSession);
        // Check if the session has expired
        if (new Date().getTime() < session.expiry) {
            // Session is valid, populate sessionStorage and return data
            saveSession(session); // Re-save to update sessionStorage
            return session;
        } else {
            // Session expired, clear it
            clearSession();
        }
    }

    // 3. No valid session found, redirect to login page
    window.location.href = 'index.html';
    return null;
}

/**
 * Checks for an auto-login session on the login page.
 * If a valid session is found in localStorage, redirects to admin.html.
 */
export function checkAutoLogin() {
    const storedSession = localStorage.getItem('evekuru-organizer-session');
    if (storedSession) {
        const session = JSON.parse(storedSession);
        if (new Date().getTime() < session.expiry) {
            // Valid session found, populate sessionStorage and redirect
            saveSession(session);
            window.location.href = 'admin.html';
            return true; // Indicates redirection is happening
        } else {
            // Expired session
            localStorage.removeItem('evekuru-organizer-session');
        }
    }
    return false; // No redirection
}


export async function callGasApi(payload) {
    showLoader();
    try {
        const response = await fetch(GAS_API_URL, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return await response.json();
    } finally {
        hideLoader();
    }
}

