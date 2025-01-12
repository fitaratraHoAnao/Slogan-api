exports.config = {
  name: 'refseek-search',
  author: 'JohnDev19',
  description: 'The Refseek Search API allows you to search for information, images, definitions, and more using the Refseek search engine.',
  category: 'search',
  link: ['/refseek-search?searchKeyword=lance'] // Updated to use query parameters
};

const axios = require('axios');
const cheerio = require('cheerio');

exports.initialize = async function ({ req, res }) {
  try {
    const { searchKeyword } = req.query;  // Changed from req.params to req.query for query parameter
    if (!searchKeyword) {
      return res.status(400).json({ error: 'searchKeyword query parameter is required.' });
    }

    const url = `https://www.refseek.com/search?q=${encodeURIComponent(searchKeyword)}`;

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const results = {
      mainResults: [],
      images: [],
      definition: {},
      stickySectionLinks: []
    };

    $('.sticky').each((i, element) => {
      const title = $(element).find('.sticky__title a').text().trim();
      const link = $(element).find('.sticky__title a').attr('href');
      const source = $(element).find('.sticky__link').text().trim();
      const description = $(element).find('.sticky__description').text().trim();

      const completeLink = link.startsWith('/') ? `https://www.refseek.com${link}` : link;

      results.mainResults.push({ title, link: completeLink, source, description });
    });

    $('img').each((i, element) => {
      const imageUrl = $(element).attr('src');
      if (imageUrl && imageUrl.startsWith('https://en.wikipedia.org/wiki/File:')) {
        results.images.push({ imageUrl });
      }
    });

    $('a').each((i, element) => {
      const href = $(element).attr('href');
      if (href && href.startsWith('https://en.wikipedia.org/wiki/File:')) {
        results.images.push({ imageUrl: href });
      }

      const text = $(element).text().trim();
      const hrefLink = $(element).attr('href');
      if (text && hrefLink && hrefLink.startsWith('https://en.wikipedia.org/wiki/')) {
        results.stickySectionLinks.push({ text, href: hrefLink });
      }
    });

    const definitionBlock = $('.definition.sidebar__block');
    results.definition = {
      term: definitionBlock.find('.sidebar__title strong').text().trim(),
      text: definitionBlock.find('.definition__text').text().trim(),
      additionalLinks: definitionBlock.find('.definition__additional a').map((i, el) => ({
        text: $(el).text(),
        href: $(el).attr('href')
      })).get()
    };

    res.json({
      api_information: {
        api_name: this.config.name,
        description: this.config.description,
        author: this.config.author
      },
      results: results
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};
