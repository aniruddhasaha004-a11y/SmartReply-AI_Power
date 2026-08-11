// popup.js - SmartReply Extension Logic

const API_BASE_URL = 'http://localhost:8080';

// Global variables for active email details
let activeEmailSubject = '';
let activeEmailBody = '';
let activeEmailSender = '';
let selectedTone = 'Professional';

// DOM elements
const authSection = document.getElementById('auth-section');
const generatorSection = document.getElementById('generator-section');
const loginForm = document.getElementById('login-form');
const authError = document.getElementById('auth-error');
const generatorError = document.getElementById('generator-error');
const userBadge = document.getElementById('user-badge');
const userNameAbbr = document.getElementById('user-name-abbr');

const emailSubjectPreview = document.getElementById('email-subject-preview');
const btnReloadContext = document.getElementById('btn-reload-context');
const btnGenerate = document.getElementById('btn-generate');
const outputWrapper = document.getElementById('output-wrapper');
const outputText = document.getElementById('output-text');
const btnInsert = document.getElementById('btn-insert');
const btnCopy = document.getElementById('btn-copy');
const btnLogout = document.getElementById('btn-logout');

// Initial setup on load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// Setup event handlers
function setupEventListeners() {
  // Login submission
  loginForm.addEventListener('submit', handleLogin);

  // Tone pill clicks
  document.querySelectorAll('.tone-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.tone-pill').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      selectedTone = e.currentTarget.getAttribute('data-tone');
    });
  });

  // Action buttons
  btnReloadContext.addEventListener('click', fetchEmailDataFromTab);
  btnGenerate.addEventListener('click', handleGenerateReply);
  btnInsert.addEventListener('click', handleInsertToGmail);
  btnCopy.addEventListener('click', handleCopyText);
  btnLogout.addEventListener('click', handleLogout);
}

// Check session
function checkAuth() {
  chrome.storage.local.get(['token', 'user'], (result) => {
    if (result.token && result.user) {
      const user = JSON.parse(result.user);
      
      // Update UI
      authSection.classList.add('hidden');
      generatorSection.classList.remove('hidden');
      userBadge.classList.remove('hidden');
      userNameAbbr.innerText = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      userNameAbbr.title = `${user.name} (${user.email})`;
      
      // Pre-select user preferred tone if set
      if (user.preferredTone) {
        selectedTone = user.preferredTone;
        document.querySelectorAll('.tone-pill').forEach(pill => {
          if (pill.getAttribute('data-tone') === selectedTone) {
            pill.classList.add('active');
          } else {
            pill.classList.remove('active');
          }
        });
      }

      // Fetch active email context
      fetchEmailDataFromTab();
    } else {
      authSection.classList.remove('hidden');
      generatorSection.classList.add('hidden');
      userBadge.classList.add('hidden');
    }
  });
}

// Log in API call
async function handleLogin(e) {
  e.preventDefault();
  authError.classList.add('hidden');
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const btn = document.getElementById('btn-login');
  
  btn.disabled = true;
  btn.innerText = 'Signing In...';

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      chrome.storage.local.set({
        token: data.token,
        user: JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          preferredTone: data.preferredTone || 'Professional'
        })
      }, () => {
        checkAuth();
      });
    } else {
      throw new Error(data.message || 'Login failed. Invalid credentials.');
    }
  } catch (error) {
    authError.innerText = error.message;
    authError.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Sign In';
  }
}

// Log out session
function handleLogout() {
  chrome.storage.local.remove(['token', 'user'], () => {
    checkAuth();
    // Clear old result states
    outputText.value = '';
    outputWrapper.classList.add('hidden');
    activeEmailSubject = '';
    activeEmailBody = '';
    activeEmailSender = '';
  });
}

// Message Gmail tab content script to read email details
function fetchEmailDataFromTab() {
  emailSubjectPreview.innerText = "Reading active email...";
  generatorError.classList.add('hidden');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    
    const activeTab = tabs[0];
    if (!activeTab.url.includes("mail.google.com")) {
      emailSubjectPreview.innerText = "Navigate to Gmail to load context";
      return;
    }

    chrome.tabs.sendMessage(activeTab.id, { action: "GET_EMAIL_DATA" }, (response) => {
      if (chrome.runtime.lastError) {
        emailSubjectPreview.innerText = "Open a Gmail email and reload";
        console.error(chrome.runtime.lastError);
        return;
      }

      if (response && response.success) {
        activeEmailSubject = response.subject;
        activeEmailBody = response.body;
        activeEmailSender = response.sender;
        emailSubjectPreview.innerText = `Subject: ${activeEmailSubject}`;
      } else {
        emailSubjectPreview.innerText = "Could not parse email. Try opening a thread.";
        if (response && response.error) {
          console.error(response.error);
        }
      }
    });
  });
}

// Call backend replies generate API
async function handleGenerateReply() {
  generatorError.classList.add('hidden');
  outputWrapper.classList.add('hidden');
  
  if (!activeEmailSubject || !activeEmailBody) {
    generatorError.innerText = "No email content loaded. Please open an email thread and click reload.";
    generatorError.classList.remove('hidden');
    return;
  }

  btnGenerate.disabled = true;
  const originalBtnText = btnGenerate.innerHTML;
  btnGenerate.innerText = 'Generating reply...';

  chrome.storage.local.get('token', async (result) => {
    const token = result.token;
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/replies/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailSubject: activeEmailSubject,
          emailBody: activeEmailBody,
          sender: activeEmailSender,
          tone: selectedTone
        })
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (response.ok && data.generatedReply) {
        outputText.value = data.generatedReply;
        outputWrapper.classList.remove('hidden');
      } else {
        throw new Error(data.message || 'Failed to generate email reply.');
      }
    } catch (error) {
      generatorError.innerText = error.message;
      generatorError.classList.remove('hidden');
    } finally {
      btnGenerate.disabled = false;
      btnGenerate.innerHTML = originalBtnText;
    }
  });
}

// Message Gmail tab content script to insert reply
function handleInsertToGmail() {
  const replyText = outputText.value.trim();
  if (!replyText) return;

  btnInsert.disabled = true;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    
    chrome.tabs.sendMessage(tabs[0].id, { action: "INSERT_REPLY", replyText }, (response) => {
      btnInsert.disabled = false;
      if (chrome.runtime.lastError || !response || !response.success) {
        const errMsg = response?.error || chrome.runtime.lastError?.message || "Ensure a reply text box is open in Gmail.";
        alert(errMsg);
      } else {
        // Success: Close the extension popup
        window.close();
      }
    });
  });
}

// Copy draft text to clipboard
function handleCopyText() {
  const text = outputText.value;
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btnCopy.innerText;
    btnCopy.innerText = 'Copied!';
    setTimeout(() => {
      btnCopy.innerText = originalText;
    }, 2000);
  });
}
