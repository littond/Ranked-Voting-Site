import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import Poll from '../model/Poll.js';
import Vote from '../model/Vote.js';

// Create test app (same as index.js but without MongoDB connection and server start)
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cors());

    // Copy all the route handlers from index.js
    app.get('/', (req, res) => {
        res.send('Hello');
    });

    app.post('/create', async (req, res) => {
        const choices = req.body.choices;
        console.log("Choices: ", choices);

        const exists = await Poll.findById(choices.join("")).exec();

        if (exists) {
            const response = "A poll with these choices already exists.";
            console.log(response);
            return res.status(401).send(response);
        }

        const poll = await Poll.create({
            _id: choices.join(""),
            choices
        });

        res.status(200).send(poll._id);
    });

    app.get('/poll', async (req, res) => {
        const pollId = req.query.pollId;
        console.log("Poll ID: ", pollId);

        const poll = await Poll.findById(pollId).exec();

        if (!poll) {
            const response = `Poll ${pollId} does not exist.`;
            console.log(response);
            return res.status(401).send(response);
        }

        res.status(200).send(poll.choices);
    });

    const validVoteReq = async (pollId, votes) => {
        console.log("Validating vote request for poll: ", pollId);
        const poll = await Poll.findById(pollId).exec();

        if (!poll) {
            console.log(`Poll ${pollId} does not exist.`);
            return false;
        }

        console.log("Poll: ", poll.choices.length);
        console.log("Votes: ", votes.length);
        if (poll.choices.length !== votes.length) {
            console.log("Poll had incorrect number of choices.");
            return false;
        }

        for (let i = 0; i < poll.choices.length; i++) {
            if (!votes.includes(poll.choices[i])) {
                console.log("Poll choice: ", poll.choices[i]);
                console.log("Votes: ", votes);
                console.log("Poll had incorrect choice.");
                return false;
            }
        }

        return true;
    }

    app.post('/vote', async (req, res) => {
        const pollId = req.body.pollId;
        const votes = req.body.votes;
        console.log(`Voting for ${pollId} poll`);
        console.log("Votes: ", votes);

        if (!await validVoteReq(pollId, votes)) {
            const response = "This was an invalid vote.";
            console.log(response);
            return res.status(401).send(response);
        }

        const vote = await Vote.create({
            pollId,
            choices: votes
        });

        console.log("Vote: ", vote);

        res.status(200).send(vote._id);
    });

    const validVotesReq = async (pollId) => {
        const poll = await Poll.findById(pollId).exec();
        if (!poll) {
            console.log(`Poll ${pollId} does not exist.`);
            return false;
        }
        return true;
    }

    const determineChoice = (vote, eliminated) => {
        for (let i = 0; i < vote.length; i++) {
            if (!eliminated.includes(vote[i])) {
                return vote[i];
            }
        }
    }

    const isWinner = (voteCounts, totalVotes) => {
        console.log("finding winner", Object.keys(voteCounts).length);
        for (const [choice, count] of Object.entries(voteCounts)) {
            console.log(`Choice, ${choice}: ${count} is greater than ${totalVotes / 2}? ${count > totalVotes / 2}`);
            if (count > totalVotes / 2) {
                console.log("winner found: ", choice);
                return choice;
            }
        }
        console.log("no winner found");
        return false;
    }

    const determineEliminated = (voteCounts) => {
        let minKey;
        let minValue;
        for (const [key, value] of Object.entries(voteCounts)) {
            if (minValue === undefined || value < minValue) {
                minValue = value;
                minKey = key;
            }
        }
        return minKey;
    }

    const countVotes = (votes, rounds) => {
        console.log("Votes received: ", votes);
        let winner = false;
        let eliminated = [];
        for (let i = 0; i < rounds; i++) {
            console.log("Round: ", i);
            let voteCounts = {};
            for (let j = 0; j < votes.length; j++) {
                const choice = determineChoice(votes[j], eliminated);
                console.log("vote for: ", choice);
                voteCounts[choice] = (voteCounts[choice] || 0) + 1;
            }
            winner = isWinner(voteCounts, votes.length);
            if (!winner) {
                eliminated.push(determineEliminated(voteCounts));
            } else {
                break;
            }
        }
        return winner;
    }

    app.get('/votes', async (req, res) => {
        const pollId = req.query.pollId;
        console.log("Poll ID: ", pollId);

        if (!await validVotesReq(pollId)) {
            const response = "This was an invalid request.";
            console.log(response);
            return res.status(401).send(response);
        }

        const votes = await Vote.find({ pollId }).exec();
        const cleanedVotes = votes.map(vote => vote.choices);

        const winner = countVotes(cleanedVotes, votes[0].choices.length);

        res.status(200).send(winner);
    });

    return app;
};

describe('API Endpoints', () => {
    let app;

    beforeAll(async () => {
        await setupTestDB();
        app = createTestApp();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();
    });

    describe('GET /', () => {
        test('should return Hello', async () => {
            const response = await request(app).get('/');
            expect(response.status).toBe(200);
            expect(response.text).toBe('Hello');
        });
    });

    describe('POST /create', () => {
        test('should create a new poll successfully', async () => {
            const choices = ['Apple', 'Banana', 'Cherry'];
            const response = await request(app)
                .post('/create')
                .send({ choices });

            expect(response.status).toBe(200);
            expect(response.text).toBe(choices.join(''));

            // Verify poll was created in database
            const poll = await Poll.findById(choices.join(''));
            expect(poll).toBeTruthy();
            expect(poll.choices).toEqual(choices);
        });

        test('should reject duplicate poll creation', async () => {
            const choices = ['Apple', 'Banana', 'Cherry'];
            
            // Create first poll
            await request(app)
                .post('/create')
                .send({ choices });

            // Try to create duplicate
            const response = await request(app)
                .post('/create')
                .send({ choices });

            expect(response.status).toBe(401);
            expect(response.text).toBe('A poll with these choices already exists.');
        });

        test('should handle empty choices array', async () => {
            const choices = [];
            const response = await request(app)
                .post('/create')
                .send({ choices });

            expect(response.status).toBe(200);
            expect(response.text).toBe('');
        });
    });

    describe('GET /poll', () => {
        test('should return poll choices for valid poll ID', async () => {
            const choices = ['Apple', 'Banana', 'Cherry'];
            const pollId = choices.join('');
            
            // Create poll first
            await Poll.create({ _id: pollId, choices });

            const response = await request(app)
                .get('/poll')
                .query({ pollId });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(choices);
        });

        test('should return 401 for non-existent poll', async () => {
            const response = await request(app)
                .get('/poll')
                .query({ pollId: 'nonexistent' });

            expect(response.status).toBe(401);
            expect(response.text).toBe('Poll nonexistent does not exist.');
        });
    });

    describe('POST /vote', () => {
        let pollId;
        const choices = ['Apple', 'Banana', 'Cherry'];

        beforeEach(async () => {
            pollId = choices.join('');
            await Poll.create({ _id: pollId, choices });
        });

        test('should accept valid vote', async () => {
            const votes = ['Apple', 'Cherry', 'Banana'];
            const response = await request(app)
                .post('/vote')
                .send({ pollId, votes });

            expect(response.status).toBe(200);
            expect(response.text).toBeTruthy();

            // Verify vote was saved - response.text contains the ObjectId as a string
            const voteId = response.text.replace(/"/g, ''); // Remove quotes if present
            const vote = await Vote.findById(voteId);
            expect(vote).toBeTruthy();
            expect(vote.pollId).toBe(pollId);
            expect(vote.choices).toEqual(votes);
        });

        test('should reject vote for non-existent poll', async () => {
            const votes = ['Apple', 'Cherry', 'Banana'];
            const response = await request(app)
                .post('/vote')
                .send({ pollId: 'nonexistent', votes });

            expect(response.status).toBe(401);
            expect(response.text).toBe('This was an invalid vote.');
        });

        test('should reject vote with wrong number of choices', async () => {
            const votes = ['Apple', 'Cherry']; // Missing one choice
            const response = await request(app)
                .post('/vote')
                .send({ pollId, votes });

            expect(response.status).toBe(401);
            expect(response.text).toBe('This was an invalid vote.');
        });

        test('should reject vote with invalid choices', async () => {
            const votes = ['Apple', 'Orange', 'Banana']; // Orange not in poll
            const response = await request(app)
                .post('/vote')
                .send({ pollId, votes });

            expect(response.status).toBe(401);
            expect(response.text).toBe('This was an invalid vote.');
        });

        test('should accept vote with reordered choices', async () => {
            const votes = ['Cherry', 'Apple', 'Banana'];
            const response = await request(app)
                .post('/vote')
                .send({ pollId, votes });

            expect(response.status).toBe(200);
            expect(response.text).toBeTruthy();
        });
    });

    describe('GET /votes', () => {
        let pollId;
        const choices = ['Apple', 'Banana', 'Cherry'];

        beforeEach(async () => {
            pollId = choices.join('');
            await Poll.create({ _id: pollId, choices });
        });

        test('should return winner for poll with clear majority', async () => {
            // Create votes where Apple wins
            await Vote.create({ pollId, choices: ['Apple', 'Banana', 'Cherry'] });
            await Vote.create({ pollId, choices: ['Apple', 'Cherry', 'Banana'] });
            await Vote.create({ pollId, choices: ['Apple', 'Banana', 'Cherry'] });
            await Vote.create({ pollId, choices: ['Banana', 'Apple', 'Cherry'] });
            await Vote.create({ pollId, choices: ['Cherry', 'Apple', 'Banana'] });

            const response = await request(app)
                .get('/votes')
                .query({ pollId });

            expect(response.status).toBe(200);
            expect(response.text).toBe('Apple');
        });

        test('should handle ranked choice elimination', async () => {
            // Create scenario where no one has majority initially
            await Vote.create({ pollId, choices: ['Apple', 'Banana', 'Cherry'] });
            await Vote.create({ pollId, choices: ['Apple', 'Banana', 'Cherry'] });
            await Vote.create({ pollId, choices: ['Banana', 'Apple', 'Cherry'] });
            await Vote.create({ pollId, choices: ['Cherry', 'Apple', 'Banana'] });

            const response = await request(app)
                .get('/votes')
                .query({ pollId });

            expect(response.status).toBe(200);
            expect(['Apple', 'Banana', 'Cherry']).toContain(response.text);
        });

        test('should return 401 for non-existent poll', async () => {
            const response = await request(app)
                .get('/votes')
                .query({ pollId: 'nonexistent' });

            expect(response.status).toBe(401);
            expect(response.text).toBe('This was an invalid request.');
        });

        test('should handle poll with no votes', async () => {
            const response = await request(app)
                .get('/votes')
                .query({ pollId });

            // This will fail because votes[0] doesn't exist
            expect(response.status).toBe(500);
        });

        test('should handle single vote', async () => {
            await Vote.create({ pollId, choices: ['Apple', 'Banana', 'Cherry'] });

            const response = await request(app)
                .get('/votes')
                .query({ pollId });

            expect(response.status).toBe(200);
            expect(response.text).toBe('Apple');
        });
    });

    describe('Integration Tests', () => {
        test('complete poll lifecycle', async () => {
            const choices = ['Pizza', 'Burger', 'Salad'];

            // 1. Create poll
            const createResponse = await request(app)
                .post('/create')
                .send({ choices });
            expect(createResponse.status).toBe(200);
            const pollId = createResponse.text;

            // 2. Get poll details
            const pollResponse = await request(app)
                .get('/poll')
                .query({ pollId });
            expect(pollResponse.status).toBe(200);
            expect(pollResponse.body).toEqual(choices);

            // 3. Submit votes
            const vote1 = await request(app)
                .post('/vote')
                .send({ pollId, votes: ['Pizza', 'Burger', 'Salad'] });
            expect(vote1.status).toBe(200);

            const vote2 = await request(app)
                .post('/vote')
                .send({ pollId, votes: ['Pizza', 'Salad', 'Burger'] });
            expect(vote2.status).toBe(200);

            const vote3 = await request(app)
                .post('/vote')
                .send({ pollId, votes: ['Burger', 'Pizza', 'Salad'] });
            expect(vote3.status).toBe(200);

            // 4. Get results
            const resultsResponse = await request(app)
                .get('/votes')
                .query({ pollId });
            expect(resultsResponse.status).toBe(200);
            expect(['Pizza', 'Burger', 'Salad']).toContain(resultsResponse.text);
        });
    });
}); 