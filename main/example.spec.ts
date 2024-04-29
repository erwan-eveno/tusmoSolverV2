import {test, expect, Locator} from '@playwright/test';
import {Grid} from "./Grid";
import * as fs from "fs";

test.only('Main test', async({page}) => {
  // Home page
  await page.goto('http://www.tusmo.xyz/');
  await page.getByAltText('en').click()
  await page.getByAltText('FR').click()
  await page.locator('text=Solo').click();

  // Solo page
  while(true){
    console.log("2")
    await page.waitForSelector('.motus-grid')
    console.log("3")
    const gridBloc: Locator = await page.locator('.motus-grid').last()
    const keyboardBloc: Locator = await page.locator('.keyboard')
    const grid = new Grid(gridBloc, keyboardBloc)
    const word = await grid.getWord()
    await page.keyboard.type(word)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    // Check if the word exist
    const validValue = await page.getByText('Ce mot n\'est pas dans la liste !').isVisible()
    if(validValue){
      await page.keyboard.type(grid.getValid())
      await page.keyboard.press('Enter')
    }
    await page.waitForTimeout(500)
    console.log("4")

    while(!await grid.isWin()){
      console.log("5")
      await page.waitForTimeout(300)
      const newWord = await grid.getNewWord()
      await page.keyboard.type(newWord)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)

      // Check if the word exist
      const validValue = await page.getByText('Ce mot n\'est pas dans la liste !').isVisible()
      if(validValue){
        await page.keyboard.type(grid.getValid())
        await page.keyboard.press('Enter')
      }
      await page.waitForTimeout(300)

      // Check if the game is lost and add unknown word to word list
      if(await page.getByText('C\'est perdu !').isVisible()) {
        await addWord(page)
        await page.getByText('MENU').click()
        await page.waitForTimeout(300)
        await page.locator('text=Solo').click();
        grid.setLost()
        console.log("game lossssssssssssssssst")
        await page.waitForTimeout(1000)
      }
    }
    console.log("1")
    await page.waitForTimeout(2000)
  }
})

const addWord = async (page) => {
  const unknownWord = ((await page.locator(':text(\'Le mot était\') + div').allTextContents())[0].trim()).toLowerCase()
  fs.appendFile('./main/addedWords.txt', `#${unknownWord}`, (err)=>{
    if(err) throw err
    console.log(`☑ Word "${unknownWord}" correctly added to added word list!`)
  })
  fs.appendFile('./main/words2.txt', `#${unknownWord}`, (err)=>{
    if(err) throw err
    console.log(`☑ Word "${unknownWord}" correctly added to actual word list!`)
  })
}
