'use strict';

class DiscordWidget extends HTMLElement {
  async connectedCallback() {
    // Attributes (with defaults)
    const guildId = this.dataset.serverId || this.id;
    const width = this.getAttribute('width') || '400px';
    const height = this.getAttribute('height') || '500px';
    const footerText = this.getAttribute('footerText') || 'Kundun Online';
    const color = this.getAttribute('color') || '#5865f2';
    const backgroundColor = this.getAttribute('backgroundColor') || '#0c0c0d';
    const textColor = this.getAttribute('textColor') || '#fff';
    const statusColor = this.getAttribute('statusColor') || '#858585';

    // Basic structure
    const head = document.createElement('widget-header');
    const logo = document.createElement('widget-logo');
    const count = document.createElement('widget-header-count');
    head.append(logo, count);

    const body = document.createElement('widget-body');
    const footer = document.createElement('widget-footer');
    const footerInfo = document.createElement('widget-footer-info');
    const joinButton = document.createElement('widget-button-join');
    joinButton.textContent = 'Join';
    footerInfo.textContent = footerText;
    footer.append(footerInfo, joinButton);

    // Apply styles via CSS custom properties
    Object.assign(this.style, { height, width });
    this.style.setProperty('--color', color);
    this.style.setProperty('--bgColor', backgroundColor);
    this.style.setProperty('--textColor', textColor);
    this.style.setProperty('--statusColor', statusColor);
    this.style.setProperty('--buttonColor', safeShade(color, -10));

    // Assemble
    this.append(head, body, footer);

    // Handle join button
    joinButton.addEventListener('click', () => {
      const href = joinButton.getAttribute('href');
      if (href) window.open(href, '_blank');
    });

    // No guild ID? Show error and exit
    if (!guildId) {
      body.textContent = 'No Discord server ID specified.';
      return;
    }

    // Fetch data
    try {
      const res = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

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

      // Build member list
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
    } catch (err) {
      console.error(err);
      body.textContent = 'Failed to load Discord data.';
    }
  }
}

// Register the custom element
customElements.define('discord-widget', DiscordWidget);

// Utility: safer color shading
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
