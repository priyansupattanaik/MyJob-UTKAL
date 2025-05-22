import { BadRequest } from '@feathersjs/errors';

const ModuleValidateData =
    (serviceName, key, query = { status: { $ne: 0 } }) =>
    async (context) => {
        const { data, app, path } = context;

        const service = app.service(`v1/${serviceName}`);

        if (path === 'v2/timetable' && (key === 'syllabus' || key === 'instituteBatch')) {
            query = {};
        }

        if (Array.isArray(data)) {
            for (const each of data) {
                const id = each[key];

                if (!id) continue;

                const result = await service._get(id, { query }).catch(() => null);

                if (!result) throw new BadRequest(`Invalid value of ${key}`);

                /**
                 * @description to store the details of the field
                 * @type {*}
                 */
                each[`${key}Data`] = result;
            }
        } else {
            const id = data[key];

            if (!id) return context;

            const result = await service._get(id, { query }).catch(() => null);

            if (!result) throw new BadRequest(`Invalid value of ${key}`);

            /**
             * @description to store the details of the field
             * @type {*}
             */
            data[`${key}Data`] = result;
        }

        return context;
    };

ModuleValidateData.isUser = (key = 'user', query) => ModuleValidateData('user', key, query);
ModuleValidateData.isJob = (key = 'job', query) => ModuleValidateData('employee-request', key, query);
ModuleValidateData.isSubscriptionPlan = (key = 'subscriptionPlan', query) =>
    ModuleValidateData('subscription-plan', key, query);
ModuleValidateData.isCoupon = (key = 'coupon', query) => ModuleValidateData('coupon', key, query);

export default ModuleValidateData;
