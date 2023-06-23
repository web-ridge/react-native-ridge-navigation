import * as React from 'react';

const OptimizedRenderScene = React.memo(
  ({ renderScene }: { renderScene: () => any }) => {
    return renderScene();
  }
);

export default OptimizedRenderScene;
