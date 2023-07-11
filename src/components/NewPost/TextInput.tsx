import { InputBase } from '@mui/material';
import React, {
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

export type TextInputHandle = {
  focus: () => void;
  getCaretPosition: () => number | null | undefined;
  setSelectionRange: (...args: any[]) => void;
  selectionStart?: number | null;
};

interface TextInputProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  maxInputSize: number;
}

export const TextInput = forwardRef<TextInputHandle, TextInputProps>(
  function TextInput(props, inputRef) {
    const internalRef = useRef<TextInputHandle>(null);

    useImperativeHandle(
      inputRef,
      () => {
        return {
          focus() {
            internalRef.current?.focus();
          },
          getCaretPosition() {
            return internalRef.current?.selectionStart;
          },
          setSelectionRange(...args) {
            internalRef.current?.setSelectionRange(...args);
          },
        };
      },
      [],
    );

    const { input, maxInputSize, setInput } = props;
    const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setInput(e.target.value);
    };

    return (
      <InputBase
        onFocus={() => console.log('focus')}
        inputRef={internalRef}
        fullWidth
        type="text"
        required
        autoComplete="off"
        sx={{
          '&::placeholder': { color: '#71767B' },
          fontSize: 20,
          ml: 1,
        }}
        multiline
        placeholder="What is happening?!"
        inputProps={{
          maxLength: maxInputSize,
        }}
        onChange={onChange}
        value={input}
      />
    );
  },
);

// export const TextInput = ({
//   input,
//   setInput,
//   maxInputSize,
// }: TextInputProps) => {
//   const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
//     getCaretLocation();
//     setInput(e.target.value);
//   };

//   const getCaretLocation = () => {
//     console.log(ref.current?.selectionStart);
//   };

//   return (
//     <InputBase
//       inputRef={ref}
//       fullWidth
//       type="text"
//       required
//       autoComplete="off"
//       sx={{
//         '&::placeholder': { color: '#71767B' },
//         fontSize: 20,
//         ml: 1,
//       }}
//       multiline
//       placeholder="What is happening?!"
//       inputProps={{
//         maxLength: maxInputSize,
//       }}
//       onChange={onChange}
//       value={input}
//     />
//   );
// };
