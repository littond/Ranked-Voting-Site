import { modeEnum } from '../constants';
import Create from './Create';
import Vote from './Vote';
import Results from './Results';

function RenderMode({ mode }) {
  let component = <div></div>;
  switch (mode) {
    case modeEnum.create:
      component = <Create />;
      break;
    case modeEnum.vote:
      component = <Vote />;
      break;
    case modeEnum.results:
      component = <Results />;
      break;
  }
  return (
    <div>
      {component}
    </div>
  );
}

export default RenderMode; 