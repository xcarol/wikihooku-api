# WikiHooku API

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/8cd4821b097a457b8dbed79f3abae62a)](https://app.codacy.com/gh/xcarol/wikihooku-api/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

This is the API for the [WikiHooku](https://github.com/xcarol/wikihooku) application. Refer to the [WikiHooku](https://github.com/xcarol/wikihooku) application to know more about this project.

## Project setup

- To install the project dependencies run `npm install`

### Environment variables

Stored in `.env` file.  

**PORT** - Server listening port

- 3000  

**ALLOW_HEADERS** - CORS allow headers  

- Authorization

**ALLOW_ORIGINS** - CORS allow origins  

- development - *  
- production < wikihooku client url >  

**EXPOSE_HEADERS** - CORS expose headers  

- Authorization  

**LOG_LEVEL** - Level of traces to register

- debug  

**DATABASE** - Name of the database

- Wikihooku  

**MONGODB_URI** - Mongo database uri  

- development *mongodb://admin:secret@127.0.0.1:27017/Wikihooku?authSource=admin*  
- production *mongodb+srv://\<user>:\<password>@cluster0.cxcwm.mongodb.net/\<database>?retryWrites=true&w=majority*

**SALT** - SALT for password generation  

- example: $2b$10$FyD8sV/mOulEuHa.In9OS.  

**SECRET** - SECRET for password generation  

- example: MyC00lS3cr3t  

**CONFIRMATION_URL** - Url where the users confirms their account

- development *<http://localhost:8080/confirm>*  
- production *<https://www.wikihooku/confirm>*  

**RECOVER_PASSWORD_URL** - Url for the user to recover password  

- development *<http://localhost:8080/resetpass>*  
- production *<https://www.wikihooku.com/resetpass>*  

### Email attributes

- SMTP server (mostly for production) has precedence over Sendgrid  

**SMTP_SERVER** - SMTP server address  

**FEEDBACK_EMAIL_USR** - user's email address to send feedback to  

**FEEDBACK_EMAIL_PWD** - user's password to send feedback to  

**REGISTRATION_EMAIL_USR** - user's email address used to send registration and recover password emails  

**REGISTRATION_EMAIL_PWD** - user's password used to send registration and recover password emails  

- Sendgrid (mostly for development)  

**SENDGRID_API_KEY** - API key created by sendgrid to enable mail sending  

**FEEDBACK_SENDER_EMAIL** - Wikihooku Sender Feedback <feedback-sender@wikihooku.com>

- Both

**FEEDBACK_EMAIL** - Wikihooku Feedback <feedback@wikihooku.com>  

**REGISTRATION_EMAIL** - Address from the registration email is sent to the user - Wikihooku <no-reply@wikihooku.com>  

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

After being a passionate of tests for years I finally decided that I like to develop applications  
instead of developing applications prepared to be tested and spent more than 60% of development time  
writing tests. Now I feel comfortable with a good code structure and encapsulation (I do my best)  
a readable code and automatic tools like *codacy* which are porwerful enough to help on the  
code improvment.  

- *You can write a million tests, at some point the application will fail for sure*
