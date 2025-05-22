import { BadRequest, NotAuthenticated } from '@feathersjs/errors';
import { SUPER_ADMIN, SYSTEM_ADMIN } from '../constants/Roles';

const setInstitute =
    (key = 'institute', strict = false) =>
    (context) => {
        const { user } = context.params;

        if (!user) throw new NotAuthenticated();

        if (typeof context.params.provider === 'undefined') return context;

        if (user.role === SYSTEM_ADMIN || user.role === SUPER_ADMIN) return context;

        if (user.institute) {
            if (Array.isArray(context.data)) {
                context.data.map((each) => {
                    each[key] = user.institute;
                });
            } else {
                context.data[key] = user.institute;
            }
        } else if (strict) {
            throw new BadRequest('Please select a institute');
        }

        return context;
    };

export default setInstitute;
