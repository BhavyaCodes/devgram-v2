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
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<null | loginModalMessage>(null);
  return (
    <LoginModalStateContext.Provider
      value={{ open, setOpen, message, setMessage }}
    >
      {children}
    </LoginModalStateContext.Provider>
  );
};
