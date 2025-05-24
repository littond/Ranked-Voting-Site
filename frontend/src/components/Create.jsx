import { useState } from 'react';
import { BACKEND_API } from '../constants';
import { validChoices } from '../utils';

function Create() {
  const [choices, setChoices] = useState(["", ""]);

  const addChoice = () => {
    setChoices([...choices, ""]);
  }

  // update the value at a given index
  const handleChange = (idx, newChoice) => {
    setChoices(choices.map((c, i) => (i === idx ? newChoice : c)));
  };

  // on submit, do something with `values` (e.g. send to a server)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitted choices:", choices);
    const valid = validChoices(choices);

    if (valid.length >= 2) {
      // submit choices
      try {
        const res = await fetch(`${BACKEND_API}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ choices: valid })
        });

        if (!res.ok) {
          const errMsg = await res.text();
          console.error('Server error:', errMsg);
          return;
        }

        const newPollId = await res.text();
        console.log('Created poll with id:', newPollId);
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    } else {
      // error
      console.log("not enough choices");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {choices.map((choice, idx) => (
        <div key={idx} style={{ marginBottom: 8 }}>
          <input
            type="text"
            value={choice}
            onChange={(e) => handleChange(idx, e.target.value)}
            placeholder={`Input #${idx + 1}`}
          />
        </div>
      ))}

      <button type="button" onClick={addChoice}>
        + Add Input
      </button>

      <button type="submit" style={{ marginLeft: 8 }}>
        Submit
      </button>
    </form>
  );
}

export default Create; 