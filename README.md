# BaroDocs

A documentation generator for the game [Barotrauma](https://barotraumagame.com/) using the game's XML files.

The project is split in two: the scraper and the web app. The scraper generates a json file containing definitions for the web app, and the web app reads the definitions and generates html elements to display in the browser.

Currently in very early stages of development, the majority of features are missing.

## Setup

In order to run the generator for yourself, you will need node.js, npm and a retail copy of Barotrauma.

 1. Clone the github repo and run `npm install` to install all the packages.
 2. Copy the "Content" and "Data" folder from your Barotrauma game into the "build" folder inside the repo.
    1. Fix the XML files as detailed below
 4. Run `npm run scrape` to scrape the files
 5. Run `npm run build` to build the web app
 6. Run `npm start` to start the web server
 7. Open up a web browser and nagivate to [localhost:8000](http://localhost:8000)

### XML Syntax errors

Some of the game's xml files have syntax errors. The game's xml parser doesn't seem to mind but `xml-parser` will stop parsing without throwing errors. You'll have to fix them manually. Make sure to only modify the files you copied to the "build" folder, not the files in game itself as you won't be able to join any servers.

 - Content/Items/Containers/containers.xml:45 remove the `a` at the end
 - Content/Items/Containers/containers.xml:475 remove the `\>` at the end

## TODO

 - Move to typescript
 - Create ContentParsers for all the other content types (currently only Items and Afflictions are parsed)
 - Parse the rest of the tags found in Item ContentParser
 - Allow the user to specify the `contentPackPath` and `languagePath` using command line arguments (yargs library?)
 - Improve search functionality
 - Improve mobile browsing experience
 - Replace all usage of jquery and replace bootstrap with bootstrap-react
 - Use a better XML parser