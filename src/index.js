const fs = require('fs');
const axios = require('axios');

function readNumbersFromFile(fileName) {
    try {
        const data = fs.readFileSync(fileName, 'utf8');
        const numbers = data.split('\n')
                            .filter(line => line.trim() !== '')
                            .map(line => {
                                const num = Number(line.trim());
                                return isNaN(num) ? null : num;
                            })
                            .filter(num => num !== null);
        return numbers;
    } catch (error) {
        console.error('Error reading the file:', error.message);
        return [];
    }
}

async function fetchDataForNumbers(numbers) {
    const results = [];

    for (const number of numbers) {
        try {
            const response = await axios.get(`https://xkcd.com/${number}/info.0.json`);
            results.push(response.data);
        } catch (error) {
            console.error(`Error fetching data for number ${number}:`, error.message);
        }
    }

    return results;
}

function generateHTMLContent(comics) {
    return comics.map(comic => `
        <div>
            <h2>${comic.title}</h2>
            <img src="${comic.img}" alt="${comic.alt}">
        </div>
    `).join('');
}

async function main() {
    try {
        const numbers = readNumbersFromFile('src/nr.txt');
        const comics = await fetchDataForNumbers(numbers);
        fs.readFile('src/template.html', 'utf8', async (error, template) => {
            if (error) {
                console.error("Error reading template file:", error);
                return;
            }
            const content = generateHTMLContent(comics);
            const finalHtml = template.replace('{{content}}', content);
            fs.writeFile('output.html', finalHtml, async (error) => {
                if (error) {
                    console.error("Error writing output file:", error);
                    return;
                }
                const open = (await import('open')).default;
                open('output.html');
                console.log("HTML file generated successfully and opened in your default browser!");
            });
        });
    } catch (error) {
        console.error("Error in main function:", error.message);
    }
}

main();