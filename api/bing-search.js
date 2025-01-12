const axios = require('axios');
const cheerio = require('cheerio');

const BING_SEARCH_URL = 'https://www.bing.com/search';

async function fetchSearchResults(query) {
    try {
        const { data: html } = await axios.get(BING_SEARCH_URL, {
            params: { q: query },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const $ = cheerio.load(html);
        return $('li.b_algo')
            .slice(0, 10) // Limit results to 10 directly
            .map((_, element) => ({
                title: $(element).find('h2').text(),
                description: $(element).find('.b_caption p').text().replace(/WEB/g, '').trim(),
                url: $(element).find('h2 a').attr('href'),
            }))
            .get(); // Convert Cheerio collection to array
    } catch {
        throw new Error('Error fetching search results from Bing.');
    }
}

exports.config = {
    name: 'bing-search',
    author: 'JohnDev19',
    description: 'Bing helps you turn information into action, making it faster and easier to go from searching to doing.',
    category: 'search',
    link: ['/bing-search?q=test'],
};

exports.initialize = async function ({ req, res }) {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required.' });
        }

        const searchResults = await fetchSearchResults(query);

        res.json({
            query,
            count: searchResults.length,
            name: exports.config.name,
            description: exports.config.description,
            author: exports.config.author,
            searchResults,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
