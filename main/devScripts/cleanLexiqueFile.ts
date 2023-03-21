import * as fs from "fs";

/*
Clean lexique file by suppresing useless words, accents, ...
start command : npx ts-node .\main\devScripts\cleanLexiqueFile.ts
 */

// Delete actual words file
fs.unlink('./main/words.txt', (err) => {
    if(err) throw err
    console.log('☑ Correctly deleting!')
})

const lines: Array<string> = fs.readFileSync('main/lexique.tsv', 'utf-8').split('\n').splice(1)
const cleanArray: Array<string> = []
const bannedChar = ['-', '.', "'"]

const removeAccent = (word: string): string => {
    return word.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
}

// Filter word and add to array
for(const line of lines){
    let word: string = ((line.split('\t'))[0].split(' '))[0]
    if(word.length > 1 && !bannedChar.some(char => word.includes(char))){
        cleanArray.push(removeAccent(word))
    }
}

// Create txt file
const fileContent: string = Array.from(new Set(cleanArray)).join('#')
fs.appendFile('./main/words.txt', fileContent, (err)=>{
    if(err) throw err
    console.log('☑ Correctly reformatting!')
})