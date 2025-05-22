/**
 * Created by Soumya (soumyaranjansahoo338@gmail.com) on 8/11/2020 at 8:37 PM
 */

const SetIp = () => async (context) => {
    const { data, params } = context;
    const { ip } = params;

    data.ip = typeof ip === 'string' ? ip : '::1';
    return context;
};

export default SetIp;
