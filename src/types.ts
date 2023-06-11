export type CloudinaryFolderName = 'avatar' | 'post' | 'banner';

export const transformations: Record<CloudinaryFolderName, string> = {
  avatar: 'c_fill,g_face,w_300,h_300,r_max,f_png',
  banner: 'c_fill,w_600,h_200,e_improve,f_jpg',
  post: 'c_scale,h_100',
};
