/**
 * Created by Soumya (soumyaranjansahoo338@gmail.com) on 1/27/2021 at 12:05 AM
 */

/**
 *
 * @param path {String}
 * @param model {String}
 * @param pathFields {Object[]}
 * @return {function(*): *}
 * @constructor
 */
const SetPopulateQuery =
    (path, model, pathFields = []) =>
    async (context) => {
        const { params } = context;

        const { query } = params;

        if (!query.$populate) query.$populate = [];

        if (pathFields.length) {
            query.$populate.push({
                path,
                model,
                populate: pathFields,
            });
        } else {
            query.$populate.push({
                path,
                model,
            });
        }

        return context;
    };

export default SetPopulateQuery;
