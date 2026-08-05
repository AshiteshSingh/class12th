'use client';

import { useState, useEffect } from 'react';
import { ALL_ZONAL_PARTICIPANTS } from '../utils/participants';

export default function ParticipantModal({ isOpen, onClose, onSelect, currentName, assignedNames = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [customName, setCustomName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setCustomName('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const categories = ['All', 'Senior', 'Junior', 'Sub-Junior'];

    const filteredParticipants = ALL_ZONAL_PARTICIPANTS.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.categoryShort === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
        return matchesCategory && matchesSearch;
    });

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (customName.trim()) {
            onSelect(customName.trim());
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '620px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                overflow: 'hidden',
                color: '#f8fafc'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.6)'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, #60a5fa, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            👤 Select Student Participant
                        </h3>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                            Choose from the official ASISC Zonal roster or type a custom name
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            lineHeight: 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                        ×
                    </button>
                </div>

                {/* Filters & Search */}
                <div style={{ padding: '1rem 1.5rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="🔍 Search participant name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                    />

                    {/* Category Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {categories.map(cat => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        padding: '0.35rem 0.85rem',
                                        borderRadius: '20px',
                                        border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                                        background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                                        color: isSelected ? '#93c5fd' : '#94a3b8',
                                        fontSize: '0.82rem',
                                        fontWeight: isSelected ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Student Roster List */}
                <div style={{
                    padding: '0.5rem 1.5rem',
                    overflowY: 'auto',
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '0.6rem',
                    maxHeight: '340px'
                }}>
                    {filteredParticipants.map(p => {
                        const isCurrent = currentName === p.name;
                        const isAssigned = assignedNames.includes(p.name) && !isCurrent;

                        let catColor = '#3b82f6';
                        if (p.categoryShort === 'Junior') catColor = '#10b981';
                        if (p.categoryShort === 'Sub-Junior') catColor = '#f59e0b';

                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                    onSelect(p.name);
                                    onClose();
                                }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: isCurrent
                                        ? '1.5px solid #3b82f6'
                                        : '1px solid rgba(255, 255, 255, 0.08)',
                                    background: isCurrent
                                        ? 'rgba(59, 130, 246, 0.2)'
                                        : 'rgba(15, 23, 42, 0.5)',
                                    color: isCurrent ? '#93c5fd' : '#e2e8f0',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '0.35rem',
                                    transition: 'all 0.15s ease',
                                    opacity: isAssigned ? 0.6 : 1,
                                }}
                                onMouseEnter={e => {
                                    if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                }}
                                onMouseLeave={e => {
                                    if (!isCurrent) e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{p.name}</span>
                                    {isCurrent && <span style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700 }}>✓ Selected</span>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        color: catColor,
                                        background: `${catColor}20`,
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '12px'
                                    }}>
                                        {p.categoryShort}
                                    </span>
                                    {isAssigned && (
                                        <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontStyle: 'italic' }}>
                                            Assigned elsewhere
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {filteredParticipants.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                            No participants found matching "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Custom Name & Action Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Type a custom student name..."
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '0.6rem 0.9rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.88rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!customName.trim()}
                            style={{
                                padding: '0.6rem 1.2rem',
                                background: customName.trim() ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                                color: customName.trim() ? '#fff' : '#64748b',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                cursor: customName.trim() ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Add Custom
                        </button>
                    </form>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {currentName ? (
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect('');
                                    onClose();
                                }}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    padding: '0.4rem 0.9rem',
                                    borderRadius: '6px',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                🗑 Clear Selection
                            </button>
                        ) : <div />}

                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#e2e8f0',
                                border: 'none',
                                padding: '0.4rem 1.2rem',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
