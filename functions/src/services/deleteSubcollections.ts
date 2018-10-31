
export const deleteSubcollectionsService = (snap: FirebaseFirestore.DocumentSnapshot) => {
    snap.ref.getCollections()
        .then(collections => {
            collections.forEach(collection => {
                collection.get()
                    .then(docSnaps => {
                        docSnaps.forEach((docSnap => {
                            docSnap.ref.delete()
                                .then(() => {
                                    deleteSubcollectionsService(docSnap);
                                })
                                .catch((err) => {
                                    console.log(err);
                                    console.log('err while deleting docSnap ' + docSnap.id);
                                });
                        }))
                    })
                    .catch((err) => {
                        console.log(err);
                        console.log('err while getting docsnaps from collection ' + collection.id);
                    })
            })
        })
        .catch((err) => {
            console.log(err);
            console.log('err while getting collections from docsnap ' + snap.id);
        })
};