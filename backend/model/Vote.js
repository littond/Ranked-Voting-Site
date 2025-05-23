import mongoose from "mongoose";
const { Schema, model } = mongoose;

const voteSchema = new Schema({
    pollId: String,
    choices: [String]
});

const Vote = model('vote', pollSchema);
export default Vote;