# SmartReply – AI-Powered Email Auto-Reply Chrome Extension

SmartReply is a full-stack, production-grade AI portfolio application. It enables users to automatically generate context-aware, tone-customized email replies using **Google Gemini AI** directly from their Gmail interface via a **Chrome Extension** (Manifest V3) or manage them from a dedicated **React Dashboard**.

---

## 🏗️ Architecture

```
Chrome Extension (Gmail DOM Scraping)   <-- Message Passing -->   Popup Panel (Tone Selection)
                       |
                       +-----[ JWT Secure REST APIs ]-----> Spring Boot Backend
                                                                   |
  +--------------------+---------------------+---------------------+---------------------+
  |                    |                     |                     |                     |
[Security (JWT/RBAC)] [Spring Data MongoDB] [Spring AI (Gemini)] [AWS S3 / Local Disk] [Global Exceptions]
                       |                     |                     |
                  MongoDB Atlas         Google Studio       Cloud Object Bucket
```

The system components:
1. **Client Tier**:
   - **Chrome Extension (Manifest V3)**: Injected content scripts read the active email subject, body, and sender from Gmail's DOM. The popup UI communicates with the backend APIs via JWT-authorized headers, gets the draft, and inserts the reply back into Gmail's compose window.
   - **React.js Dashboard**: Standalone administrative portal built using Vite. Supports user authentication, profile settings, default preferred tone configuration, S3 asset uploading, and search/deletion of generated reply histories.
2. **Server Tier**:
   - **Java Spring Boot 3.3.0 + Spring Security**: Authenticates users, encrypts passwords using BCrypt, generates and checks stateless JWT tokens, and regulates Role-Based Access Control (RBAC) supporting `USER` and `ADMIN` roles.
   - **Spring AI**: Direct integration with Google Gemini AI (`gemini-1.5-flash`) using structured prompt templates (`email-reply.st`).
   - **Dual Storage Engine**: Exposes a flexible storage interface. Connects to **AWS S3** via AWS Java SDK v2 or falls back dynamically to the local file system (`LocalStorageService`) if S3 credentials are not supplied.
   - **MongoDB Database**: Collections for users (`users`), generation histories (`ai_replies`), and configurations.

---

## 🛠️ Technology Stack

- **Backend**: Java 17+, Spring Boot, Spring Security, Spring MVC, Spring Data MongoDB, Spring AI, JWT, Maven.
- **Frontend**: React.js (Vite), Lucide-Icons, Vanilla CSS (Glassmorphism design system).
- **Extension**: Chrome Extensions Manifest V3 (Content script, background worker, popup HTML/CSS/JS).
- **Storage**: AWS S3 SDK v2 / Local storage emulator.
- **Containerization**: Docker, Docker Compose.

---

## ⚙️ Configuration (Environment Variables)

Set up the following variables in your shell, system properties, or a `.env` file:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB connection URI string | `mongodb://localhost:27017/smartreply` |
| `GEMINI_API_KEY` | Google AI Studio Developer API Key | *(Required for AI replies)* |
| `JWT_SECRET` | Secret key used for signing JWT signatures | *(High-entropy base64 string)* |
| `FRONTEND_URL` | Permitted origins for CORS validation | `http://localhost:5173` |
| `STORAGE_PROVIDER` | Active file storage engine: `s3` or `local` | `local` |
| `AWS_ACCESS_KEY_ID` | AWS API key with access to S3 bucket | *(Optional if provider is local)* |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret API key | *(Optional if provider is local)* |
| `AWS_REGION` | Target AWS datacenter region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | S3 bucket name to store file assets | `smartreply-assets` |

---

## 🚀 Installation & Local Run

### 1. Database (MongoDB)
Ensure MongoDB is running locally at `mongodb://localhost:27017/smartreply` or set the `MONGODB_URI` environment variable to a MongoDB Atlas cluster.

### 2. Spring Boot Backend
1. Open a terminal inside the `/backend` folder.
2. Build the project using Maven:
   ```bash
   mvn clean install
   ```
3. Set your Gemini API Key in the environment:
   - **Windows (PowerShell)**:
     ```powershell
     $env:GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
     ```
   - **Linux/macOS**:
     ```bash
     export GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
     ```
4. Start the application:
   ```bash
   mvn spring-boot:run
   ```
   The backend API will start on [http://localhost:8080](http://localhost:8080).

### 3. React Frontend
1. Open a terminal inside the `/frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The dashboard UI will load on [http://localhost:5173](http://localhost:5173).

### 4. Chrome Extension
1. Open Google Chrome.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer Mode** using the toggle switch in the top right.
4. Click **Load unpacked** in the top left.
5. Select the `/extension` folder from the SmartReply project directory.
6. The SmartReply extension is now loaded! Pin it to your toolbar.

---

## 💻 Chrome Extension Gmail Workflow

1. Open Gmail and click on any email thread.
2. Click the **SmartReply** extension icon in your Chrome toolbar.
3. If not signed in, enter your account email and password (or sign up via the link).
4. The extension automatically scrapes the email subject, body, and sender.
5. Select your preferred reply tone (e.g., *Friendly*, *Professional*, *Short*).
6. Click **Generate Reply**.
7. Edit the generated response in the textarea if desired, then click **Insert to Reply**. The extension will insert the text directly into Gmail's active compose box and close itself.

---

## 🐳 Docker Deployment (Docker Compose)

Start the database, backend, and frontend containers automatically:
1. Open a terminal in the root folder (where `docker-compose.yml` resides).
2. Set your `GEMINI_API_KEY` in your host environment.
3. Run the orchestration command:
   ```bash
   docker-compose up --build
   ```
4. Access services at:
   - Frontend Dashboard: [http://localhost:5173](http://localhost:5173)
   - Spring Boot API: [http://localhost:8080](http://localhost:8080)
   - MongoDB: Port `27017`

---

## 📡 REST API Documentation

### Authentication `/api/auth`
- `POST /register`: Registers a new account, logs the user in, and returns a JWT token.
- `POST /login`: Validates credentials and returns a JWT token.

### Replies `/api/replies`
- `POST /generate`: Generates an email response using Gemini and persists the log in MongoDB. *(Auth Required)*
- `GET /history`: Returns a list of all replies generated by the authenticated user. *(Auth Required)*
- `GET /{id}`: Returns details of a specific generated reply. *(Auth / Owner Required)*
- `DELETE /{id}`: Deletes a reply log from history. *(Auth / Owner Required)*

### Profiles `/api/users`
- `GET /profile`: Retrieves user profile, role, and pre-selected tone preference. *(Auth Required)*
- `PUT /preferences`: Updates the user's default pre-selected reply tone. *(Auth Required)*

### Storage `/api/storage`
- `POST /upload`: Uploads a file (attachment/avatar) to AWS S3 or Local Disk storage and returns the asset's access URL.

---

## 🧪 Running Tests
Execute unit and mock tests:
1. Open a terminal in `/backend`.
2. Run:
   ```bash
   mvn test
   ```
Tests include authentication routines (`AuthControllerTest.java`) and fluent builder mock assertions for Spring AI Gemini (`EmailReplyAIServiceTest.java`).
