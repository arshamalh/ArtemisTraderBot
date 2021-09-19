import crypto from "crypto";

export default class User {
    constructor (app) {

        this.loggedin = false;

        this.users = [
            {
                // This is the SHA256 hash for value of `sh136660`
                // password: 'sXLUZQJp0kxRRxnm7/oWKOVJ98tkAHFODug6LSlZVfU='
                password: 'X+zrZv/IbzjZUnhsbWlsecLbwjndTpG0ZynXOif7V+k=' // password is 0
            }
        ];

        this.authTokens = {};
        app.use((req, res, next) => {
            const authToken = req.cookies['AuthToken'];
            req.user = this.authTokens[authToken];
            next();
        });
    }
     
    login(req, res) {
        const { password } = req.body;
        const hashedPassword = this.getHashedPassword(password);

        const user = this.users.find(u => {
            return hashedPassword === u.password
        });

        if (!!user) {
            const authToken = this.generateAuthToken();
            this.authTokens[authToken] = user;
            this.loggedin = true;
            res.cookie('AuthToken', authToken);
            return {
                code: 200,
                token: authToken
            }
        } else {
            return {
                code: 301,
            }
        }
    }

    logout(req, res) {
        this.loggedin = false;
        this.authTokens = {};
        res.redirect('/login');
    }

    getLoginState() {
        return this.loggedin;
    }

    getHashedPassword(password) {
        const sha256 = crypto.createHash('sha256');
        const hash = sha256.update(password).digest('base64');
        return hash;
    }
    
    generateAuthToken() {
        return crypto.randomBytes(30).toString('hex');
    }
}