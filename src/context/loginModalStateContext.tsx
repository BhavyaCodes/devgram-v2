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
      message: null | string;
      setMessage: Dispatch<SetStateAction<null | string>>;
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

export enum loginModalMessage {
  COMMENT = 'You must login to comment on this post',
  LIKE = 'You must login to like this post',
}

export const LoginModalStateContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [message, setMessage] = useState<null | string>(null);
  return (
    <LoginModalStateContext.Provider value={{ message, setMessage }}>
      {children}
    </LoginModalStateContext.Provider>
  );
};
