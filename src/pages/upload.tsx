import { Box } from '@mui/material';
import { NextPage } from 'next';
import axios from 'axios';
import React, { ChangeEventHandler, FormEventHandler, useState } from 'react';

const Page: NextPage = () => {
  const [fileInput, setFileInput] = useState<File | undefined>();

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();

    if (!fileInput) {
      return;
    }

    const { signature, timestamp } = (await axios.get('/api/upload-image'))
      .data;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;

    const uploadEndpoint =
      'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload';

    const formData = new FormData();

    formData.append('file', fileInput);
    formData.append(
      'api_key',
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string,
    );
    formData.append('signature', signature);
    formData.append(
      'folder',
      process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER as string,
    );
    formData.append('timestamp', timestamp.toString());
    formData.append('transformation', 'c_scale,h_100');

    axios
      .post(uploadEndpoint, formData)
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setFileInput(file);
    }
  };

  return (
    <Box p={5}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="text_input">
          text
          <input type="text" id="text_input" />
        </label>

        <br />

        <label htmlFor="file_input">
          file
          <input type="file" id="file_input" onChange={handleFileChange} />
        </label>

        <br />
        <button type="submit">Submit</button>
      </form>
    </Box>
  );
};

export default Page;
