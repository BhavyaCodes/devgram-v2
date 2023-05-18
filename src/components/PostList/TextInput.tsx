import { InputBase } from '@mui/material';
import React, { ChangeEventHandler, Dispatch, SetStateAction } from 'react';

interface TextInputProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
}

export const TextInput = ({ input, setInput }: TextInputProps) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput(e.target.value);
  };

  return (
    <InputBase
      fullWidth
      type="text"
      autoComplete="off"
      sx={{
        // border: '1px solid red',
        '&::placeholder': { color: '#71767B' },
        fontSize: 20,
      }}
      multiline
      placeholder="What is happening?!"
      inputProps={{
        maxLength: 280,
      }}
      onChange={onChange}
      value={input}
    />
  );
};
