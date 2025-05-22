const setCreatedBy =
    (key = 'createdBy') =>
    (context) => {
        const { user } = context.params;
        // console.log(user);
        if (typeof context.params.provider === 'undefined' && !user) return context;
        if (Array.isArray(context.data)) {
            context.data.map((each) => {
                each[key] = user._id;
            });
        } else {
            context.data[key] = user._id;
        }
        return context;
    };

export default setCreatedBy;
