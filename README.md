# TruthLens_AI

**TruthLens_AI** is an AI-powered "investigative tool" that uncovers the absurd, hidden truths behind ordinary objects. Upload a photo, and our high-level "whistleblower" AI will generate a cinematic, unhinged conspiracy theory complete with evidence boards, timelines, and fake Reddit leaks.

### Screenshots
<!-- 
<img width="1517" height="1040" alt="conspirai-1" src="https://github.com/user-attachments/assets/cbe3d601-62d3-4de2-8f08-8bc958b14296" /> -->
<img width="1514" height="1038" alt="conspirai-2" src="https://github.com/user-attachments/assets/60be40b0-a875-4ea7-9f19-0d08387424ec" />
<img width="1506" height="1035" alt="conspirai-3" src="https://github.com/user-attachments/assets/db5e55fd-21af-4f58-a828-e671e99c56a2" />
<img width="1515" height="1038" alt="conspirai-4" src="https://github.com/user-attachments/assets/ed61c970-0d5a-469e-b528-b7be1b185785" />
<img width="1313" height="1009" alt="conspirai-5" src="https://github.com/user-attachments/assets/f5e31c50-035a-46f1-a738-0900ab114d8f" />
<img width="1343" height="980" alt="conspirai-6" src="https://github.com/user-attachments/assets/5628d9cc-d74b-49ad-ba79-01222c73c453" />
<img width="1433" height="1037" alt="conspirai-7" src="https://github.com/user-attachments/assets/e0028027-a216-46dd-89c9-b08219826e06" />


## Technologies Used

- **React 18 & Vite**: Modern, lightning-fast frontend framework.
- **Google Gemini 1.5 Flash**: Orchestrating deep-image analysis and creative narrative generation.
- **Tailwind CSS**: Custom "Hacker/Brutalist" UI styling.
- **Framer Motion**: Smooth, cinematic transitions and glitch effects.
- **Lucide React**: Vector icons for the investigative interface.
- **TypeScript**: Type-safe development for complex AI data structures.

## Architecture

The application follows a clean, single-page application (SPA) architecture:

1. **Client Layer**: React components handling state, image uploads, and rendering.
2. **Analysis Service**: `geminiService.ts` handles communication with the Google Generative AI SDK, performing multi-modal analysis (Image + Text).
3. **Data Layer**: JSON-schema driven AI responses ensure structured data for evidence boards, timelines, and social leaks.

```mermaid
graph TD
    User((User)) -->|Upload Image| ReactApp[React App]
    ReactApp -->|Resize/Pre-process| Utils[Utils]
    Utils -->|Base64| GeminiService[Gemini Service]
    GeminiService -->|Multi-modal Prompt| GeminiAI[Gemini 1.5 Flash]
    GeminiAI -->|Structured JSON| GeminiService
    GeminiService -->|Conspiracy Object| ReactApp
    ReactApp -->|Render| Results[Investigation Results]
```

## How to Fork & Contribute

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ishitachauhann/TruthLens_AI.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Create a `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```

### 💡 Ideas for New Features

- [ ] **Multi-Object Analysis**: Upload two photos to find a "secret connection" between them.
- [ ] **Voice Synthesis**: Use a text-to-speech engine to read the "Leaked Narrator Logs".
- [ ] **Export to PDF**: Generate a formal "Classified PDF" dossier for users to download.
- [ ] **Community Feed**: A public board where users can see the most unhinged theories generated.
