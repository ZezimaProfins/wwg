'use strict';

window.addEventListener('load', () => {
  const widgets = document.querySelectorAll('discord-widget');

  widgets.forEach(widget => {
    // Attributes
    const guildId = widget.getAttribute('data-server-id') || widget.getAttribute('id');
    const width = widget.getAttribute('width') || '400px';
    const height = widget.getAttribute('height') || '500px';
    const footerText = widget.getAttribute('footerText') || 'MU.WWG.LV';
    const color = widget.getAttribute('color') || '#5865f2';
    const backgroundColor = widget.getAttribute('backgroundColor') || '#0c0c0d';
    const textColor = widget.getAttribute('textColor') || '#fff';
    const statusColor = widget.getAttribute('statusColor') || '#858585';

    // Structure
    const head = document.createElement('widget-header');
    const logo = document.createElement('widget-logo');
    const count = document.createElement('widget-header-count');
    head.append(logo, count);

    const body = document.createElement('widget-body');
    if (!guildId) {
      body.textContent = 'No Discord server ID specified.';
    }

    const footer = document.createElement('widget-footer');
    const footerInfo = document.createElement('widget-footer-info');
    const joinButton = document.createElement('widget-button-join');

    joinButton.textContent = 'Join';
    footerInfo.textContent = footerText;

    joinButton.addEventListener('click', () => {
      const href = joinButton.getAttribute('href');
      if (href) window.open(href, '_blank');
    });

    footer.append(footerInfo, joinButton);

    // Styles
    widget.style.height = height;
    widget.style.width = width;
    widget.style.setProperty('--color', color);
    widget.style.setProperty('--bgColor', backgroundColor);
    widget.style.setProperty('--textColor', textColor);
    widget.style.setProperty('--statusColor', statusColor);
    widget.style.setProperty('--buttonColor', safeShade(color, -10));

    // Assemble
    widget.append(head, body, footer);

    // Fetch Discord data
    if (!guildId) return;

    fetch(`https://discord.com/api/guilds/${guildId}/widget.json`)
      .then(res => res.json())
      .then(data => {
        count.innerHTML = `<strong>${data.presence_count || 0}</strong> Members Online`;

        if (data.instant_invite) {
          joinButton.setAttribute('href', data.instant_invite);
        } else {
          joinButton.remove();
        }

        if (!Array.isArray(data.members)) {
          body.textContent = 'No members to display.';
          return;
        }

        data.members.forEach(user => {
          const member = document.createElement('widget-member');
          const avatar = document.createElement('widget-member-avatar');
          const img = document.createElement('img');
          const status = document.createElement(`widget-member-status-${user.status}`);
          const name = document.createElement('widget-member-name');
          const statusText = document.createElement('widget-member-status-text');

          img.src = user.avatar_url;
          status.classList.add('widget-member-status');
          name.textContent = user.username;
          if (user.game?.name) statusText.textContent = user.game.name;

          avatar.append(img, status);
          member.append(avatar, name, statusText);
          body.append(member);
        });
      })
      .catch(() => {
        body.textContent = 'Failed to load Discord data.';
      });
  });
});

// Safer color shade function
function safeShade(hex, percent) {
  const c = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(c)) return hex;
  const num = parseInt(c, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (clamp(R) << 16) +
      (clamp(G) << 8) +
      clamp(B)
    )
      .toString(16)
      .slice(1)
  );
}

function clamp(v) {
  return Math.min(255, Math.max(0, v));
}