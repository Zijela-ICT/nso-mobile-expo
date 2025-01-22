import React, {createContext, useContext, useState, ReactNode} from 'react';

interface ActiveDrawerItemContextType {
  activeItem: string | null;
  setActiveItem: (itemId: string | null) => void;
}

const ActiveDrawerItemContext = createContext<
  ActiveDrawerItemContextType | undefined
>(undefined);

export const ActiveDrawerItemProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <ActiveDrawerItemContext.Provider value={{activeItem, setActiveItem}}>
      {children}
    </ActiveDrawerItemContext.Provider>
  );
};

export const useActiveDrawerItem = (): ActiveDrawerItemContextType => {
  const context = useContext(ActiveDrawerItemContext);
  if (context === undefined) {
    throw new Error(
      'useActiveDrawerItem must be used within an ActiveDrawerItemProvider',
    );
  }
  return context;
};
