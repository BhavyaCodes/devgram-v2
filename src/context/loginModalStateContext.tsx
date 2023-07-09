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
      message: loginModalMessage | null;
      setMessage: Dispatch<SetStateAction<loginModalMessage | null>>;
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
  Like = 'You must login to like this post',
}

export const LoginModalStateContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [message, setMessage] = useState<null | loginModalMessage>(null);
  return (
    <LoginModalStateContext.Provider value={{ message, setMessage }}>
      {children}
    </LoginModalStateContext.Provider>
  );
};
