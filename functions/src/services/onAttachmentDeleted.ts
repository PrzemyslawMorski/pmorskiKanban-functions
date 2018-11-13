import * as admin from "firebase-admin";
import DocumentSnapshot = admin.firestore.DocumentSnapshot;

export const onAttachmentDeletedService = (snap: DocumentSnapshot) => {
    if (snap.id === "") {
        console.log("attachmentId was empty");
        return;
    }

    admin.storage().bucket().getFiles().then((files: any) => {
        const attachmentName = "attachments/" + snap.id;
        const deletedAttachmentFile = files[0].find((file: any) => file.name.indexOf(attachmentName) !== -1);

        if (deletedAttachmentFile !== undefined) {
            deletedAttachmentFile.delete();
        } else {
            console.log("Attachment with name " + attachmentName + " doesn't exist.");
        }
    }).catch((err) => {
        console.error("Error while deleting attachment from storage:");
        console.error(err);
    });
};