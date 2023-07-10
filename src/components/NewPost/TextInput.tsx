import { InputBase } from '@mui/material';
import React, {
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

interface TextInputProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  maxInputSize: number;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(props, inputRef) {
    const internalRef = useRef<HTMLInputElement>();

    useImperativeHandle(
      inputRef,
      () => {
        // return internalRef.current;
        return {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          // ...internalRef.current!,
          focus() {
            internalRef?.current?.focus();
          },

          getCaretPosition() {
            return internalRef.current?.selectionStart;
          },

          setSelectionRange(...args) {
            // document.getSelection()?.collapse(internalRef.current, 0);
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
