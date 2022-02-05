# WikiHooku API

[![CircleCI](https://circleci.com/gh/xcarol/wikihooku-api/tree/master.svg?style=svg&circle-token=0c73b168d8d2b8a0d97965c82f0ecf1da9a3139f)](https://circleci.com/gh/xcarol/wikihooku-api/tree/master)

## Project setup

- To install the project dependencies run `yarn install`

### Environment variables

Stored in `.env` or `.env.test.local` file for development and test respectively  

**ALLOW_HEADERS** - CORS allow headers  

- Authorization

**ALLOW_ORIGINS** - CORS allow origins  

- development - *  
- production < wikihooku client url >  

**CONFIRMATION_URL** - Url where the users confirms their account

- development *<http://localhost:8080/confirm>*  
- production *<https://www.wikihooku/confirm>*  

**DATABASE** - Wikihooku  

**EXPOSE_HEADERS** - CORS expose headers  

- Authorization  

**FEEDBACK_EMAIL** - Wikihooku Feedback<feedback@wikihooku.com>  

**LOG_LEVEL** - debug  

**MONGODB_URI** - Mongo database uri  

- development *mongodb://admin:secret@127.0.0.1:27017/Wikihooku?authSource=admin*  
- production *mongodb+srv://\<user>:\<password>@cluster0.cxcwm.mongodb.net/\<database>?retryWrites=true&w=majority*

**PORT** - 3000  

**RECOVER_PASSWORD_URL** - Url for the user to recover password  

- development *<http://localhost:8080/resetpass>*  
- production *<https://www.wikihooku.com/resetpass>*  

**REGISTRATION_EMAIL** - Address from the registration email is sent to the user  

- Wikihooku <no-reply@wikihooku.com>  

**SALT** - SALT for password generation  

- example: $2b$10$FyD8sV/mOulEuHa.In9OS.  

**SECRET** - SECRET for password generation  

- example: W1k1WaX1cr4C0m  

**SENDGRID_API_KEY** - API key created by sendgrid to enable mail sending  

## First run

- Execute `yarn dev:env:start` to start mongo server locally
- Execute `yarn dev:env:build` to setup the database  

**Remember** to stop the developmet environment to avoid future weird issues

- Execute `yarn dev:env:stop`

## Run

- To run the application in development mode execute `yarn dev`
- To run the application in use mode execute `yarn start`

## Debug

To debug the application execute `yarn dev:debug`

## Tools

To lint the project execute `yarn lint` or `yarn lint:fix` to autofix lints

## Tests

**NOTE**: Before running tests copy the `.env` file to `.env.test.local` if it isn't already there or you have your own customized `.env.test.local`.

To run all tests execute  `yarn test`

To run unit tests execute  `yarn test:unit` or  `yarn test:unit:debug` to debug them

To run functional tests execute  `yarn test:func` or  `yarn test:func:debug` to debug them
