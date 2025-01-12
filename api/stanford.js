exports.config = {
  name: 'stanford',
  author: 'JohnDev19',
  description: 'The Stanford Encyclopedia of Philosophy API allows you to search for philosophical articles from the Stanford Encyclopedia of Philosophy.',
  category: 'search',
  link: ['/stanford?keyword=lance'] // Example query link
};

const axios = require('axios');
const cheerio = require('cheerio');

exports.initialize = async function ({ req, res }) {
  try {
    // Access the query parameter instead of params
    const searchKeyword = req.query.keyword; // Get search keyword from URL query params

    if (!searchKeyword) {
      return res.status(400).json({ error: 'Keyword is required.' });
    }

    const url = `https://plato.stanford.edu/search/searcher.py?query=${encodeURIComponent(searchKeyword)}`;

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const firstResult = $('.result_listing').first();
    const resultUrl = firstResult.find('.result_url a').attr('href');

    if (!resultUrl) {
      return res.status(404).json({ error: 'No results found' });
    }

    const contentResponse = await axios.get(resultUrl);
    const content$ = cheerio.load(contentResponse.data);

    const title = content$('h1').text().trim();

    const mainContent = content$('#main-text').text().trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .replace(/\[[^\]]+\]/g, ''); // Remove references like [1], [2], etc.

    const result = {
      api_name: this.config.name,
      description: this.config.description,
      author: this.config.author,
      title,
      url: resultUrl,
      mainContent,
    };

    res.json(result);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};
