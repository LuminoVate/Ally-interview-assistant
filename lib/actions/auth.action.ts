// export async function getInterviewByUserId(userID:string) : Promise<Interview[] |null>{
//     const interviews = await db
//     .collection('interviews')
//     // .where ('userId','==',userId)
//     .orderBy('createdAt','desc')
//     .get();

//     return interviews.docs.map((doc)->({
//         id:doc.id,
//         ...doc.data();
//     })) as Interview[];
// }