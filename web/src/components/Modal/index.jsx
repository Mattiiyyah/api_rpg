import React from 'react';
import './Modal.css';

export default function Modal({ isOpen, title, children, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="btn-close" onClick={onCancel}>&times;</button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
                <div className="modal-actions">
                    {onCancel && (
                        <button className="btn-cancel-modal" onClick={onCancel}>
                            {cancelText}
                        </button>
                    )}
                    {onConfirm && (
                        <button className="btn-confirm-modal" onClick={onConfirm}>
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
