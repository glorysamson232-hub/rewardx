// common.js
function getUserId() {
  const userData = localStorage.getItem('telegramUser');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id || 'default'; // Use Telegram user ID if available
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  return 'default'; // Fallback for users without Telegram data
}

// ---- Balance now lives on the server (Firestore), not localStorage. ----
// localStorage is only used as a short-lived display cache so the UI can
// show a number instantly before the network call finishes.

function getUserBalanceKey() {
  return `userBalance_${getUserId()}`;
}

async function initializeBalance() {
  // Show cached value immediately (if any) while we fetch the real one.
  updateBalanceDisplay();

  try {
    const res = await fetch(`/api/user-balance?userId=${encodeURIComponent(getUserId())}`);
    const data = await res.json();
    if (typeof data.balance === 'number') {
      localStorage.setItem(getUserBalanceKey(), String(data.balance));
      updateBalanceDisplay();
    }
  } catch (error) {
    console.error('Error fetching balance from server:', error);
  }
}

function updateBalanceDisplay() {
  const balanceKey = getUserBalanceKey();
  const balance = localStorage.getItem(balanceKey) || '0';

  const homeBalanceElement = document.getElementById('balance-display');
  if (homeBalanceElement) {
    homeBalanceElement.textContent = balance;
  }

  const otherBalanceElements = document.querySelectorAll('.text-4xl.font-bold');
  otherBalanceElements.forEach((element) => {
    if (!element.id || element.id !== 'balance-display') {
      element.textContent = balance;
    }
  });
}

// Kept for pages that read a balance synchronously from cache (e.g. right
// after initializeBalance() already ran once this session).
function getCurrentBalance() {
  const balanceKey = getUserBalanceKey();
  return parseInt(localStorage.getItem(balanceKey) || '0');
}

// Get bot username — always RewardX's real bot, no more guessing from start_param.
function getBotUsername() {
  return 'REWARDX1BOT';
}

// Get referral code for the current user
function getReferralCode() {
  const userId = getUserId();
  return `ref${userId}`;
}

// Generate referral link
function generateReferralLink() {
  const botUsername = getBotUsername();
  const referralCode = getReferralCode();
  return `https://t.me/${botUsername}?start=${referralCode}`;
}

// Check if user was referred and process the stage-1 referral bonus.
// Safe to call every time the app opens — the backend only pays the
// bonus once per referred friend.
function checkReferralStatus() {
  const userData = localStorage.getItem('telegramUser');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.start_param && user.start_param.startsWith('ref')) {
        fetch(`/api/telegram-start?userId=${encodeURIComponent(getUserId())}&startParam=${encodeURIComponent(user.start_param)}`)
          .then((response) => response.json())
          .then((data) => {
            console.log('Referral processed via API:', data);
          })
          .catch((error) => {
            console.error('Error processing referral via API:', error);
          });
      }
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  }
}

// Initialize referral system
function initializeReferralSystem() {
  checkReferralStatus();
}

// Was missing entirely — used by home.html and profile.html to show the
// Telegram user's name/photo on the page.
function updateUserProfile() {
  const userData = localStorage.getItem('telegramUser');
  if (!userData) return;
  try {
    const user = JSON.parse(userData);
    const nameEl = document.getElementById('user-fullname');
    if (nameEl) {
      nameEl.textContent = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'RewardX User';
    }
    const photoEl = document.getElementById('user-avatar');
    if (photoEl && user.photo_url) {
      photoEl.src = user.photo_url;
    }
    const usernameEl = document.getElementById('user-username');
    if (usernameEl && user.username) {
      usernameEl.textContent = `@${user.username}`;
    }
  } catch (error) {
    console.error('Error updating profile:', error);
  }
}
