import { useState } from 'react';
import { BACKEND_API } from '../constants';

function Vote() {
  const [pollId, setPollId] = useState('');
  const [choices, setChoices] = useState([]);
  const [userRanking, setUserRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the choices from the backend
  const fetchChoices = async () => {
    if (!pollId.trim()) {
      setError('Please enter a poll ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_API}/poll?pollId=${pollId}`);
      
      if (!res.ok) {
        const errMsg = await res.text();
        setError(`Error: ${errMsg}`);
        return;
      }

      const pollData = await res.json();
      console.log("Poll Data: ", pollData);
      setChoices(pollData || []);
      setUserRanking([...pollData] || []);
    } catch (err) {
      setError('Failed to fetch poll data');
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Move choice up in ranking
  const moveUp = (index) => {
    if (index > 0) {
      const newRanking = [...userRanking];
      [newRanking[index], newRanking[index - 1]] = [newRanking[index - 1], newRanking[index]];
      setUserRanking(newRanking);
    }
  };

  // Move choice down in ranking
  const moveDown = (index) => {
    if (index < userRanking.length - 1) {
      const newRanking = [...userRanking];
      [newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]];
      setUserRanking(newRanking);
    }
  };

  // Submit the user's ranking to the backend
  const handleSubmit = async () => {
    if (userRanking.length === 0) {
      setError('No choices to vote on');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_API}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          pollId, 
          votes: userRanking 
        })
      });

      if (!res.ok) {
        const errMsg = await res.text();
        setError(`Error submitting vote: ${errMsg}`);
        return;
      }

      alert('Vote submitted successfully!');
      // Reset form
      setPollId('');
      setChoices([]);
      setUserRanking([]);
    } catch (err) {
      setError('Failed to submit vote');
      console.error('Submit failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Vote on Poll</h2>
      
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
            onClick={fetchChoices} 
            disabled={loading}
            style={{ padding: '8px 16px' }}
          >
            {loading ? 'Loading...' : 'Load Poll'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Choices ranking box */}
      {userRanking.length > 0 && (
        <div style={{ 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>Rank the choices (1st to last):</h3>
          <div style={{ marginBottom: '20px' }}>
            {userRanking.map((choice, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  margin: '5px 0',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <span style={{ 
                  marginRight: '10px', 
                  fontWeight: 'bold',
                  minWidth: '30px'
                }}>
                  #{index + 1}
                </span>
                <span style={{ flex: 1 }}>{choice}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    style={{ 
                      padding: '4px 8px',
                      fontSize: '12px',
                      opacity: index === 0 ? 0.5 : 1
                    }}
                  >
                    ↑ Up
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === userRanking.length - 1}
                    style={{ 
                      padding: '4px 8px',
                      fontSize: '12px',
                      opacity: index === userRanking.length - 1 ? 0.5 : 1
                    }}
                  >
                    ↓ Down
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Vote; 


// create a box component
// create a input field for the user to enter their poll number
// fetch the choices from the backend
// display the choices in the box in order they came in
// when the up or down button is clicked, update the vote count
// when submit button is clicked, inform the backend of the order
