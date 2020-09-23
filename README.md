# BaroDocs

A small project for generating documentation for the game [Barotrauma](https://barotraumagame.com/) using the game's XML files.

The project is split in two: the scraper and the web app. The scraper generates a json file containing definitions for the web app, and the web app reads the definitions and generates html elements to display in the browser.

Currently in very early stages of development, the majority of features are missing.

## Setup

In order to run the generator for yourself, you will need node.js, npm and a retail copy of Barotrauma (public github repo has no content).

 1. Clone the github repo and run `npm install` to install all the packages.
 2. Open up "scraper.js" and change the `barotraumaPath` variable to point to where you have the retail version of Barotrauma installed.
 3. Copy the "Content" folder from your Barotrauma game into the "build" folder inside the repo.
 4. Run `node scraper.js` and copy the `items.json` file into the "Content" folder inside "build".
 5. Run `node server.js`
 6. Open up a web browser and nagivate to [localhost:8000](http://localhost:8000)

Note: Some of the xml files have syntax errors. The game's xml parser doesn't seem to mind but `xml-parser` doesn't seem to like them. You'll have to fix them manually. Make sure to validate your game files on steam after you're done or you won't be able to join any servers!

 - Content/Items/Fabricators/fabricators.xml:54 remove the second `>`
 - Content/Items/Containers/containers.xml:44 remove the `a` at the end

## TODO

 - Create ContentParsers for all the other content types (currently only Items are parsed)
 - Parse the rest of the tags found in Item ContentParser
 - Allow the user to specify `barotraumaPath`, `contentPackPath` and `languagePath` using command line arguments (yargs library?)
 - Improve individual pages in web app
 - Improve hover elements in web app
 - Improve mobile browsing experience
 - Bundle all the javascript into one file (webpack? browserify?)
 - Use react instead of creating all html elements with jquery
 - Alternatively, pre-generate html elements inside items.json