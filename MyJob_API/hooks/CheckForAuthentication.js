/**
 * Created by Soumya (soumyaranjansahoo338@gmail.com) on 8/11/2020 at 9:21 PM
 */
import { NotAuthenticated } from '@feathersjs/errors';
import jwt_decode from 'jwt-decode';

const CheckForAuthentication = () => async (context) => {
    const { params, app, data } = context;

    let accessToken, userId;

    if (data && data.strategy && data.strategy === 'jwt') {
        accessToken = data.accessToken;
        userId = jwt_decode(accessToken).sub;
    } else {
        const { user, authentication } = params;

        if (!user || !authentication) return context;

        accessToken = authentication.accessToken;
        userId = user._id;
    }

    /**
     * @type {Utils}
     */
    const utils = app.get('utils');
    const isAccessTokenVerified = await utils.verifyAccessToken(accessToken, userId);

    // console.log(isAccessTokenVerified);
    if (!isAccessTokenVerified.status) throw new NotAuthenticated();

    return context;
};

export default CheckForAuthentication;
