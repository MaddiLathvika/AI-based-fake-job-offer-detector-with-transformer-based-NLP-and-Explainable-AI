# IntelliHire 2.0 — AI-Powered Fake Job Offer Detector

**LIVE LINK** - https://fakejobofferdetector.lovable.app/

IntelliHire is a web-based application designed to help job seekers evaluate job postings and identify potential recruitment scams. It analyzes job descriptions, highlights suspicious phrases, and provides explanations to help users understand possible fraud indicators.

## Features

- **Job Posting Analysis:** Paste a job description to evaluate its credibility.
- **Fraud Risk Classification:** Categorizes job postings as `Legitimate`, `Suspicious`, or `Fake`.
- **Explainable AI:** Highlights important phrases that may indicate fraudulent or trustworthy hiring practices.
- **Risk Explanations:** Provides explanations for flagged words and phrases.
- **Sample Job Postings:** Allows users to try sample postings and explore the analysis.
- **User-Friendly Interface:** Offers a simple interface for analyzing job descriptions.

## How It Works

1. Paste a job description into the application.
2. Submit the posting for analysis.
3. IntelliHire evaluates the text using its configured analysis and classification logic.
4. View the predicted category and relevant warning indicators.
5. Review highlighted phrases and their explanations before making a decision.

## Technology Stack

Update this section to match the technologies used in your actual implementation.

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **AI / NLP:** Transformer-based Natural Language Processing (NLP), if configured in the project
- **Development Platform:** Lovable

## Getting Started

### Prerequisites

- Node.js (a compatible version)
- npm
- Git

### Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project directory:

```bash
cd YOUR_PROJECT_DIRECTORY
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

## Example Use Case

A job posting that requests an upfront registration fee, uses an unofficial email address, or promises unrealistic earnings may contain fraud indicators.

IntelliHire helps users review these signals and understand why a posting may be classified as suspicious or fake.

**Note:** Spelling mistakes or individual keywords alone do not prove that a job posting is fraudulent. Users should verify employers and vacancies through official sources.

## Project Structure

The exact structure depends on the generated codebase. A typical React application may contain:

```text
IntelliHire/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── ...
├── package.json
├── index.html
├── vite.config.ts
└── README.md
```

## Limitations

- Classification accuracy depends on the model, data, and analysis logic used.
- False positives and false negatives may occur.
- Results should be treated as decision-support information, not definitive proof of fraud.
- Users should independently verify job offers with the employer's official careers website.

## Future Enhancements

- Integrate a verified dataset of genuine and fraudulent job postings.
- Improve classification accuracy through model evaluation and testing.
- Add confidence scores and more detailed risk explanations.
- Support batch analysis of multiple job postings.
- Add links to official employer verification resources.

---

**If you find this project useful, consider starring the repository.**
