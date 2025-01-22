// ScreenDimensionsContext.tsx
import React, {createContext, useState, useEffect} from 'react';
import {Dimensions, ScaledSize} from 'react-native';

interface ScreenDimensions {
  width: number;
  height: number;
}

interface ScreenDimensionsContextType {
  screenDimensions: ScreenDimensions;
}

const ScreenDimensionsContext = createContext<ScreenDimensionsContextType>({
  screenDimensions: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export const ScreenDimensionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  const handleOrientationChange = ({window}: {window: ScaledSize}) => {
    setScreenDimensions({
      width: window.width,
      height: window.height,
    });
  };

  useEffect(() => {
    const dimensions = Dimensions.addEventListener(
      'change',
      handleOrientationChange,
    );
    return () => {
      dimensions.remove();
    };
  }, []);

  return (
    <ScreenDimensionsContext.Provider value={{screenDimensions}}>
      {children}
    </ScreenDimensionsContext.Provider>
  );
};

export default ScreenDimensionsContext;
