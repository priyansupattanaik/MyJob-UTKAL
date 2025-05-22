import { Forbidden, NotAuthenticated } from '@feathersjs/errors';
import { ADMIN, USER, ORGANIZATION } from '../constants/Roles';

const Permit =
    (...roles) =>
    (context, strict = false) => {
        const {
            params: { user },
        } = context;

        // console.log('roles', roles,user.role);

        if (!user) throw new NotAuthenticated();

        if (!strict && user.role === ADMIN) return context;

        if (roles && roles.length) {
            if (roles.indexOf(user.role) < 0) throw new Forbidden();
            return context;
        }

        return context;
    };

Permit.ADMIN = Permit(ADMIN);
Permit.ORGANIZATION = Permit(ORGANIZATION);
Permit.USER = Permit(USER);

Permit.or =
    (...roles) =>
    async (context) => {
        const {
            params: { user },
        } = context;

        if (!user) throw new NotAuthenticated();

        const result = await Promise.all(
            roles.map(async (each) => {
                try {
                    await each(context);
                    return true;
                } catch (e) {
                    return false;
                }
            }),
        );

        if (!result.filter(Boolean).length) throw new Forbidden();

        return context;
    };

/**
 *
 * @param roles
 * @returns {function(*=): boolean}
 */
Permit.is =
    (...roles) =>
    async (context) => {
        const {
            params: { user },
        } = context;

        // console.log(user);

        if (!user) throw new NotAuthenticated();

        const result = await Promise.all(
            roles.map(async (each) => {
                try {
                    await Permit(each)(context, true);
                    return true;
                } catch (e) {
                    return false;
                }
            }),
        );

        return !!result.filter(Boolean).length;
    };

Permit.not = (role) => async (context) => {
    const {
        params: { user },
    } = context;

    if (!user) throw new NotAuthenticated();

    try {
        await role(context, true);
        return false;
    } catch (e) {
        return true;
    }
};

// export const InstitutePermit = (...roles) => async (context, strict = false) => {
// 	const {
// 		params: { user },
// 		app,
// 	} = context;
//
// 	if (!user) throw new NotAuthenticated();
//
// 	if (!strict && (user.role === ADMIN || user.role === SUPER_ADMIN || user.role === SYSTEM_ADMIN)) return context;
//
// 	if (roles && roles.length) {
// 		const instituteAccessService = app.service('user-institute-access');
//
// 		const [instituteAccesses] = await instituteAccessService._find({
// 			query: {
// 				user: user._id,
// 				institute: user.currentInstitute,
// 			},
// 			paginate: false,
// 		});
//
// 		if (!instituteAccesses || !instituteAccesses.accessType) throw new Forbidden();
//
// 		if (!strict && instituteAccesses.accessType === SUPER_ADMIN) return context;
//
// 		if (roles.indexOf(instituteAccesses.accessType) < 0) throw new Forbidden();
//
// 		return context;
// 	}
//
// 	return context;
// };
//
// Permit.institute = {
// 	STUDENT: InstitutePermit(STUDENT),
// 	TEACHER: InstitutePermit(TEACHER),
// 	PARENT: InstitutePermit(PARENT),
// 	ADMIN: InstitutePermit(ADMIN),
// 	SUPER_ADMIN: InstitutePermit(SUPER_ADMIN),
// };

export default Permit;
