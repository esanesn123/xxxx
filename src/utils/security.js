/**
 * Advanced Security Protection Script
 * Prevents inspection, right-clicking, and keyboard shortcuts for DevTools.
 */

export const initializeSecurity = () => {
  if (import.meta.env.MODE === 'development') return;

  // Disable right-click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Disable keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Disable F12
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (e.ctrlKey && (e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
  });

  // Advanced Anti-debugging loop
  const antiDebug = () => {
    // Detect console opening via element id getter
    const devtools = {
      isOpen: false,
      orientation: undefined
    };
    const threshold = 160;
    
    const emitEvent = (isOpen, orientation) => {
      if (isOpen) {
        document.body.innerHTML = `
          <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#020617;color:#f43f5e;font-family:'Outfit',sans-serif;text-align:center;padding:40px;">
            <div style="font-size:80px;margin-bottom:20px;">⚠️</div>
            <h1 style="font-size:32px;font-weight:800;margin-bottom:16px;letter-spacing:-0.025em;">SECURITY PROTOCOL ACTIVE</h1>
            <p style="color:#94a3b8;font-size:18px;max-width:500px;line-height:1.6;">DevTools usage is strictly prohibited on this platform. Your session has been terminated for security reasons.</p>
            <button onclick="window.location.reload()" style="margin-top:32px;padding:12px 24px;background:#f43f5e;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.2s;">Secure Reconnect</button>
          </div>
        `;
        throw new Error('DevTools detected');
      }
    };

    setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const orientation = widthThreshold ? 'vertical' : 'horizontal';

      if (!(heightThreshold && widthThreshold) && 
          ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
        if (!devtools.isOpen || devtools.orientation !== orientation) {
          emitEvent(true, orientation);
        }
        devtools.isOpen = true;
        devtools.orientation = orientation;
      } else {
        devtools.isOpen = false;
        devtools.orientation = undefined;
      }
    }, 500);

    // debugger loop
    (function() {
      (function a() {
        try {
          (function b(i) {
            if (('' + (i / i)).length !== 1 || i % 20 === 0) {
              (function() {}).constructor('javascript:debugger')();
            } else {
              debugger;
            }
            b(++i);
          }(0));
        } catch (e) {
          setTimeout(a, 5000);
        }
      }());
    }());
  };

  antiDebug();

  // Disable drag and drop (optional but good for anti-scraping)
  document.addEventListener('dragstart', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());
};
