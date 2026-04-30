# Project title and description (what it does and who it's for)
WanderPlan Travel Planner helps travelers manage important information while traveling. Rather than needing multiple documents to keep track of all important information, this app makes it easy for users to input their info in a clear and accessible way. When they are done editing their trip, they are able to print their itinerary and information to have with them to reference while they travel.

# Live demo URL (GitHub Pages link)
[Trip Planner](https://mcrawford2.github.io/trip.planner)

# Features list (what users can do)
- From home page, click Start Your Journey to begin planning
- Give their trip a fun and memorable name
- Add destinations of the trip, as many as they want, with City, Country, and Dates inputs
- Add number of travelers
- Add total budget
- Edit 'What do you want to do?' section, for specific activities and things planned
- Optionally add on information for flights, hotels, Traveler information, embassys, visas, health information, budget tracking
- Click Create My Itinerary to see it from a non-editing perspective, with full summary of components
- Click Back to Builder to continue editing
- Click Save Itinerary to sve as PDF for later online reference or print to keep with them while traveling

# Technologies used
- HTML, CSS, JavaScript: core structure, styling, and interactivity
- Google Fonts (generated through AI): Outfit and Plus Jakarta Sans typefaces
- html2pdf.js: PDF export functionality on the itinerary page
- Unsplash: for background images

From the requirements, this app uses:
- DOM manipulation (dynamic content updates)
    - When the script reads saved form data and writes it back into the itinerary view, updates summary counters, and creates or removes repeatable entry rows
- Event handling (user interactions)
    - When listeners are attached to the builder form and buttons (input, change, click, submit)
- Form with validation and feedback
    - When checking the form before submission

# AI tools used and how they helped
- I used AI for coding, debugging, and learning. I did my prototyping by hand, and used Copilot as my sole AI tool. 

When coding, I would ask it prompts such as:
    - "put the 'start your journey' button in the centered in the page, and move 'free forever for travelers' underneath"
    - "just renamed itinerary.html, make sure files are still correctly linked and referenced"
- These are things I could have changed manually, but asking AI to help made the process much more efficient.
- While using AI for code, it often created long, specific class names. I usually tried to avoid this to make the files more readable, but it did help when looking for the classes later to use cntl F those specific names. In the end, I decided to keep the long class names. 

I was able to understand most of the AI code, but when I didn't I would use AI for learning, and would ask the AI prompts such as:
    - "what is line x for"
    - "what does data-toggle-target mean on lines 112-118"
- The largest chunks of code written by AI was in main.js, but I am able to fully understand it. Nothing in the code was not reviewed and tested after AI wrote it. 

I additionally used AI for debugging, especially when trying to improve my Lighthouse performance score. It started at a 61, and is now an 88. The first couple of tries to fix this required changing the entire look of the app, which I did not want to do. Eventually, Copilot helped me fix this by finding missing tag issues, and discovering a date formatting bug. 


# Challenges faced and how you solved them
- Getting form data to persist between the builder and itinerary pages. Since the project is deployed as a static site on GitHub Pages, there is no backend to store data. I solved this using sessionStorage, which keeps the data available as long as the browser tab is open, so the itinerary page can read exactly what was entered in the builder.

AI generated Tailwind CSS configuration inline in the HTML files rather than in a separate stylesheet. I tried to move most of the CSS to a separate stylesheet, but left a piece of CSS code at the beginning of each HTML file. I left that because when those lines were moved, I did not like the way it changed the visual appearance of the entire screen, and I could not get it to look that way with all the CSS code in the CSS file. With help from AI, learned that the custom color and font tokens needed to be available to Tailwind at runtime, and moving them would have broken the styling. 

The PDF export required extra effort because the background images, dark overlays, and white text that enhance user experience on the screen print as nearly unreadable. To fix this, there was a lot of trial and error. The final solution was to shift from pdf exporting to printing that also has a pdf save option, and to add a `pdf-exporting` class that gets toggled onto the body on print, which overrides colors to black on white and hides decorative elements like the background photo and nav buttons. 

Figuring out how to format saving in this app was also an issue. I started with no savability, which did not work in case the user wanted to go back and forth between te builder and itinerary pages. I then added the use of local storage, but did not like the way that information was already inputted in the builder when coming from the start page. I ended up choosing to use session storage, which saves the input data enough for uses to go back and forther across the pages and save the information with the save button when they are ready, but also clears the memory when the app is closed and reopened.

# Future improvements (what you would add with more time)
With more time, I would have added drag and drop common travel activities. This is someting I wanted to add to make this project complete, but ran out of time. I think that features such as this would have made this project much more dynamic and memorable by the user. The dragging and dropping would have added a new form of developing information rather than being just a typing based app.

I would have incorporated the APIs Leaflet.js and REST Countries for an interactive map and specific country information. This could have shown a visualization of the travel route the users take. It also would have allowed for a country information panel specific to the user inputs of where they are visiting. It would have helped them to know time differences, currency info, what to expect for weather, and more. Similarly, knowing the weather helps with packing decisions, so the ability to include packing lists would have also improved the app. I still might add these features in the future, beyond the scope of this course.

Finally, with more time I would also want to make the way the itinerary shows up while exporting to PDF or printing more visually appealing. It is fine as it is, and all information is readable, but I think with more time this could look good, rather than just ok. 