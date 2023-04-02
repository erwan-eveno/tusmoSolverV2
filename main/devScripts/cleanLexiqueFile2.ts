import * as fs from "fs";

/*
Clean lexique file by suppresing useless words, accents, ...
start command : npx ts-node .\main\devScripts\cleanLexiqueFile2.ts
 */

// Delete actual words2 file
fs.unlink('./main/words2.txt', (err) => {
    if(err) throw err
    console.log('☑ Correctly deleting!')
})

const lines: Array<string> = fs.readFileSync('main/gutenberg.txt', 'utf-8').split('\n').splice(1)
const cleanArray: Array<string> = []
const bannedChar = ['-', '.', "'"]

const removeAccent = (word: string): string => {
    return word.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
}

// Filter word and add to array
for(const line of lines){
    if(line.length > 1 && !bannedChar.some(char => line.includes(char))){
        cleanArray.push(removeAccent(line))
    }
}

// Create txt file
const fileContent: string = Array.from(new Set(cleanArray)).join('#')
fs.appendFile('./main/words2.txt', fileContent, (err)=>{
    if(err) throw err
    console.log('☑ Correctly reformatting!')
})