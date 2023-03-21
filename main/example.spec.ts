import {test, expect, Locator} from '@playwright/test';
import {Grid} from "./Grid";

test.only('Main test', async({page}) => {
  // Home page
  await page.goto('http://www.tusmo.xyz/');
  await page.getByAltText('en').click()
  await page.getByAltText('FR').click()
  await page.locator('text=Solo').click();

  // Solo page
  while(true){
    await page.waitForSelector('.motus-grid')
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

    while(!await grid.isWin()){
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
      grid.logger()
      // Check if the game is lost
      if(await page.getByText('C\'est perdu !').isVisible()) console.log("perdu!!!!!")
      await page.waitForTimeout(300)
    }

    await page.waitForTimeout(2000)
  }

  await page.pause()
})
