# Joshua Ewaoche — Student Portfolio

A responsive five-page student portfolio and academic planner built for **CSC 106 – Introduction to Web Technologies** at Miva Open University.

- **Live site:** https://joshuacreator.github.io/csc106-portfolio/
- **Repository:** https://github.com/joshuacreator/csc106-portfolio

## Overview

This project is a static, mobile-first portfolio that presents Joshua Ewaoche's academic background, technical skills, selected mobile projects, and contact information. It also includes an interactive academic planner that runs entirely in the browser.

No frameworks, build tools, or backend are required. The site is built with semantic HTML, custom CSS, and vanilla JavaScript, and is deployed with GitHub Pages.

## Pages

- **Home** — introduction, availability, services, selected work, quick biography, and call to action.
- **About** — story, academic background, career goals, technical skills, hobbies, and current learning.
- **Projects** — featured CSC 106 planner plus private client case studies for Savvy Bee, Kira AI, and Silex Secure Lab.
- **Academic Planner** — add, complete, filter, and delete tasks.
- **Contact** — direct contact details and a validated enquiry form.

## Features

- Responsive layout for mobile, tablet, and desktop.
- Shared navigation and footer across all pages.
- Dynamic student level and graduation year.
- Academic planner with task creation, completion, filtering, deletion, and progress tracking.
- Planner data persists in `localStorage`, so tasks survive page refreshes.
- Keyboard-friendly controls and visible focus states.
- Reduced-motion support.
- Client-side contact form validation for name, email, phone number, and message.
- The contact form has no backend; it prepares a prefilled email for the visitor to send from their email app.

## Built With

- HTML5
- CSS3 (custom properties, Grid, Flexbox, responsive media queries)
- Vanilla JavaScript
- Google Fonts (Fraunces, Inter, IBM Plex Mono)
- GitHub Pages

## Project Structure

```text
.
├── index.html          # Home page
├── about.html          # About page
├── projects.html       # Project case studies
├── planner.html        # Academic planner
├── contact.html        # Contact details and form
├── css/
│   └── styles.css      # Shared styles
├── js/
│   ├── main.js         # Navigation, dynamic dates, student level
│   ├── planner.js      # Planner state and interactions
│   └── contact.js      # Contact validation and mailto preparation
├── assets/             # Portrait, favicon, and project artwork
├── csc106_prd.md       # Original product requirements
└── README.md
```

## Run Locally

Clone the repository and open the site with any local static server.

```bash
git clone https://github.com/joshuacreator/csc106-portfolio.git
cd csc106-portfolio
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

Opening `index.html` directly in a browser also works, but a local server is recommended for consistent font, media, and JavaScript behavior.

## Deployment

The site is deployed from the `main` branch using GitHub Pages. To publish updates, commit and push changes to `main`; GitHub Pages rebuilds automatically.

## Author

**Joshua Ewaoche**  
B.Sc. Software Engineering, Miva Open University  
Abuja, Nigeria

- GitHub: https://github.com/joshuacreator
- LinkedIn: https://www.linkedin.com/in/joshua-ewaoche-249965255
- Email: joshuae0001@gmail.com
