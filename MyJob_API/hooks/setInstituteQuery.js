import { NotAuthenticated } from '@feathersjs/errors';
import { SUPER_ADMIN, SYSTEM_ADMIN } from '../constants/Roles';

const setInstituteQuery =
    (key = 'institute') =>
    (context) => {
        const { user } = context.params;

        if (!user) throw new NotAuthenticated();

        if (typeof context.params.provider === 'undefined') return context;

        if (user.role === SYSTEM_ADMIN || user.role === SUPER_ADMIN) return context;

        if (user.institute) context.params.query[key] = user.institute;

        return context;
    };

export default setInstituteQuery;
