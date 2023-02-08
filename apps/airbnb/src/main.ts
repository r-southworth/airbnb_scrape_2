import { chromium } from 'playwright'

//create an empty list of listing results
var listings: string [] = []

async () => {
    const browser = await chromium.launch();
  const page = await browser.newPage();
  //go to airbnb site
  await page.goto('https://www.airbnb.com/');

  //close a popup if it happens to come up
  page.getByRole('button', { name: 'Close' }).click();

  //ask for search area
  //const searchArea = 

  await page.getByRole('button', { name: 'Location Anywhere' }).click();
  await page.getByTestId('structured-search-input-field-query').click();
  await page.getByTestId('structured-search-input-field-query').fill('Costa Rica');
  await page.getByTestId('option-0').getByText('Costa Rica').click();
  await page.getByTestId('structured-search-input-search-button').click();
  await page.waitForLoadState('networkidle');

  //find the first image on the page (used to check if page has loaded)
  const listingimage = page.locator('._6tbg2q');

  //create an empty list of listing results
  //const listings: string [] = []

  //find the total number of pages from search results
  const totalPages = await page.locator('a._833p2h').last().textContent();
  var numTotalPages: number
  
  if (totalPages == null){
    numTotalPages = 1;
  } else {
    numTotalPages = +totalPages
  }

  //On each page of search results take the id of each listing and add it to our listings variable
  for (let i=0; i<numTotalPages; i++) {
    await page.waitForSelector('._6tbg2q');
    // await listingimage.first().toBeVisible();
    const newlistings = await page.$$eval('.cy5jw6o.dir.dir-ltr', all_items => {
      const data: any [] = [];
      all_items.forEach(listing =>{
        const id = listing.querySelector('.t1jojoys.dir.dir-ltr')?.id;
        data.push(id);
      });
      return data;
    });
    listings.push(...newlistings);

    //check if we are on the last page, if not go to next page
    if (i != (numTotalPages-1)){
    await page.getByRole('link', {name: 'Next'}).click();
    } 
  }

console.log(listings[listings.length-1]);
var scores: string []
var location: string
var title: string
var listingInfo: string
var allListingsInfo: string [] = []


async function goToPage (id: string) {
  const url = 'https://www.airbnb.com/rooms/' + id;
  //const listingPagePromise = context.waitForEvent('page');
  const browser = await chromium.launch();
  const newContext = await browser.newContext();
  const listingPage = await newContext.newPage();
  await listingPage.goto(url);
  for (let i=0; i<10; i++){
    listingPage.getByRole('button', { name: 'Close' }).click();
    await listingPage.waitForLoadState('networkidle');
    scores = await listingPage.locator('._4oybiu').allInnerTexts();
    const locationRaw = await (await listingPage.locator('._9xiloll').innerText());
    location = '"' + locationRaw + '"';
    const titleRaw = await listingPage.locator('h1').innerText();
    title = '"' + titleRaw + '"'
    listingInfo = `${id}, ${title} , ${location}`
    for (const x of scores){
      listingInfo += `, ${x}`;
    }
    console.log(i);
    if (listingInfo != undefined){
      allListingsInfo.push(listingInfo)
      break;
    };
  };
  console.log(allListingsInfo);
  await newContext.close();
}

// just for testing a single page
// const testListing = listings[0];
// const listingId = testListing.substring(6);
// await goToPage(listingId);


//testing fewer pages
for (let k = 0; k<10; k++){
  const testListing = listings[k];
  const listingId = testListing.substring(6);
  console.log(listingId);
  await goToPage(listingId);
  console.log(k);
};

// Add back for iterating over all the pages
// listings.forEach(listing => {
//   const id = listing.substring(6);
//   goToPage(id);
// });

};