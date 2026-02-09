import app from './app.js';

const port = process.env.APP_PORT || 3000;

app.listen(port, () => {
    console.log();
    console.log(`Escutando na porta ${port}`);
    console.log(`CTRL + Clique em http://localhost:${port}`);
});
