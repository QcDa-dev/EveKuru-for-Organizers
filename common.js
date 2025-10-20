/**
 * EveKuru for Organizers - Common JavaScript Functions
 * 設定値や共通のUIロジックを管理します。
 */

// --- Configuration ---
// GAS APIのURL
export const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyDfNZbhu3xOLjApPQ1a2anibwh-Ck6ZlaO88RcrVtcJX9-EAvdiWgCPvi-xlGfBi-XzQ/exec";
// GitHubリポジトリ情報（リリースノート用）
export const GITHUB_USER = 'qcda-dev';
export const GITHUB_REPO = 'EveKuru-for-Organizers'; // TODO: このアプリの実際のリポジトリ名に更新してください

// --- DOM Elements ---
const loadingOverlay = document.getElementById('loadingOverlay');
const menuButton = document.getElementById('menu-button');
const menu = document.getElementById('menu');
const menuOverlay = document.getElementById('menu-overlay');

// --- UI Functions ---
export function showLoader() {
  if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}

export function hideLoader() {
  if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

function toggleMenu() {
  if (menu) menu.classList.toggle('translate-x-full');
  if (menuOverlay) menuOverlay.classList.toggle('hidden');
}

// --- Initialization Functions ---
export function initMenu() {
  if (menuButton) menuButton.addEventListener('click', toggleMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);
}

/**
 * ログイン状態を確認し、未ログインの場合はログインページにリダイレクトします。
 * @returns {object} ログインしている場合はセッション情報（sheetId, eventName, exportId）を返す
 */
export function authGuard() {
  const sheetId = sessionStorage.getItem('sheetId');
  if (!sheetId) {
    window.location.href = 'index.html';
    return null;
  }
  return {
    sheetId: sheetId,
    eventName: sessionStorage.getItem('eventName'),
    exportId: sessionStorage.getItem('exportId')
  };
}

/**
 * GAS APIを呼び出す共通関数
 * @param {object} payload - GASに送信するデータ
 * @returns {Promise<object>} - GASからのレスポンス(JSON)
 */
export async function callGasApi(payload) {
    showLoader();
    try {
        const response = await fetch(GAS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        return await response.json();
    } finally {
        hideLoader();
    }
}
