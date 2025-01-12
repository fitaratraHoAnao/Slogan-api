exports.config = {
  name: 'webster',
  author: 'JohnDev19',
  description: 'Fetches word definitions, pronunciations, and examples from Merriam-Webster Dictionary.',
  category: 'search',
  link: ['/webster?word=cat'],
};

exports.initialize = async function ({ req, res }) {
  const axios = require('axios');
  const cheerio = require('cheerio');

  try {
    // Get the word from query parameters
    const word = req.query.word;
    if (!word) {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    const url = `https://www.merriam-webster.com/dictionary/${word}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const result = {
      api_info: this.config,
      wordOfTheDay: {
        word: '',
        url: '',
      },
      word: $('.hword').first().text() || word,
      partOfSpeech: $('.important-blue-link').first().text().trim(),
      pronunciation: {
        spelled: $('.word-syllables-entry').first().text().trim(),
        phonetic: $('.prs .pr').first().text().trim(),
        audioUrl: $('.play-pron > a').first().attr('data-file'),
      },
      definitions: [],
      examples: [],
    };

    // Extract definitions
    $('.dtText').each((i, elem) => {
      let definition = $(elem).text().trim();
      if (definition.startsWith(':')) {
        definition = `${i + 1}. ${definition.slice(1).trim()}`;
      }
      result.definitions.push(definition);
    });

    // Extract examples
    $('.ex-sent').each((i, elem) => {
      result.examples.push(`${i + 1}. ${$(elem).text().trim()}`);
    });

    // Extract Word of the Day
    const wotdWord = $('.wotd-side__headword').first().text().trim();
    const wotdUrl = 'https://www.merriam-webster.com' + $('.wotd-side__headword a').first().attr('href');
    if (wotdWord && wotdUrl) {
      result.wordOfTheDay = {
        word: wotdWord,
        url: wotdUrl,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the data' });
  }
};
