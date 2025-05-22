import { getItems, replaceItems } from 'feathers-hooks-common';

const findAndSetInstitutes = () => async (context) => {
    const { app } = context;
    const items = getItems(context);
    const { user } = items;
    if (!user) return context;

    if (items.authentication) delete items.authentication;

    const userAccessService = app.service('user-institute-access');

    user.institutes = await userAccessService._find({
        query: {
            // institute: {
            // 	$ne: null,
            // },
            $populate: ['institute', 'requestData.course', 'requestData.specialization'],
            user: user._id,
        },
        paginate: false,
    });

    if (!user.currentInstitute && user.institutes.length) {
        const userService = app.service('users');

        const currentInstitute = user.institutes[0].institute;

        if (currentInstitute) {
            await userService._patch(user._id, { currentInstitute });

            user.currentInstitute = currentInstitute._id;
        }
    }

    replaceItems(context, items);
    return context;
};

export default findAndSetInstitutes;
