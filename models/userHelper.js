const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports ={
askGemini:async(prompt) =>{
    try {
        // Use the correct method to access the API key from environment variables
        const apiKey = process.env.API_KEY || 'AIzaSyDZi05N1YLh1yHoxxwjqbqPGzxkqZtMF6c';
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Generate content using the prompt
        const result = await model.generateContent(prompt);
        
        // Access the generated text
        const generatedText = result.response.text();  // Ensure this line matches the API response format
        return generatedText;
    } catch (error) {
        console.error("Error while asking Gemini:", error);
        throw error;
    }
},
}