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
    const pollId = req.body.pollId;

    const poll = await Poll.findById(pollId).exec();

    if (!poll) {
        const response = `Poll ${pollId} does not exist.`;
        console.log(response);
        return res.status(401).send(response);
    }

    res.status(200).send(poll.choices);
});

const validVoteReq = async (pollId, votes) => {
    // get poll
    const poll = await Poll.findById(pollId).exec();

    if (!poll) {
        console.log(`Poll ${pollId} does not exist.`);
        return false;
    }

    // check poll choices.length === votes.lenth
    return poll.choices.length === votes.length;
}

app.post('/Vote', async (req, res) => {
    const pollId = req.body.pollId;
    const votes = req.body.votes;
    console.log(`Voting for ${pollId} poll`);
    console.log("Votes: ", votes);

    if (await validVoteReq(pollId, votes)) {
        const response = "This was an invalid vote.";
        console.log(response);
        return res.status(401).send(response);
    }

    const vote = await Vote.create({
        pollId,
        votes
    });

    res.status(200).send(vote._id);
});

// connect to mongoos then start the server;
try {
    mongoose.connect(env.uri);
} catch (err) {
    console.err("Could not connect to Atlas: ", err);
    process.exit();
}
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
















