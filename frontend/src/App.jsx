import { useState } from 'react';
import { modeEnum } from './constants';
import RenderMode from './components/RenderMode';

function App() {
  const [mode, setMode] = useState(modeEnum.default);

  return (
    <div>
      <h1>HELLO</h1>
      <div>
        <button onClick={() => setMode(modeEnum.create)}>create</button>
        <button onClick={() => setMode(modeEnum.vote)}>vote</button>
        <button onClick={() => setMode(modeEnum.results)}>results</button>
      </div>
      <div>
        <RenderMode mode={mode} />
      </div>
    </div>
  );
}

export default App; 