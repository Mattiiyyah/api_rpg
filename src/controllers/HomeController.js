class HomeController {
    async index(req, res) {
        res.json('Api funcionando!');
    }
}

export default new HomeController();