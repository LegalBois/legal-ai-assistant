# legal-ai-assistant

## How to run the project

1. Clone the repository
2. Add .env file to the backend folder with the following content:
```
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
```
3. Run the following commands for backend:

3.1. **Install Poetry:**
   If you haven't already, install Poetry by following the instructions from the [Poetry documentation](https://python-poetry.org/docs/#installation).

3.2 **Install Project Dependencies:**
   Navigate to the root directory of the project and run:
   ```bash
   poetry install
   ```

3.3 **Activate the Virtual Environment:**
   ```bash
   poetry shell
   ```
3.4 Local development usage
   ```bash
   uvicorn src.main:app --reload
   ```

4. Run the following commands for frontend:

Install Node.js from [Node.js website](https://nodejs.org/en/), if you haven't already.

4.1 Navigate to the frontend folder
   ```bash
   cd frontend
   ```

4.2 Install the dependencies
   ```bash
    npm install
   ```

4.3 Start the frontend
   ```bash
    npm run dev
   ```
