var express = require('express');
const userHelper = require('../models/userHelper');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('./User/dash')
});
// Ask POST route
router.post('/--user--/sdfsdf8s7df8756sdfsd6f897bs6vf7xb&VfFGDp:KUIGSDGFUGDSFUIGSFDGSDFSD8234/asked/sdfsdf8s7df8756sdfsd6f897bs6vf7xb&VfFGDp:KUIGSDGFUGDSFUIGSFDGSDFSD8234', async (req, res) => {
  console.log(req.body);
  

  const userInput = req.body.InputFromUser;

  try {
    // Ask Gemini and get the response
    const response = await userHelper.askGemini(userInput);
    console.log(response); 

    const parsedResponse = parseGeminiResponse(response); 

    // Create HTML content from the extracted information
    let formattedResponse = "";

    // Iterate over each section in the parsed response
    parsedResponse.sections.forEach(section => {
      formattedResponse += `
        <h2 style="font-size: 1.5rem; color: #1e90ff; margin-bottom: 1rem;">${section.title}</h2> 
        ${section.content.map(item => {
          // Check if it's a subsection or a simple bullet point
          if (item.title) { // Subsection
            return `<h3 style="font-size: 1.25rem; color: #ff6347; margin-left: 2rem; margin-top: 0.5rem;">${item.title}</h3>
                    <ul style="margin-left: 1.5rem; color: #20b2aa;">
                      ${item.content.map(bullet => `<li style="margin-bottom: 0.5rem; color: #4682b4; font-size: 1rem;">${bullet}</li>`).join('')}
                    </ul>`;
          } else { // Simple bullet point
            return `<ul style="font-size="1rem" color: #6a5acd;">
                      <p style="margin-bottom: 0.5rem; font-size: 1rem; color: #8b008b;">${item}</p>
                    </ul>`;
          }
        }).join('')}
      `;
    });
    
    console.log("Formatted Response:", formattedResponse);

    // Render the dashboard with the user input and formatted response
    res.render('./User/dash', {
      userInput,
      generatedText: formattedResponse,
    });

  } catch (error) {
    console.error("Error while asking Gemini:", error);

    // Render the dashboard with an error message
    res.render('./User/dash', {
      userInput,
      generatedText: "Sorry, something went wrong."
    });
  }
});function parseGeminiResponse(text) {
  const parsedResponse = {
    sections: []
  };

  // Regular expressions for identifying headings and bullet points
  const headingRegex = /^##+\s+(.*)/; // Matches headings starting with ##
  const subheadingEmphasisRegex = /^\s*\*\*([^*]*)\*\*\s*$/; // Matches subheadings starting and ending with **
  const bulletRegex = /^\s*\*\s+(.*)\s*$/; // Matches bullet points starting with *

  // Split the text into lines
  const lines = text.split('\n');

  let currentSection = null;
  let currentSubsection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // If line is empty, skip it
    if (!line) continue;

    // Check for heading
    let headingMatch = line.match(headingRegex);
    if (headingMatch) {
      currentSection = {
        title: headingMatch[1].trim(),
        content: []
      };
      parsedResponse.sections.push(currentSection);
    } else {
      // Check for subheading (starts and ends with **)
      let subheadingEmphasisMatch = line.match(subheadingEmphasisRegex);
      if (subheadingEmphasisMatch) {
        currentSubsection = {
          title: subheadingEmphasisMatch[1].trim().replace(/\*\*/g, ''), // Extract title without the **
          content: []
        };
        currentSection.content.push(currentSubsection);
      } else {
        // Check for bullet point (starts with *)
        let bulletMatch = line.match(bulletRegex);
        if (bulletMatch) {
          // Remove * from bullet point text
          if (currentSubsection) {
            currentSubsection.content.push(bulletMatch[1].trim().replace(/\*/g, ''));
          } else {
            currentSection.content.push(bulletMatch[1].trim().replace(/\*/g, ''));
          }
        } else {
          // Add non-heading/subheading/bullet content
          // Remove ** from the content
          const cleanLine = line.replace(/\*\*/g, '');
          if (currentSubsection) {
            currentSubsection.content.push(cleanLine);
          } else if (currentSection) {
            currentSection.content.push(cleanLine);
          }
        }
      }
    }
  }

  // If no headings are found, create a default section (outside the loop)
  if (parsedResponse.sections.length === 0) {
    parsedResponse.sections.push({
      title: "",
      content: lines.map(line => line.trim().replace(/\*\*/g, ''))
    });
  }

  console.log("Parsed Response:", parsedResponse);

  return parsedResponse;
}
module.exports = router;
