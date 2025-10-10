# Project Overview

This project is a single-file web application that functions as a QTI 2.1 package generator. QTI is a standard for e-learning material, and this tool specifically creates packages for multiple-choice questions.

The application is contained entirely within the `Gerador_Qti2_1_v17.html` file. It uses HTML for structure, CSS for styling, and vanilla JavaScript for all its logic. It also leverages the `JSZip` and `FileSaver.js` libraries to generate and save the `.zip` file containing the QTI package.

The user interface allows for:
*   Inputting question titles, questions, and multiple-choice answers.
*   Marking the correct answer.
*   Adding feedback for each question.
*   Including images within the questions.
*   Formatting text (bold, italic).
*   Validating the structure of the questions before generation.

# Building and Running

This is a single-file web application. No build process is required.

To run the application, simply open the `Gerador_Qti2_1_v17.html` file in a web browser.

# Development Conventions

*   All code (HTML, CSS, JavaScript) is located in a single `.html` file.
*   The application uses the `JSZip` and `FileSaver.js` libraries, which are included via a CDN.
*   The application uses `localStorage` to save the user's work in the browser.
*   The code is written in Portuguese.
