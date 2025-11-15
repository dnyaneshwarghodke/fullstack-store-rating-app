# Full-Stack Store Rating Web App

A complete web application built with React, Express, and PostgreSQL that allows users to rate and review stores. This app features three distinct user roles (Normal User, Store Owner, and System Administrator), each with a unique dashboard and set of permissions.

**Live Demo: [Link to your Vercel URL ](https://fullstack-store-rating-app-nine.vercel.app/)**

---

## Features

* **Full Authentication:** Secure JWT (JSON Web Token) authentication for login and password-protected routes.
* **Role-Based Dashboards:** The UI completely changes based on the user's role (`NORMAL`, `OWNER`, `ADMIN`).
* **Normal User:** Can view/search all stores, see an overall rating, and submit/update their own 1-5 star rating.
* **Store Owner:** Can view a dashboard for *their* store, including its average rating and a table of all users who have rated it.
* **System Administrator:** Full control panel to:
    * View dashboard analytics (total users, stores, ratings).
    * Create, list, filter, and view details for all users.
    * Create, list, and filter all stores.

## Tech Stack

* **Frontend:** React, React Router, Axios, Vite
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Authentication:** JWT, bcryptjs

---

## How to Run Locally

1.  **Git repo: [repo Link](https://github.com/dnyaneshwarghodke/fullstack-store-rating-app)**
2.  **Setup Backend:**
    ```bash
    cd store-rating-backend
    npm install
    # Set up your .env file with database credentials
    npm run dev
    ```
3.  **Setup Frontend:**
    ```bash
    cd store-rating-frontend
    npm install
    npm run dev
    ```
