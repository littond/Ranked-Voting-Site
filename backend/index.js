import express from 'express';
import mongoose from 'mongoose';
import Poll from './model/Poll.js';
import { env } from '../environment.js';

if (!env || !env.uri) {
    console.log("Missing environment variables for atlas cluster access.\nExiting...");
    process.exit();
}



const PORT = 3000;

const app = express();
app.use(express.json());

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
        choices: ["kamala", "trump"]
    });

    res.status(200).send(poll._id);
});

// connect to mongoos then start the server;
try {
    mongoose.connect(env.uri);
} catch (err) {
    console.err("Could not connect to Atlas: ", err);
    process.exit();
}
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
















