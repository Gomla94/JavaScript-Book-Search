const modeCheckbox = document.querySelector('input[type=checkbox]');
modeCheckbox.addEventListener('change', toggleTheme);
const modeLogoelement = document.getElementById('modeLogo');
const modeSlider = document.querySelector('.slider');
const fileTitle = document.getElementById('fileTitle');
const fileContent = document.getElementById('fileContent');
const mostUsedWordsEl = document.getElementById('mostUsedWords');
const leastUsedWordsEl = document.getElementById('leastUsedWords');
const searchBtn = document.getElementById('searchBtn');
const searchStat = document.getElementById('searchStat');
searchBtn.addEventListener('click', searchWord);

let currentBook = '';

//toggle between dark/light mode
function toggleTheme(event) {
    if (event.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleDarkLightMode(true);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        toggleDarkLightMode(false);
    }
}


//change the mode switcher radio button style
function toggleDarkLightMode(isDark) {
    isDark ? modeLogoelement.classList.replace('fa-sun', 'fa-moon') : modeLogoelement.classList.replace('fa-moon', 'fa-sun');
    isDark ? modeLogoelement.style.color = '#53eaea' : modeLogoelement.style.color = 'yellow'
    isDark ? modeSlider.style.backgroundColor = '#ffff00' : modeSlider.style.backgroundColor = '#ccc';
}

//load book & change the dom
async function loadBook(fileName, displayName) {
    fileTitle.innerHTML = displayName;
    fileContent.innerHTML = '';
    let url = `/books/${fileName}`;
    currentBook = await getBook(url);
    //the next regular expression will look for line breaks, carriage returns,
    //and replace them with <br>.
    let modifiedBook = currentBook.replace(/(?:\r\n|\r|\n)/g, '<br>');
    fileContent.innerHTML = modifiedBook;
    fileContent.scrollTop = 0;
    searchStat.textContent = '';
    getStats(currentBook);
}

//get specific book
async function getBook(url) {
    const response = await fetch(url);
    return response.text();
}

//a list of stop words we don't want to include in stats
function getCommonWords() {
    return ["a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your", "ain't", "aren't", "can't", "could've", "couldn't", "didn't", "doesn't", "don't", "hasn't", "he'd", "he'll", "he's", "how'd", "how'll", "how's", "i'd", "i'll", "i'm", "i've", "isn't", "it's", "might've", "mightn't", "must've", "mustn't", "shan't", "she'd", "she'll", "she's", "should've", "shouldn't", "that'll", "that's", "there's", "they'd", "they'll", "they're", "they've", "wasn't", "we'd", "we'll", "we're", "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd", "where'll", "where's", "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't", "would've", "wouldn't", "you'd", "you'll", "you're", "you've"];
}

//filter the words array
function filterUnCommonWords(wordsArray) {
    const commonWords = getCommonWords();
    const commonObj = {};
    const uncommonWordsArray = [];

    for (let i = 0; i < commonWords.length; i++) {
        commonObj[commonWords[i].trim()] = true;
    }

    for (let i = 0; i < wordsArray.length; i++) {
        let word = wordsArray[i].trim().toLowerCase();
        if (!commonObj[word]) {
            uncommonWordsArray.push(word);
        }
    }

    return uncommonWordsArray;

}

//get the book stats and show it in the dom
function getStats(fileContent) {
    let docLength = document.getElementById('docLength');
    let wordCount = document.getElementById('wordCount');
    let text = fileContent.toLowerCase();
    //the next regular expression will check for every characters between two spaces,
    //and assume that it's a word and will do it globaly (g), and it will return arra of words.
    let wordsArray = text.match(/\b\S+\b/g);
    let wordsDictionary = {};
    const uncommonWords = filterUnCommonWords(wordsArray);
    for (let word in uncommonWords) {
        let wordValue = uncommonWords[word];
        if (wordsDictionary[wordValue] > 0) {
            wordsDictionary[wordValue] += 1;
        } else {
            wordsDictionary[wordValue] = 1;
        }
    }

    //get the sorted words array and display the stats
    const sortedArray = sortArray(wordsDictionary);
    const mostUsedWords = sortedArray.slice(0, 6);
    const leastUsedWords = sortedArray.slice(-6, sortedArray.length);

    //change the dom by viewing the most/least used words
    manipulateDOM(mostUsedWordsEl, mostUsedWords);
    manipulateDOM(leastUsedWordsEl, leastUsedWords);
    docLength.textContent = `Document Length: ${text.length}`;
    wordCount.textContent = `Words Count: ${wordsArray.length}`;
}

//convert wordsDictionary to an array & sort it by the word count
function sortArray(obj) {
    //Object.entries will return the object values as arrays
    let unSortedWordsArray = Object.entries(obj);
    unSortedWordsArray.sort(function (first, second) {
        return second[1] - first[1];
    });

    return unSortedWordsArray;
}

//search the text file and mark every single word that matches the search value
function searchWord() {
    const keyword = document.getElementById('keyword').value;
    if (currentBook == '' || keyword == '') {
        return;
    }

    //get all the elements with id markme and change it to its innerHTML (removing the spans)
    const marks = document.querySelectorAll('#markme');
    if (marks.length != 0) {
        marks.forEach((el) => {
            el.outerHTML = el.innerHTML;
        });
    }

    const re = new RegExp(keyword, 'gi');
    const newFileContent = fileContent.innerHTML.replaceAll(re, '<span id="markme" style="background:yellow;color:red">$&</span>');
    fileContent.innerHTML = newFileContent;
    const marksCount = document.querySelectorAll('#markme').length;
    searchStat.textContent = `found: ${marksCount} times`;
    if (marksCount > 0) {
        //scroll to the first span with the id markme
        document.getElementById('markme').scrollIntoView();
    }
}

//changing the dom
function manipulateDOM(element, items) {
    element.innerHTML = '';
    items.forEach((item) => {
        const itemLi = document.createElement('li');
        itemLi.textContent = `${item[0]}: used ${item[1]} time(s)`
        element.appendChild(itemLi);
    })
}