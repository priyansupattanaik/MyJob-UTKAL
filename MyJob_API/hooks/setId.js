/**
 * Created by Santanu <santanu@smarttersstudio.com> on 23/04/2020
 * @description set current user to Created By user
 */

/**
 *
 * @returns {function(...[*]=)}
 */
const setId = () => (context) => {
    const { params } = context;
    if (!params.user) return context;

    context.id = params.user._id;

    return context;
};

export default setId;
