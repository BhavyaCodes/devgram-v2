import axios from 'axios';
import { CloudinaryFolderName, transformations } from '~/types';

export const uploadImage = async (
  file: File,
  folderName: CloudinaryFolderName,
): Promise<string | void> => {
  //Check Mime Type
  if (window.FileReader && window.Blob) {
    console.log(file.type);

    if (file.type.split('/')[0] !== 'image') {
      throw new Error('Wrong Image Format');
    }
  }

  const { signature, timestamp } = (
    await axios.get('/api/upload-image', {
      params: {
        type: folderName,
      },
    })
  ).data;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;

  const uploadEndpoint =
    'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload';

  const formData = new FormData();

  formData.append('file', file);
  formData.append(
    'api_key',
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string,
  );
  formData.append('signature', signature);
  formData.append(
    'folder',
    `${process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER}/${folderName}`,
  );
  formData.append('timestamp', timestamp.toString());
  formData.append('transformation', transformations[folderName]);

  return axios
    .post(uploadEndpoint, formData, {
      onUploadProgress: (e) => {
        console.log(folderName, e.progress);
      },
    })
    .then((res) => {
      return res.data.public_id as string;
    })
    .catch((err) => {
      return err;
      console.log(err);
    });
};
