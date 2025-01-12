exports.config = {
  name: 'wiktionary',
  author: 'JohnDev19',
  description: 'Wiktionary is a multilingual, web-based project to create a free content dictionary of all words in all languages.',
  category: 'search',
  link: ['/wiktionary?word=love'] // Example link
};

const axios = require('axios');
const cheerio = require('cheerio');

exports.initialize = async function ({ req, res }) {
  try {
    const { word } = req.query;
    if (!word) {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    const url = `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const api_info = {
      api_name: this.config.name,
      author: this.config.author,
      description: this.config.description
    };

    const result = {
      api_info: api_info,
      word,
      definitions: [],
      etymology: '',
      pronunciation: '',
      sourceUrl: url
    };

    result.etymology = $('#Etymology').parent().next('p').text().trim();

    const pronunciationSpan = $('span.IPA').first();
    result.pronunciation = pronunciationSpan.text().trim();

    $('ol:first').children('li').each((index, element) => {
      const definition = $(element).text().trim();
      if (definition) {
        result.definitions.push(definition);
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};
