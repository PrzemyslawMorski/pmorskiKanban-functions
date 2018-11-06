
export const deleteSubcollectionsService = (snap: FirebaseFirestore.DocumentSnapshot) => {
    console.log("Started deleting subcollections of " + snap.id);
    snap.ref.getCollections()
        .then(collections => {
            collections.forEach(collection => {
                collection.get()
                    .then(docSnaps => {
                        docSnaps.forEach((docSnap => {
                            docSnap.ref.delete()
                                .then(() => {
                                    console.log("Finished deleting subcollections of " + snap.id);
                                    deleteSubcollectionsService(docSnap);
                                })
                                .catch((err) => {
                                    console.error(err);
                                    console.error('err while deleting docSnap ' + docSnap.id);
                                });
                        }))
                    })
                    .catch((err) => {
                        console.error(err);
                        console.error('err while getting docsnaps from collection ' + collection.id);
                    })
            })
        })
        .catch((err) => {
            console.error(err);
            console.error('err while getting collections from docsnap ' + snap.id);
        })
};