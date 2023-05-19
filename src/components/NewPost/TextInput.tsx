import { InputBase } from '@mui/material';
import React, { ChangeEventHandler, Dispatch, SetStateAction } from 'react';

interface TextInputProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  maxInputSize: number;
}

export const TextInput = ({
  input,
  setInput,
  maxInputSize,
}: TextInputProps) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput(e.target.value);
  };

  return (
    <InputBase
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
};
