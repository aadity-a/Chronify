# CHRONIFY - A TIME-BASED NOTES, TASKS & RECORDS MANAGER  

### Backend Overview:
The Backend is a Spring Boot REST API responsible for:
- User Management
- Journal entry operations
- Business logic handling

**Key components**:
- Controller layer - Handles HTTP requests and responses
- Service Layer - Contains business logic
- Repository Layer - Manages database connection
- Entity Layer - Defines entity classes (POJO)

**Tech Stack**:
  - Java
  - Spring Boot
  - Maven
  - Embedded Tomcat

### Frontend Overview:
The Frontend is a static web interface that interacts with the Backend APIs.

**Pages**
- login.html - User authentication
- dashboard.html - User journal dashboard
- admin-dashboard.html - Admin-level view
- styles.css - Application styling
- script.js - Client side logic and API calls

**Tech Stack**:
  - HTML
  - CSS
  - JavaScript (Vanilla)

### Setup and Run Backend (Spring Boot)
1. Set your mongoDB-Atlas URI(src/main/resources):
   in application.properties

2. Start Backend server:
   - By running the JournalApplication.java file (The entry point of the application).
  
### Setup and Run Frontend
1. Navigate to the Frontend directory:
```bash
cd "JournalApp - Frontend/"
```

2. Open login.html in a browser
   - Recommended to use a live server extension in your IDE.


### Features
- User authentication
- Create, view and manage journal entries
- Admin dashboard support
- REST-based Backend
- Clean separation of Frontend and Backend

