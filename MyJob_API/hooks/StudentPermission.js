/**
 * Created By Soumya(soumya@smarttersstudio.com) on 02-12-2021 at 16:48.
 * @description check permission for student.
 */
import { STUDENT } from '../constants/Roles';
import { BadRequest } from '@feathersjs/errors';

const StudentPermission =
    (...moduleNames) =>
    async (context) => {
        const { params, app } = context;

        const {
            user: { role, modules, institute },
        } = params;

        if (role === STUDENT) {
            if (!institute) throw new BadRequest('Invalid operation.');

            const moduleMetaNames = await app
                .service('v2/module')
                ._find({
                    query: {
                        _id: {
                            $in: modules,
                        },
                    },
                })
                .then((res) => res.map((e) => e.meta_name));

            if (!moduleNames.every((metaName) => moduleMetaNames.includes(metaName))) {
                throw new BadRequest(
                    'You have not access to this module. Please contact your franchise to give access.',
                );
            }
        }

        return context;
    };

export default StudentPermission;
