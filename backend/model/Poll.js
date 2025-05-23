import mongoose from "mongoose";
const { Schema, model } = mongoose;

const pollSchema = new Schema({
    _id: String,
    choices: [String]
});

const Poll = model('poll', pollSchema);
export default Poll;