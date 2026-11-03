# TIPS Immigration Services: website

Sample redesign of tipscanada.ca. Built with Eleventy and hosted on Netlify.

## Editing
- Page text lives in `src/` (one file per page).
- Shared header/footer layout: `src/_includes/`.
- Photos go in `src/images/`.

## Preview on your computer
```
npm install
npm start
```
Then open the address it prints (usually http://localhost:8080).

## Publishing
Pushing to the `main` branch on GitHub publishes the site through Netlify automatically.

## Note
`src/robots.txt` currently blocks search engines because this is a sample. Change it before launch.
