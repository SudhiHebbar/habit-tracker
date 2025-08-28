import React, { useState } from 'react';

const SimpleAnimationTest: React.FC = () => {
  const [showContent, setShowContent] = useState(true);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Simple Animation Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowContent(!showContent)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Toggle Content
        </button>
      </div>

      {showContent && (
        <div 
          style={{
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            animation: 'fadeIn 0.3s ease-out',
            border: '1px solid #e5e7eb'
          }}
        >
          <h3>Animated Content</h3>
          <p>This content should fade in smoothly when toggled.</p>
          
          <div 
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '0.375rem',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h4>Hover Effect Test</h4>
            <p>Hover over this card to see a scale and shadow animation.</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleAnimationTest;