// import * as admin from "firebase-admin";
// import {getBoardSnap, getListSnap, getTaskSnap, isOwner} from "./dbUtils";
// import {IAddAttachmentResponse, IAddViewerResponse} from "../dtos/responses";
// import {IAddAttachmentRequest, IAddViewerRequest} from "../dtos/requests";
// import {firestore} from "firebase-admin";
//
// export const addAttachmentService = (request: IAddAttachmentRequest, userId: string): Promise<IAddAttachmentResponse> => {
//     return new Promise((resolve, reject) => {
//         if (request.boardId === "" || request.boardId === undefined) {
//             const rejectResponse = {
//                 status: 'invalid-argument',
//                 message: "Board's id was empty or wasn't supplied.",
//             };
//             reject(rejectResponse);
//             return;
//         }
//
//         if (request.listId === "" || request.listId === undefined) {
//             const rejectResponse = {
//                 status: 'invalid-argument',
//                 message: "List's id was empty or wasn't supplied.",
//             };
//             reject(rejectResponse);
//             return;
//         }
//
//         if (request.taskId === "" || request.taskId === undefined) {
//             const rejectResponse = {
//                 status: 'invalid-argument',
//                 message: "Task's id was empty or wasn't supplied.",
//             };
//             reject(rejectResponse);
//             return;
//         }
//
//         if (request.attachmentName === "" || request.attachmentName === undefined) {
//             const rejectResponse = {
//                 status: 'invalid-argument',
//                 message: "Attachment's name was empty or wasn't supplied.",
//             };
//             reject(rejectResponse);
//             return;
//         }
//
//         if (request.attachmentContent === "" || request.attachmentContent === undefined) {
//             const rejectResponse = {
//                 status: 'invalid-argument',
//                 message: "Attachment's content was empty or wasn't supplied.",
//             };
//             reject(rejectResponse);
//             return;
//         }
//
//         if (request.attachmentType === "" || request.attachmentType === undefined) {
//             const rejectResponse = {
//                 status: 'invalid-argument',
//                 message: "Attachment's type was empty or wasn't supplied.",
//             };
//             reject(rejectResponse);
//             return;
//         }
//
//         if (userId === "" || userId === undefined) {
//             const rejectResponse = {
//                 status: 'invalid-argument',
//                 message: "User's id was empty or wasn't supplied.",
//             };
//             reject(rejectResponse);
//             return;
//         }
//
//
//         getBoardSnap(request.boardId, userId).then((boardSnap) => {
//             if (!isOwner(boardSnap, userId)) {
//                 const rejectResponse = {
//                     status: 'permission-denied',
//                     message: "You don't have access to this board.",
//                 };
//                 reject(rejectResponse);
//                 return;
//             }
//             getListSnap(boardSnap, userId).then((listSnap) => {
//                 getTaskSnap(listSnap, userId).then((taskSnap) => {
//                     const response: IAddAttachmentResponse = {
//                         boardId: request.boardId,
//                         listId: request.listId,
//                         taskId: request.taskId,
//                         attachmentId: request.boardId,
//                     };
//
//                     const attachmentDoc = firestore().collection("attachments").doc();
//
//                     const attachmentFile = admin.storage().bucket().file("attachments/" + attachmentDoc.id);
//                     const attachmentFileWriteOptions = {
//                         contentType: request.attachmentType,
//                     };
//
//                     request.attachmentContent;
//
//                     attachmentFile.createWriteStream(attachmentFileWriteOptions).
//
//                     admin.storage().bucket().upload("attachments/" + attachmentDoc.id, ).then((files: any) => {
//                         const attachmentName = "attachments/" + snap.id;
//                         const deletedAttachmentFile = files[0].find((file: any) => file.name.indexOf(attachmentName) !== -1);
//
//                         if (deletedAttachmentFile !== undefined) {
//                             deletedAttachmentFile.delete();
//                         } else {
//                             console.log("Attachment with name " + attachmentName + " doesn't exist.");
//                         }
//                     }).catch((err) => {
//                         console.error("Error while deleting attachment from storage:");
//                         console.error(err);
//                     });
//
//                 }).catch((err) => {
//                     console.error(err);
//                     const rejectResponse = {
//                         status: err.status,
//                         message: err.message,
//                     };
//                     reject(rejectResponse);
//                     return;
//                 });
//
//             }).catch((err) => {
//                 console.error(err);
//                 const rejectResponse = {
//                     status: err.status,
//                     message: err.message,
//                 };
//                 reject(rejectResponse);
//                 return;
//             });
//
//         }).catch((err) => {
//             console.error(err);
//             const rejectResponse = {
//                 status: err.status,
//                 message: err.message,
//             };
//             reject(rejectResponse);
//             return;
//         });
//
//     });
// };