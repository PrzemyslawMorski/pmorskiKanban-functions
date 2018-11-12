import * as admin from "firebase-admin";
import {ISearchUsersResponse} from "../dtos/responses";
import {ISearchUsersRequest} from "../dtos/requests";
import {getBoardSnap} from "./dbUtils";
import {IUser} from "../dtos/IUser";
import ListUsersResult = admin.auth.ListUsersResult;
import UserRecord = admin.auth.UserRecord;

export const searchUsersByEmailService = (request: ISearchUsersRequest, userId: string): Promise<ISearchUsersResponse> => {
    return new Promise((resolve, reject) => {
        if (request.phrase === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "Search phrase was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        if (userId === "" || userId === undefined) {
            const rejectResponse = {
                status: 'invalid-argument',
                message: "User's id was empty or wasn't supplied.",
            };
            reject(rejectResponse);
            return;
        }

        getBoardSnap(request.boardId, userId).then((boardSnap) => {
            const boardViewers = boardSnap.data().viewers;

            admin.auth().listUsers(400).then((users: ListUsersResult) => {
                const response: ISearchUsersResponse = {
                    boardId: request.boardId,
                    users: users.users
                        .filter((user) => user.uid !== boardSnap.data().ownerId) // not owner
                        .filter((user) => boardViewers.indexOf(user.uid) === -1) // not viewer
                        .filter((user) => user.email.indexOf(request.phrase) !== -1) // matches phrase
                        .slice(0, 20)
                        .map((user: UserRecord) => {
                            return {
                                uid: user.uid,
                                email: user.email,
                                photoURL: user.photoURL,
                                displayName: user.displayName,
                            };
                        })
                        .sort((user1: IUser, user2: IUser) =>
                            user1.email.toLowerCase() > user2.email.toLowerCase() ? 1
                                : (user1.email.toLowerCase() === user2.email.toLowerCase() ? 0
                                : -1)),
                };
                resolve(response);
                return;
            }).catch((err) => {
                console.error(err);
                const rejectResponse = {
                    status: 'internal',
                    message: "Users were not fetched. There is a problem with the database. Please try again later.",
                };
                reject(rejectResponse);
                return;
            });
        }).catch((err) => {
            console.error(err);
            const rejectResponse = {
                status: err.status,
                message: err.message,
            };
            reject(rejectResponse);
            return;
        });


    });
};