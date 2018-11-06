import * as md5Hasher from 'md5';
import { HttpsError } from 'firebase-functions/lib/providers/https';

export const getGravatarUrlService = (email: string) => {
    if (email === "" || email === undefined) {
        throw new HttpsError('invalid-argument', "Email was was empty or wasn't supplied.");
    }

    return `http://www.gravatar.com/avatar/${md5Hasher(email)}.jpg?s=80`;
}
