const setSearchQuery =
    (key = 'name') =>
    (context) => {
        const {
            params: { query },
        } = context;

        if (typeof query.$search === 'undefined') return context;

        if (typeof query.$search === 'string') {
            query[key] = new RegExp(query.$search, 'i');
            delete query.$search;
        } else if (typeof query.$search === 'object' && !Array.isArray(query.$search)) {
            const { value, key: searchedKey = key } = query.$search;
            if (value) {
                if (Array.isArray(searchedKey)) {
                    query.$or = searchedKey.map((each) => {
                        return {
                            [each]: new RegExp(value, 'i'),
                        };
                    });
                } else {
                    query[searchedKey] = new RegExp(value, 'i');
                }
            }
            delete query.$search;
        }

        return context;
    };

export default setSearchQuery;
