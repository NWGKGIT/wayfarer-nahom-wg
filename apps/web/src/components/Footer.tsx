import React from 'react';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-left">
        <span>WAYFARER</span>
        <span className="footer-sep">•</span>
        <span>MADE FOR CURIOUS TRAVELLERS</span>
        <span className="footer-sep">•</span>
        <span>ADDIS ABABA</span>
      </div>

      <div className="footer-right">
        <span>Crafted for Rago Systems</span>
        <span className="footer-sep">•</span>
        <a
          href="https://nahomw.tech"
          target="_blank"
          rel="noopener noreferrer"
        >
          nahomw.tech
        </a>
      </div>
    </footer>
  );
}
