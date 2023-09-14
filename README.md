# WikiHooku API

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/8cd4821b097a457b8dbed79f3abae62a)](https://app.codacy.com/gh/xcarol/wikihooku-api/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

This is the API for the [WikiHooku](https://github.com/xcarol/wikihooku) application. Refer to the [WikiHooku](https://github.com/xcarol/wikihooku) application to know more about this project.

## Project setup

- To install the project dependencies run `npm install`

### Environment variables

Stored in `.env` file for development and `.env.test.local` file for testing.  

**ALLOW_HEADERS** - CORS allow headers  

- Authorization

**ALLOW_ORIGINS** - CORS allow origins  

- development - *  
- production < wikihooku client url >  

**CONFIRMATION_URL** - Url where the users confirms their account

- development *<http://localhost:8080/#/confirm>*  
- production *<https://www.wikihooku/#/confirm>*  

**DATABASE** - Wikihooku  

**EXPOSE_HEADERS** - CORS expose headers  

- Authorization  

**FEEDBACK_EMAIL** - Wikihooku Feedback<feedback@wikihooku.com>  

**FEEDBACK_SENDER_EMAIL** = Wikihooku Sender Feedback <feedback-sender@wikihooku.com>

**LOG_LEVEL** - debug  

**MONGODB_URI** - Mongo database uri  

- development *mongodb://admin:secret@127.0.0.1:27017/Wikihooku?authSource=admin*  
- production *mongodb+srv://\<user>:\<password>@cluster0.cxcwm.mongodb.net/\<database>?retryWrites=true&w=majority*

**PORT** - 3000  

**RECOVER_PASSWORD_URL** - Url for the user to recover password  

- development *<http://localhost:8080/#/resetpass>*  
- production *<https://www.wikihooku.com/#/resetpass>*  

**REGISTRATION_EMAIL** - Address from the registration email is sent to the user  

- Wikihooku <no-reply@wikihooku.com>  

**SALT** - SALT for password generation  

- example: $2b$10$FyD8sV/mOulEuHa.In9OS.  

**SECRET** - SECRET for password generation  

- example: W1k1WaX1cr4C0m  

**SENDGRID_API_KEY** - API key created by sendgrid to enable mail sending  

## First run

- Execute `npm run dev:env:start` to start mongo server locally
- Execute `npm run dev:env:build` to setup the database  

**Remember** to stop the developmet environment to avoid future weird issues

- Execute `npm run dev:env:stop`

## Run

- To run the application in development mode execute `npm run dev`
- To run the application in use mode execute `npm run start`

## Debug

To debug the application execute `npm run dev:debug`

## Tools

To lint the project execute `npm run lint` or `npm run lint:fix` to autofix lints

## Tests

**NOTE**: Before running tests copy the `.env` file to `.env.test.local` if it isn't already there or you have your own customized `.env.test.local`.

To run all tests execute  `npm run test`

To run unit tests execute  `npm run test:unit` or  `npm run test:unit:debug` to debug them

To run functional tests execute  `npm run test:func` or  `npm run test:func:debug` to debug them
