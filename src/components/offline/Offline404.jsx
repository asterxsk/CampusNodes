import React from 'react'

const Offline404 = () => {
  const container = {
    position: 'fixed',
    inset: 0,
    background: '#000',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    zIndex: 99999
  };

  const overlay = {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.04), rgba(0,0,0,0))',
    pointerEvents: 'none'
  };

  return (
    <div style={container} aria-label="Offline 404">
      <div style={overlay} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', fontWeight: 700, marginBottom: 8 }}>404</div>
        <div style={{ fontSize: '1.5rem' }}>Offline</div>
        <div style={{ marginTop: 6, opacity: 0.8 }}>This page is unavailable without an internet connection.</div>
      </div>
    </div>
  );
};

export default Offline404;
