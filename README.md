# CHRONIFY - A TIME-BASED NOTES, TASKS & RECORDS MANAGER  

This project consists of a ReactJS Frontend and SpringBoot Backend.

### Backend Overview:
The backend is a Spring Boot REST API responsible for:
- User Management
- Journal entrty operations
- Business logic handling

**Key components**:
- Controller layer - Handles HTTP requests and responses
- Service Layer - Contains business logic
- Repository Layer - Managers database connection
- Entity Layer - Defines entity classes (POJO)

**Tech Stack**:
  - Java
  - Spring Boot
  - Maven
  - Embedded Tomcat

### Frontend Overview:
The frontend is a static web interface that interacts with the backend APIs.

**Pages**
- login.html - User authentication
- dashboard.html - User journal dashboard
- admin-dashboard.html - Admin level view
- styles.css - Application styling
- script.js - Client side logic and API calls

**Tech Stack**:
  - HTML
  - CSS
  - JavaScript (Vanilla)

### Setup and Run Backend (SpringBoot)
1. Set your mongoDB-Atlas URI(backend/src/resources):
   in application.properties

2. Start Backend server:
   - By running the JournalApplication.java file (The entry point of the application).
  
### Setup and Run FrontEnd
1. Navigate to the frontend directory:
```bash
cd "JournalApp - Frontend/"
```

2. Open login.html in a browser
   - Recommended to use a live server extension in your IDE.


### Features
- User authentication
- Create, view and manage journal entries
- Admin dashboard support
- REST-based backend
- Clean  seperation of frontend and backend

