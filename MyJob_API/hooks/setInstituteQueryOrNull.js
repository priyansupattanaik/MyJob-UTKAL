import { NotAuthenticated } from '@feathersjs/errors';
import { SUPER_ADMIN, SYSTEM_ADMIN } from '../constants/Roles';

const setInstituteQueryOrNull =
    (key = 'institute') =>
    (context) => {
        const { user, query } = context.params;

        if (!user) throw new NotAuthenticated();

        if (typeof context.params.provider === 'undefined') return context;

        if (user.role === SYSTEM_ADMIN || user.role === SUPER_ADMIN) return context;

        if (!query.institute) {
            if (user.institute) {
                context.params.query[key] = {
                    $in: [user.institute, null],
                };
            } else {
                context.params.query[key] = null;
            }
        }

        return context;
    };

export default setInstituteQueryOrNull;
