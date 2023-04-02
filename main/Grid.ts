import {Locator} from "@playwright/test";
import * as fs from "fs";

export class Grid {
    private grid: Locator
    private keyboard: Locator

    private wordLength: number
    private words: Array<string>

    private round: number = 0;
    private lastWord: string
    private firstWord: string

    private gridState
    private globalBan = []
    private globalYellow = []

    constructor(gridBloc: Locator, keyboardBloc: Locator) {
        this.grid = gridBloc
        this.keyboard = keyboardBloc
    }

    // Init and first word
    public async getWord(): Promise<string> {
        // Init
        this.wordLength = await this.grid.locator('.grid-cell').count() / 6
        const firstLetter: string = (await this.grid.locator('.cell-content').allTextContents())[0]
        this.gridState = new Array(this.wordLength)
        for(let i=0; i < this.wordLength; i++){
            this.gridState[i] = {banned: [], red: ""}
        }

        this.words = this.getAllWords(firstLetter)
        this.lastWord = this.bestWord()
        this.firstWord = this.lastWord
        return this.lastWord
    }

    public async getNewWord(){
        // Scrap last word
        for(let i=0; i < this.wordLength; i++){
            const letter = this.lastWord.split('')[i]
            const result = (await this.grid.locator('.cell-content').nth(i + this.round * this.wordLength).getAttribute('class')).split(' ').splice(1,1)[0]
            if(result != 'r') this.gridState[i].banned.push(letter)
            if(result == 'y') this.globalYellow.push(letter)
            if(result == 'r') this.gridState[i].red = letter
        }

        // Scrap keyboard
        await this.scrapKeyboard()

        this.lastWord = this.filteredWord()
        this.round++
        return this.lastWord
    }

    public async isWin(): Promise<boolean> {
        let buffer = 0
        for(let i=0; i < this.wordLength; i++){
            if((await this.grid.locator('.cell-content').nth(this.wordLength * this.round + i).getAttribute('class')).split(' ').splice(1,1)[0] != 'r') buffer++
        }
        return buffer == 0
    }

    public logger(){ //todo: DELETE
        console.log(this.lastWord)
    }

    // Check if the tested word is in the tusmo game list
    public getValid() {
        if(this.words[1] != undefined){
            this.lastWord = this.words[1]
            return this.words[1]
        }
        return this.firstWord
    }

    // Find a new word with contraints
    private filteredWord(): string{
        // Clean every word who includes banned letter
        let buffer = []
        for(let i = 0; i < this.words.length; i++){ //todo: clean code foreach
            if(!this.globalBan.some(letter => this.words[i].includes(letter))) buffer.push(this.words[i])
        }
        this.words = buffer

        // Scan each letter
        buffer = []
        this.words.forEach((word) =>{
            let wordBuffer = 0
            this.gridState.forEach((state, j) =>{
                if(state.red != "" && word[j] != state.red) wordBuffer++
                if(state.banned.some(letter => word[j].includes(letter))) wordBuffer++
            })
            if(wordBuffer == 0) buffer.push(word)
        })
        this.words = buffer

        // Scan yellow letters
        buffer = []
        this.words.forEach((word)=>{
            let wordBuffer = 0
            this.globalYellow.forEach((letter) => {
                if(!word.includes(letter)) wordBuffer++
            })
            if(wordBuffer == 0) buffer.push(word)
        })
        this.words = buffer

        return this.words[0] == undefined ? this.firstWord : this.words[0]
    }

    // Find all banned letters from keyboard
    private async scrapKeyboard(){
        const keyOrder = 'azertyuiopqsdfghjklm#wxcvbn#'
        for(let i=0; i < 28; i++){
            const key = await this.keyboard.locator('.key[data-v-6ed99f25]').nth(i).getAttribute('class')
            if(key == "key disabled") this.globalBan.push(keyOrder[i])
        }
    }

    // Return all words filtered by first letter and word length
    private getAllWords(firstLetter: string): Array<string> {
        return fs.readFileSync('main/words2.txt', 'utf-8').split('#').filter(word => word.length == this.wordLength && word.split('')[0] == firstLetter.toLowerCase())
    }

    // Return best word from words array (each: vowels +2, unique consonants +1 => score)
    private bestWord(): string{
        const sortedArray = []
        for(const word of this.words){
            const vowels: number = word.split('').filter(letter => 'aeiouy'.includes(letter)).length
            const consonants: number = Array.from(new Set(word)).filter(letter => !'aeiouy'.includes(letter)).length
            const score: number = (vowels * 2) + consonants
            sortedArray.push({score, word})
        }
        sortedArray.sort((a, b) => b.score - a.score)
        return sortedArray[0].word
    }
}