import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Poll from './model/Poll.js';
import Vote from './model/Vote.js';
import { env } from '../environment.js';

if (!env || !env.uri) {
    console.log("Missing environment variables for atlas cluster access.\nExiting...");
    process.exit();
}



const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

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
    // get poll
    const poll = await Poll.findById(pollId).exec();

    if (!poll) {
        console.log(`Poll ${pollId} does not exist.`);
        return false;
    }

    // check poll choices.length === votes.lenth
    console.log("Poll: ", poll.choices.length);
    console.log("Votes: ", votes.length);
    if (!poll.choices.length === votes.length) {
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
    // First entry or found a new lower value?
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
    // run for x rounds
    for (let i = 0; i < rounds; i++) {
        console.log("Round: ", i);
        let voteCounts = {};
        // loop over votes
        for (let j = 0; j < votes.length; j++) {
            // determing choice from voter
            const choice = determineChoice(votes[j], eliminated);
            // add choice to voteCounts
            console.log("vote for: ", choice);
            voteCounts[choice] = (voteCounts[choice] || 0) + 1;
        }
        // is there a winner?
        winner = isWinner(voteCounts, votes.length);
        if (!winner) {
            // no, determine eliminated and continue
            eliminated.push(determineEliminated(voteCounts));
        }
    }
    return winner
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

    res.status(200).send(winner)
});

// connect to mongoos then start the server;
try {
    mongoose.connect(env.uri);
} catch (err) {
    console.err("Could not connect to Atlas: ", err);
    process.exit();
}
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
