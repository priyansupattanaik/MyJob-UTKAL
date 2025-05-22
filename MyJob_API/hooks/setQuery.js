/**
 *
 * @param queries {[string, any]}
 * @returns {function(*): *}
 */
const setQuery =
    (...queries) =>
    (context) => {
        queries.map((each) => {
            if (typeof each[0] !== 'undefined') context.params.query[each[0]] = each[1];
        });
        return context;
    };

export default setQuery;
