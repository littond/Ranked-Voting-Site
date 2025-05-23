import express from 'express';

const PORT = 3000;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello');
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
