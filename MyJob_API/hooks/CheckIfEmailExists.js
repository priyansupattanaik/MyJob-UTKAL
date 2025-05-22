/**
 * Created By Soumya (soumyaranjansahoo338@gmail.com) on 12/3/2020 at 12:35 AM
 */
import { BadRequest, FeathersError } from '@feathersjs/errors';

const CheckIfEmailExists = () => async (context) => {
    const { data, app } = context;

    const { email } = data;

    // console.log(email);

    const userData = await app
        .service('v1/user')
        ._find({
            query: {
                email,
                status: { $ne: 0 },
            },
            paginate: false,
        })
        .then((res) => (res.length ? res[0] : null));

    // console.log(userData);
    // console.log(!userData || userData.status === 0);

    if (userData) throw new BadRequest('Email is already used');
};

export default CheckIfEmailExists;
