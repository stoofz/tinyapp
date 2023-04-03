# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Screenshots

!["Login"](/docs/login.PNG)

!["Shorten"](/docs/shorten.PNG)

!["myURLs"](/docs/myURLs.PNG)

## Dependencies

* Node.js
* Express
* EJS
* bcryptjs
* cookie-session
* method-override

## Getting Started

* Install all dependencies (using the `npm install` command).
* Run the development web server using the `node express_server.js` command.
* Browse to `http://localhost:8080`

## Features

* Creation of User Accounts / Login
* User account permissions
* Creation of Short URL's
* Edit or Delete Short URL's (Using method-overide to PUT/DELETE endpoints)
* Shareable Short URL Links accessable by anyone


