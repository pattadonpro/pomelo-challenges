const server = require('./server');
const axios = require('axios');

jest.mock('axios');
const mockGithubResponse = {status: 200, data: {}};

describe('Pomelo Challenge Test', () => {
    beforeAll((done) => {
        server.events.on('start', () => {
            done();
        });
    });

    afterAll((done) => {
        server.events.on('stop', () => {
            done();
        });
        server.stop();
    });

    test('should return success response with status 200', async () => {
        const options = {
            method: 'POST',
            url: '/pomelo-challenges',
            payload: JSON.stringify({
                "0": [
                    {
                        "id": 10,
                        "title": "House",
                        "level": 0,
                        "children": [],
                        "parent_id": null
                    }
                ],
                "1": [
                    {
                        "id": 12,
                        "title": "Red Roof",
                        "level": 1,
                        "children": [],
                        "parent_id": 10
                    },
                    {
                        "id": 18,
                        "title": "Blue Roof",
                        "level": 1,
                        "children": [],
                        "parent_id": 10
                    },
                    {
                        "id": 13,
                        "title": "Wall",
                        "level": 1,
                        "children": [],
                        "parent_id": 10
                    }
                ],
                "2": [
                    {
                        "id": 17,
                        "title": "Blue Window",
                        "level": 2,
                        "children": [],
                        "parent_id": 12
                    },
                    {
                        "id": 16,
                        "title": "Door",
                        "level": 2,
                        "children": [],
                        "parent_id": 13
                    },
                    {
                        "id": 15,
                        "title": "Red Window",
                        "level": 2,
                        "children": [],
                        "parent_id": 12
                    }
                ]
            })
        };
        const response = await server.inject(options);
        expect(response.statusCode).toBe(200);
    });

    test('should call to  GitHub Search API with default page correctly', async () => {
        axios.get.mockResolvedValue(mockGithubResponse);
        await server.inject('/pomelo-challenges');
        expect(axios.get).toBeCalledWith('https://api.github.com/search/repositories?q=nodejs&per_page=10&page=1');
    });

    test('should call to  GitHub Search API with custom page correctly', async () => {
        axios.get.mockResolvedValue(mockGithubResponse);
        await server.inject('/pomelo-challenges?page=10');
        expect(axios.get).toBeCalledWith('https://api.github.com/search/repositories?q=nodejs&per_page=10&page=10');
    });

    test('should return error response with status 400', async () => {
        const response = await server.inject('/pomelo-challenges?page=101');
        expect(response.statusCode).toBe(400);
        expect(response.result.message).toBe('Only the first 1000 search results are available');
    });
});
