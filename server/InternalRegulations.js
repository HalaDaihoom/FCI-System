/*const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3001;
const FILES_DIR = path.join(__dirname, "files");

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Serve the PDF file
app.get("/file", (req, res) => {
  const filePath = path.join(FILES_DIR, "Internal_Regulation_2011.pdf");
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

// Search within the PDF file (a simplified example, real search would require PDF parsing)
app.get("/search", (req, res) => {
  const query = req.query.q.toLowerCase();
  const filePath = path.join(FILES_DIR, "Internal_Regulation_2011.pdf");

  // Simplified search example - in a real scenario, you would parse the PDF and search its content
  if (query && query.length > 0) {
    res.json({ message: `Searched for "${query}" in the file.` });
  } else {
    res.status(400).json({ error: "No search query provided." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
*/



/*
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from Next.js frontend
};
app.use(cors(corsOptions));

// Serve static files
app.use('/files', express.static(path.join(__dirname, 'files')));

app.get('/', (req, res) => {
  res.redirect('http://localhost:3000/files');
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

*/

/*
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from Next.js frontend
};
app.use(cors(corsOptions));

// Serve static files
app.use('/files', express.static(path.join(__dirname, 'files')));

  
app.get('/', (req, res) => {
  res.redirect('http://localhost:3000/files');
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
*/




const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from Next.js frontend
};
app.use(cors(corsOptions));

// Serve static files
app.use('/files', express.static(path.join(__dirname, 'files')));

app.get('/', (req, res) => {
  res.redirect('http://localhost:3000/files');
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

