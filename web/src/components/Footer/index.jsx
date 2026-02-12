import React from 'react';
import './Footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <span className="footer-logo">🎲</span>
                    <span className="footer-name">SudoGestor</span>
                </div>

                <p className="footer-tagline">
                    Gerencie suas campanhas de RPG com poderes de root.
                </p>

                <div className="footer-divider"></div>

                <p className="footer-copyright">
                    © {currentYear} SudoGestor. Feito com 💜 para mestres de mesa.
                </p>
            </div>
        </footer>
    );
}
