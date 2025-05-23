import { useState } from 'react';

const BACKEND_API = "http://localhost:3000";

const modeEnum = {
  create: "create",
  vote: "vote",
  results: "results",
  default: "default"
}
Object.freeze(modeEnum);

function validChoices(choices) {
  let valid = [];

  choices.forEach(choice => {
    console.log(choice, choice.length);
    if (choice.length >= 1) {
      valid.push(choice);
    }
  });
  console.log("valid", valid)
  return valid;
}

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
  )
}

function Vote() {
  return (
    <div>
      Vote
    </div>
  )
}
function Results() {
  return (
    <div>
      Results
    </div>
  )
}

function RenderMode({ mode }) {
  let component = <div></div>;
  switch (mode) {
    case modeEnum.create:
      component = Create();
      break;
    case modeEnum.vote:
      component = Vote();
      break;
    case modeEnum.results:
      component = Results();
      break;
  }
  return (
    <div>
      {component}
    </div>
  )
}

function App() {
  const [mode, setMode] = useState(modeEnum.default)

  return (
    <div>
      <h1>HELLO</h1>
      <div>
        <button onClick={() => setMode(modeEnum.create)}>create</button>
        <button onClick={() => setMode(modeEnum.vote)}>vote</button>
        <button onClick={() => setMode(modeEnum.results)}>results</button>
      </div>
      <div>
        <RenderMode mode={mode}></RenderMode>
      </div>
    </div>
  )
}

export default App

// make 3 buttons
// each have on click
// when on click set state to _____
// conditional rendering for that state