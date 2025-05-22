import { PARENT } from '../constants/Roles';
import { BadRequest } from '@feathersjs/errors';

const CheckStudentForParent = () => async (context) => {
    const { params, app } = context;

    const { user, query } = params;

    if (user) {
        const { role, phone } = user;

        if (context.path !== 'v1/user') {
            if (role === PARENT) {
                const { student } = query;

                if (!student) throw new BadRequest('Student id must be given.');

                const studentDetails = await app
                    .service('v1/user')
                    ._get(student)
                    // eslint-disable-next-line no-unused-vars
                    .catch((e) => {
                        throw new BadRequest('Please give a valid student id.');
                    });

                const { parentPhone } = studentDetails;

                if (phone !== parentPhone) throw new BadRequest('You are not the parent of the student.');
            }
        }
    }
};

export default CheckStudentForParent;
