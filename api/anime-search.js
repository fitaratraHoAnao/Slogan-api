const fs = require('fs');

exports.config = {
    name: 'anime-search',
    author: 'AceGerome',
    description: 'Search for anime characters by ID, name, or movie.',
    method: 'get',
    category: 'anime',
    link: ['/anime-search']
};

exports.initialize = async function ({ req, res }) {
    try {
        const { type, id, name, movie } = req.query;

        const data = JSON.parse(fs.readFileSync('./api/assets/anime.json', 'utf8'));

        if (!type) {
            return res.json({
                status: false,
                creator: this.config.author,
                message: "Missing query parameter 'type'.",
                usage: "Usage: /anime-search?type=<id|name|movie>&<id|name|movie>=<value>"
            });
        }

        switch (type) {
            case 'id': {
                if (!id) {
                    return res.json({
                        status: false,
                        creator: this.config.author,
                        message: "Missing query parameter 'id'.",
                        usage: "Usage: /anime-search?type=id&id=<characterID>"
                    });
                }
                const result = data.find(i => i.ID == id);
                if (!result) {
                    return res.json({
                        status: false,
                        creator: this.config.author,
                        message: `No character found with ID ${id}.`
                    });
                }
                return res.json({
                    status: true,
                    creator: this.config.author,
                    result: {
                        ID: result.ID,
                        name: result.name,
                        colorBg: result.colorBg,
                        movie: result.movie,
                        imgAnime: result.imgAnime
                    }
                });
            }
            case 'name': {
                if (!name) {
                    return res.json({
                        status: false,
                        creator: this.config.author,
                        message: "Missing query parameter 'name'.",
                        usage: "Usage: /anime-search?type=name&name=<characterName>"
                    });
                }
                const result = data.find(i => i.name.toLowerCase() === name.toLowerCase());
                if (!result) {
                    return res.json({
                        status: false,
                        creator: this.config.author,
                        message: `No character found with name '${name}'.`
                    });
                }
                return res.json({
                    status: true,
                    creator: this.config.author,
                    result: {
                        ID: result.ID,
                        name: result.name,
                        colorBg: result.colorBg,
                        movie: result.movie
                    }
                });
            }
            case 'movie': {
                if (!movie) {
                    return res.json({
                        status: false,
                        creator: this.config.author,
                        message: "Missing query parameter 'movie'.",
                        usage: "Usage: /anime-search?type=movie&movie=<movieName>"
                    });
                }
                const results = data.filter(i => i.movie.toLowerCase() === movie.toLowerCase());
                if (results.length === 0) {
                    return res.json({
                        status: false,
                        creator: this.config.author,
                        message: `No characters found in movie '${movie}'.`
                    });
                }
                const formattedResults = results.map(i => ({
                    ID: i.ID,
                    name: i.name,
                    colorBg: i.colorBg,
                    movie: i.movie
                }));
                return res.json({
                    status: true,
                    creator: this.config.author,
                    results: formattedResults
                });
            }
            default: {
                return res.json({
                    status: false,
                    creator: this.config.author,
                    message: `Invalid 'type' parameter: ${type}. Must be 'id', 'name', or 'movie'.`,
                    usage: "Usage: /anime-search?type=<id|name|movie>&<id|name|movie>=<value>"
                });
            }
        }
    } catch (error) {
        console.error("Error processing anime search:", error);

        return res.status(500).json({
            status: false,
            creator: this.config.author,
            message: "An error occurred while processing the search request."
        });
    }
};