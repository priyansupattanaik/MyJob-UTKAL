const CheckForStudentSeat = () => async (context) => {
    const { app, result } = context;

    const {
        user: { _id: student, role },
    } = result;

    if (role === 1) {
        context.result.user.studentSeat = await app
            .service('v2/student-seat')
            ._find({
                query: {
                    student,
                    status: { $in: [1, 2] },
                    $sort: { createdAt: -1 },
                    $populate: ['institute', 'instituteCourse', 'instituteBatch'],
                },
            })
            .then((res) => (res.total ? res.data[0] : null));
    }
};

export default CheckForStudentSeat;
