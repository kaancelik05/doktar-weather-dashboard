module.exports = async function (context, req) {
    context.log('Config API endpoint called');

    // Environment variable'ları frontend'e güvenli şekilde gönderin
    const config = {
        openWeatherMapApiKey: process.env.OPENWEATHER_API_KEY || '',
        geodb: {
            apiKey: process.env.GEODB_API_KEY || '',
            baseUrl: process.env.GEODB_BASE_URL || 'https://wft-geo-db.p.rapidapi.com/v1/geo',
            host: process.env.GEODB_HOST || 'wft-geo-db.p.rapidapi.com'
        }
    };

    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: config
    };
};
