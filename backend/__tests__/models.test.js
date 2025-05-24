import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import Poll from '../model/Poll.js';
import Vote from '../model/Vote.js';

describe('Database Models', () => {
    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();
    });

    describe('Poll Model', () => {
        test('should create a poll with valid data', async () => {
            const pollData = {
                _id: 'AppleBananaCherry',
                choices: ['Apple', 'Banana', 'Cherry']
            };

            const poll = await Poll.create(pollData);

            expect(poll._id).toBe(pollData._id);
            expect(poll.choices).toEqual(pollData.choices);
        });

        test('should find a poll by ID', async () => {
            const pollData = {
                _id: 'test123',
                choices: ['Option A', 'Option B']
            };

            await Poll.create(pollData);
            const foundPoll = await Poll.findById('test123');

            expect(foundPoll).toBeTruthy();
            expect(foundPoll.choices).toEqual(pollData.choices);
        });

        test('should return null for non-existent poll', async () => {
            const foundPoll = await Poll.findById('nonexistent');
            expect(foundPoll).toBeNull();
        });

        test('should handle empty choices array', async () => {
            const pollData = {
                _id: 'empty',
                choices: []
            };

            const poll = await Poll.create(pollData);
            expect(poll.choices).toEqual([]);
        });

        test('should prevent duplicate polls with same ID', async () => {
            const pollData = {
                _id: 'duplicate',
                choices: ['A', 'B']
            };

            await Poll.create(pollData);
            
            await expect(Poll.create(pollData)).rejects.toThrow();
        });

        test('should handle long poll IDs', async () => {
            const longChoices = ['Very Long Choice Name That Exceeds Normal Length', 'Another Long Choice', 'Third Long Choice'];
            const pollData = {
                _id: longChoices.join(''),
                choices: longChoices
            };

            const poll = await Poll.create(pollData);
            expect(poll._id).toBe(longChoices.join(''));
        });
    });

    describe('Vote Model', () => {
        let testPollId;

        beforeEach(async () => {
            testPollId = 'TestPoll';
            await Poll.create({
                _id: testPollId,
                choices: ['Apple', 'Banana', 'Cherry']
            });
        });

        test('should create a vote with valid data', async () => {
            const voteData = {
                pollId: testPollId,
                choices: ['Apple', 'Cherry', 'Banana']
            };

            const vote = await Vote.create(voteData);

            expect(vote.pollId).toBe(voteData.pollId);
            expect(vote.choices).toEqual(voteData.choices);
            expect(vote._id).toBeTruthy();
        });

        test('should find votes by poll ID', async () => {
            const vote1 = await Vote.create({
                pollId: testPollId,
                choices: ['Apple', 'Banana', 'Cherry']
            });

            const vote2 = await Vote.create({
                pollId: testPollId,
                choices: ['Cherry', 'Apple', 'Banana']
            });

            const votes = await Vote.find({ pollId: testPollId });

            expect(votes).toHaveLength(2);
            expect(votes.map(v => v._id.toString())).toContain(vote1._id.toString());
            expect(votes.map(v => v._id.toString())).toContain(vote2._id.toString());
        });

        test('should handle multiple votes for same poll', async () => {
            const votesData = [
                { pollId: testPollId, choices: ['Apple', 'Banana', 'Cherry'] },
                { pollId: testPollId, choices: ['Banana', 'Apple', 'Cherry'] },
                { pollId: testPollId, choices: ['Cherry', 'Banana', 'Apple'] }
            ];

            for (const voteData of votesData) {
                await Vote.create(voteData);
            }

            const votes = await Vote.find({ pollId: testPollId });
            expect(votes).toHaveLength(3);
        });

        test('should handle votes with different choice orders', async () => {
            const voteData = {
                pollId: testPollId,
                choices: ['Cherry', 'Apple', 'Banana'] // Different order
            };

            const vote = await Vote.create(voteData);
            expect(vote.choices).toEqual(['Cherry', 'Apple', 'Banana']);
        });

        test('should create vote even if poll does not exist (no foreign key constraint)', async () => {
            const voteData = {
                pollId: 'NonExistentPoll',
                choices: ['A', 'B', 'C']
            };

            const vote = await Vote.create(voteData);
            expect(vote.pollId).toBe('NonExistentPoll');
        });

        test('should handle empty choices in vote', async () => {
            const voteData = {
                pollId: testPollId,
                choices: []
            };

            const vote = await Vote.create(voteData);
            expect(vote.choices).toEqual([]);
        });

        test('should auto-generate _id for votes', async () => {
            const vote1 = await Vote.create({
                pollId: testPollId,
                choices: ['Apple', 'Banana', 'Cherry']
            });

            const vote2 = await Vote.create({
                pollId: testPollId,
                choices: ['Apple', 'Banana', 'Cherry']
            });

            expect(vote1._id).toBeTruthy();
            expect(vote2._id).toBeTruthy();
            expect(vote1._id).not.toEqual(vote2._id);
        });
    });

    describe('Model Relationships', () => {
        test('should handle poll with multiple votes', async () => {
            const poll = await Poll.create({
                _id: 'relationship-test',
                choices: ['Red', 'Blue', 'Green']
            });

            const votes = [
                { pollId: poll._id, choices: ['Red', 'Blue', 'Green'] },
                { pollId: poll._id, choices: ['Blue', 'Red', 'Green'] },
                { pollId: poll._id, choices: ['Green', 'Red', 'Blue'] }
            ];

            for (const voteData of votes) {
                await Vote.create(voteData);
            }

            const foundPoll = await Poll.findById(poll._id);
            const foundVotes = await Vote.find({ pollId: poll._id });

            expect(foundPoll).toBeTruthy();
            expect(foundVotes).toHaveLength(3);
        });

        test('should handle votes for multiple polls', async () => {
            const poll1 = await Poll.create({
                _id: 'poll1',
                choices: ['A', 'B']
            });

            const poll2 = await Poll.create({
                _id: 'poll2',
                choices: ['X', 'Y']
            });

            await Vote.create({ pollId: 'poll1', choices: ['A', 'B'] });
            await Vote.create({ pollId: 'poll1', choices: ['B', 'A'] });
            await Vote.create({ pollId: 'poll2', choices: ['X', 'Y'] });

            const votes1 = await Vote.find({ pollId: 'poll1' });
            const votes2 = await Vote.find({ pollId: 'poll2' });

            expect(votes1).toHaveLength(2);
            expect(votes2).toHaveLength(1);
        });
    });
}); 