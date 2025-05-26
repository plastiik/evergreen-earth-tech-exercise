import QuoteService from './src/services/quoteService';
import HousesService from './src/services/housesService';

async function main() {
    try {
        console.log('Calculating quotes for all houses...\n');
        const houses = HousesService.getAllHouses();
        const quotes = await Promise.all(houses.map(
            house => QuoteService.calculateQuoteForHouse(house)
        ));
        const validQuotes = quotes.filter((quote): quote is string => quote !== null);
        
        if (validQuotes.length === 0) {
            console.log('No valid quotes could be generated.');
            return;
        }

        validQuotes.forEach((quote, index) => {
            console.log(quote);
            if (index < validQuotes.length - 1) {
                // Add extra line between quotes, but not after the last one
                console.log('\n');
            }
        });
    } catch (error) {
        console.error('Error generating quotes:', error);
    }
}

// Run the main function
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});