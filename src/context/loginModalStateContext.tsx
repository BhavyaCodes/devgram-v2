import {
  FC,
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
} from 'react';

type LoginModalStateContextType =
  | {
      open: boolean;
      setOpen: Dispatch<SetStateAction<boolean>>;
    }
  | undefined;

const LoginModalStateContext =
  createContext<LoginModalStateContextType>(undefined);

export const useLoginModalStateContext = () => {
  const context = useContext(LoginModalStateContext);

  if (context === undefined) {
    throw new Error(
      'useLoginModalStateContext must be used within a LoginModalStateContextProvider',
    );
  }

  return context;
};

export const LoginModalStateContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <LoginModalStateContext.Provider value={{ open, setOpen }}>
      {children}
    </LoginModalStateContext.Provider>
  );
};
