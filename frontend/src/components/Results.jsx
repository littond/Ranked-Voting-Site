import { useState } from 'react';
import { BACKEND_API } from '../constants';

function Results() {
  const [pollId, setPollId] = useState('');
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the winner from the backend
  const fetchResults = async () => {
    if (!pollId.trim()) {
      setError('Please enter a poll ID');
      return;
    }

    setLoading(true);
    setError('');
    setWinner(null);
    
    try {
      const res = await fetch(`${BACKEND_API}/votes?pollId=${pollId}`);
      
      if (!res.ok) {
        const errMsg = await res.text();
        setError(`Error: ${errMsg}`);
        return;
      }

      const winnerData = await res.text(); // Backend sends winner as plain text
      console.log("Winner Data: ", winnerData);
      
      if (winnerData === 'false') {
        setWinner('No winner determined - tie or insufficient votes');
      } else {
        setWinner(winnerData);
      }
    } catch (err) {
      setError('Failed to fetch results');
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Poll Results</h2>
      
      {/* Input field for poll ID */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="pollId">Enter Poll ID:</label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <input
            id="pollId"
            type="text"
            value={pollId}
            onChange={(e) => setPollId(e.target.value)}
            placeholder="Enter poll ID"
            style={{ flex: 1, padding: '8px' }}
          />
          <button 
            onClick={fetchResults} 
            disabled={loading}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {loading ? 'Loading...' : 'Get Results'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Results display */}
      {winner && (
        <div style={{ 
          border: '1px solid #28a745', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#d4edda',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#155724', marginTop: 0 }}>🎉 Poll Results</h3>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: '#155724',
            textAlign: 'center',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #c3e6cb'
          }}>
            {winner.includes('No winner') ? (
              <span>⚖️ {winner}</span>
            ) : (
              <span>🏆 Winner: {winner}</span>
            )}
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: '#6c757d', 
            marginTop: '10px',
            marginBottom: 0 
          }}>
            Results calculated using ranked choice voting
          </p>
        </div>
      )}

      {/* Instructions */}
      {!winner && !loading && !error && (
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h4>How to use:</h4>
          <ol>
            <li>Enter the Poll ID you want to see results for</li>
            <li>Click "Get Results" to fetch the winner</li>
            <li>The winner is determined using ranked choice voting</li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default Results; 