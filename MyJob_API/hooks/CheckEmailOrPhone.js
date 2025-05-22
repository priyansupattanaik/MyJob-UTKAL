/**
 * Created by Soumya (soumyaranjansahoo338@gmail.com) on 7/30/2020 at 12:32 AM
 * @description check for unique email address or phone number
 */
import { BadRequest } from '@feathersjs/errors';

const CheckEmailOrPhone = () => async (context) => {
    const { data, app } = context;
    const { email, phone } = data;
    if (email) {
        if (email.toString().trim() === '') throw new BadRequest('Invalid Email ID.');

        if (
            !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                email,
            )
        ) {
            throw new BadRequest('Please provide a valid email!');
        }

        const userData = await app
            .service('v1/user')
            ._find({
                query: {
                    email,
                },
            })
            .then((res) => (res.total > 0 ? res.data[0] : null));
        if (userData) throw new BadRequest('Email value already exists.');
    }

    return context;
};

export default CheckEmailOrPhone;
