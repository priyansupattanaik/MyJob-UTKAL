/**
 * Created by Soumya (soumya@smarttersstudio.com) on 21/05/21 at 6:45 PM.
 * @description set current time for the given field
 */

const SetCurrentTime = (key) => async (context) => {
    const { data } = context;

    if (Array.isArray(data)) {
        context.data.map((each) => {
            each[key] = new Date();
        });
    } else {
        context.data[key] = new Date();
    }
};

export default SetCurrentTime;
