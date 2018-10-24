import * as md5Hasher from 'md5';

export const getGravatarUrlService = (email: string) => `http://www.gravatar.com/avatar/${md5Hasher(email)}.jpg?s=80`;
