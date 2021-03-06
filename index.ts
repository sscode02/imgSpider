import { createWriteStream, write, writeFile } from "fs";

const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const https = require('https');

(async () => {
  const browser = await puppeteer.launch({
    // slowMo: 500,
    devtools: true
  })
  //open page
  const page = await browser.newPage()
  await page.goto('https://image.baidu.com/')
  await page.focus('#kw')
  await page.keyboard.sendCharacter('奥特曼')
  await page.click('.s_newBtn')
  await page.waitForNavigation()
  //get images 
  const sources = await page.evaluate(() => {
    const images = document.querySelectorAll('.main_img')
    const arr = Array.prototype.slice.call(images)
    return arr.map(item => { return item['src'] })
  })
  // call write file function
  for (let src of sources) {
    scrToImg(src, path.resolve(__dirname, 'img'))

  }
  console.log('全部完成');
  browser.close()
})()

//if url or base64
const scrToImg = (src, dir) => {
  if (/.(jpg|png|gif)$/.test(src)) {
    urlToImg(src, dir)
  } else {
    base64ToImg(src, dir)
  }
}

const urlToImg = (src, dir) => {
  const mod = /^https:/.test(src) ? https : http //if http or https
  const ext = path.extname(src)
  const str = Date.now() + ext
  const file = path.join(dir, str)
  mod.get(src, res => {
    res.pipe(createWriteStream(file))
      .on('finish', () => {
        console.log('URL 写入成功')
      })
  })


}
const base64ToImg = (src, dir) => {
  // base64 head: 'data:image/jpeg;base64
  const matches = src.match(/^data:(.+);base64,(.+)$/)
  matches[1].split('/')[1].replace('jpeg', 'jpg')
  try {
    const ext = matches[1].split('/')[1].replace('jpeg', '.jpg')
    const str = Date.now() + ext
    const file = path.join(dir, str)
    writeFile(file, matches[2], 'base64', (err) => {
      console.log('base 64 写入成功')
    })
  } catch (e) {
    console.log(e)
  }
}
