"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const md5Hasher = require("md5");
exports.buildGravatarUrl = (email) => `http://www.gravatar.com/avatar/${md5Hasher(email)}.jpg?s=80`;
//# sourceMappingURL=buildGravatarURL.js.map