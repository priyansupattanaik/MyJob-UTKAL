import { makeCallingParams } from 'feathers-hooks-common';

const patchDeleted =
    (deleteKey = 'status', deleteValue = -1, updatedBy = {}) =>
    async (context) => {
        const { service, id, params } = context;

        const { user } = params;

        const { setUpdatedBy = true, key = 'updatedBy' } = updatedBy;

        const data = {
            [deleteKey]: deleteValue,
        };

        if (setUpdatedBy) data[key] = user._id;

        context.result = await service._patch(
            id,
            data,
            makeCallingParams(
                params,
                {
                    [deleteKey]: {
                        $ne: deleteValue,
                    },
                },
                {},
                {
                    provider: undefined,
                },
            ),
        );

        return context;
    };

export default patchDeleted;
