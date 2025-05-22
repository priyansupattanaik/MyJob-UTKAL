/**
 * Created By Soumya (soumyaranjansahoo338@gmail.com) on 9/10/2020 at 7:36 PM
 */
import { BadRequest, GeneralError, NotAuthenticated, NotFound } from '@feathersjs/errors';

const CatchError = () => async (context) => {
    const { error } = context;

    if (error) {
        const { code, message } = error;
        switch (code) {
            case 500:
                throw new GeneralError('Some Error Occurred.');
            case 400:
                throw new BadRequest(message);
            case 404:
                throw new NotFound(message);
            case 401:
                throw new NotAuthenticated('Invalid User name and Password');
        }
    }

    return context;
};

export default CatchError;
