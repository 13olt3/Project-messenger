#  Mini Message Board

A full-stack web application built as part of **The Odin Project** Node.js curriculum. This project demonstrates the implementation of the MVC (Model-View-Controller) pattern, integration with a relational database, and deployment to a cloud environment.

##  Features

- **Message Persistence:** Users can submit messages that are stored in a PostgreSQL database.
- **Input Validation:** Secure backend validation for user submissions.
- **Relational Data:** Utilizing Prisma to manage schema and database interactions.

##  Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Deployment:** Netlify

##  Architecture

The project follows the **MVC (Model-View-Controller)** design pattern to ensure separation of concerns:

- **Models:** Prisma schemas defining our Message and User structures.
- **Controllers:** Logic to bridge user requests with database operations.

## Thoughts

This project was about connecting all the peices together. Making sure that the http requests all went to the appropriate place and worked seamlessly.
This project also employed Claude Code to do basic styling.
