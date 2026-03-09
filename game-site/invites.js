// ─── GAME INVITES ───
(function() {
  var MULTIPLAYER = ['tictactoe','connect4','imposter','uno','penguin','wavelength','snakeio','holeio'];
  var page = (window.location.pathname.split('/').pop() || '').replace('.html','');
  if (MULTIPLAYER.indexOf(page) === -1) return;

  var GAME_NAMES = {
    tictactoe:'Tic Tac Toe', connect4:'Connect Four', imposter:'Imposter',
    uno:'UNO', penguin:'Penguin Knockout', wavelength:'Wavelength',
    snakeio:'Snake.io', holeio:'Hole.io'
  };

  function _getUser() {
    return localStorage.getItem('arcade_currentUser') || 'Guest';
  }
  function _isGuest() {
    var u = _getUser();
    return !u || u === 'Guest';
  }

  // Inject CSS
  var css = document.createElement('style');
  css.textContent =
    '.invite-btn{position:fixed;bottom:16px;left:16px;background:#1a1a2e;border:2px solid #00d4ff;border-radius:12px;' +
    'padding:0.5rem 1rem;cursor:pointer;font-family:"Segoe UI",Tahoma,sans-serif;font-size:0.85rem;' +
    'color:#00d4ff;font-weight:600;z-index:999;transition:all 0.2s;display:flex;align-items:center;gap:0.4rem}' +
    '.invite-btn:hover{background:#0f0f1a;transform:scale(1.05)}' +
    '.invite-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:100000;' +
    'display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",Tahoma,sans-serif}' +
    '.invite-modal{background:#1a1a2e;border:2px solid #2a2a4a;border-radius:18px;padding:1.5rem;width:340px;max-width:90vw;max-height:70vh;overflow-y:auto}' +
    '.invite-modal h3{color:#e0e0e0;margin-bottom:1rem;font-size:1.1rem}' +
    '.invite-friend{display:flex;align-items:center;gap:0.7rem;padding:0.6rem 0.8rem;border-radius:10px;transition:background 0.15s}' +
    '.invite-friend:hover{background:#0f0f1a}' +
    '.invite-friend-name{font-size:0.9rem;font-weight:600;color:#e0e0e0;flex:1}' +
    '.invite-send-btn{padding:0.3rem 0.8rem;border-radius:8px;font-size:0.75rem;font-family:inherit;cursor:pointer;' +
    'border:none;background:#00d4ff;color:#0f0f1a;font-weight:700;transition:opacity 0.2s}' +
    '.invite-send-btn:hover{opacity:0.8}' +
    '.invite-send-btn:disabled{background:#2a2a4a;color:#888;cursor:default}' +
    '.invite-empty{color:#555;font-size:0.85rem;padding:1rem;text-align:center}' +
    '.invite-close{padding:0.4rem 1.2rem;border-radius:10px;font-family:inherit;font-size:0.8rem;cursor:pointer;' +
    'border:2px solid #2a2a4a;background:#0f0f1a;color:#aaa;font-weight:600;margin-top:1rem;display:block;width:100%}' +
    '.invite-close:hover{border-color:#7b2ff7;color:#e0e0e0}';
  document.head.appendChild(css);

  function addButton() {
    if (_isGuest() || document.querySelector('.invite-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'invite-btn';
    btn.innerHTML = '\uD83D\uDC4B Invite Friend';
    btn.onclick = showInviteModal;
    document.body.appendChild(btn);
  }

  async function showInviteModal() {
    if (!window.ArcadeFriends) return;

    var overlay = document.createElement('div');
    overlay.className = 'invite-overlay';

    var modal = document.createElement('div');
    modal.className = 'invite-modal';
    modal.innerHTML = '<h3>\uD83C\uDFAE Invite a Friend</h3>' +
      '<div id="inviteFriendsList"><div class="invite-empty">Loading friends...</div></div>' +
      '<button class="invite-close" id="inviteClose">Close</button>';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    modal.querySelector('#inviteClose').onclick = function() { overlay.remove(); };
    modal.onclick = function(e) { e.stopPropagation(); };

    var friends = await window.ArcadeFriends.getFriends();
    var list = modal.querySelector('#inviteFriendsList');

    if (friends.length === 0) {
      list.innerHTML = '<div class="invite-empty">No friends to invite. Add friends from your profile!</div>';
      return;
    }

    list.innerHTML = '';
    var gameName = GAME_NAMES[page] || page;

    friends.forEach(function(friendName) {
      var item = document.createElement('div');
      item.className = 'invite-friend';

      var name = document.createElement('span');
      name.className = 'invite-friend-name';
      name.textContent = friendName;

      var sendBtn = document.createElement('button');
      sendBtn.className = 'invite-send-btn';
      sendBtn.textContent = 'Invite';
      sendBtn.onclick = async function(e) {
        e.stopPropagation();
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        if (window.ArcadeNotifications) {
          var notif = window.ArcadeNotifications.create(
            'game_invite',
            'Game Invite',
            _getUser() + ' invited you to play ' + gameName + '!',
            '\uD83C\uDFAE',
            page + '.html',
            { from: _getUser(), gameId: page }
          );
          await window.ArcadeNotifications.push(friendName, notif);
        }

        sendBtn.textContent = 'Sent \u2714';
      };

      item.appendChild(name);
      item.appendChild(sendBtn);
      list.appendChild(item);
    });
  }

  // Add button when ready
  if (!_isGuest()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addButton);
    } else {
      addButton();
    }
  }

  window.addEventListener('arcade-auth-change', function() {
    var existing = document.querySelector('.invite-btn');
    if (_isGuest()) {
      if (existing) existing.remove();
    } else {
      addButton();
    }
  });
})();
