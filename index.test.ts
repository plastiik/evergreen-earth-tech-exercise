import QuoteService from './src/services/quoteService';
import HousesService from './src/services/housesService';

// Mock the services
jest.mock('./src/services/quoteService');
jest.mock('./src/services/housesService');

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Main Application', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should process and display quotes for all houses', async () => {
        const mockHouses = [
            { submissionId: 'house1' },
            { submissionId: 'house2' }
        ];
        const mockQuotes = [
            'Quote for house1',
            'Quote for house2'
        ];

        // Setup mocks
        (HousesService.getAllHouses as jest.Mock).mockReturnValue(mockHouses);
        (QuoteService.calculateQuoteForHouse as jest.Mock)
            .mockResolvedValueOnce(mockQuotes[0])
            .mockResolvedValueOnce(mockQuotes[1]);

        // Import and run main
        const { main } = await import('./index');
        await main();

        expect(HousesService.getAllHouses).toHaveBeenCalledTimes(1);
        expect(QuoteService.calculateQuoteForHouse).toHaveBeenCalledTimes(2);
        expect(QuoteService.calculateQuoteForHouse).toHaveBeenCalledWith(mockHouses[0]);
        expect(QuoteService.calculateQuoteForHouse).toHaveBeenCalledWith(mockHouses[1]);

        expect(mockConsoleLog).toHaveBeenCalledWith('Calculating quotes for all houses...\n');
        expect(mockConsoleLog).toHaveBeenCalledWith(mockQuotes[0]);
        expect(mockConsoleLog).toHaveBeenCalledWith('\n');
        expect(mockConsoleLog).toHaveBeenCalledWith(mockQuotes[1]);
    });

    it('should handle case when no valid quotes are generated', async () => {
        const mockHouses = [
            { submissionId: 'house1' },
            { submissionId: 'house2' }
        ];

        (HousesService.getAllHouses as jest.Mock).mockReturnValue(mockHouses);
        (QuoteService.calculateQuoteForHouse as jest.Mock)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        const { main } = await import('./index');
        await main();

        expect(mockConsoleLog).toHaveBeenCalledWith('Calculating quotes for all houses...\n');
        expect(mockConsoleLog).toHaveBeenCalledWith('No valid quotes could be generated.');
    });

    it('should handle service errors gracefully', async () => {
        const error = new Error('Service error');
        (HousesService.getAllHouses as jest.Mock).mockImplementation(() => {
            throw error;
        });

        const { main } = await import('./index');
        await main();

        expect(mockConsoleError).toHaveBeenCalledWith('Error generating quotes:', error);
    });

    it('should handle fatal errors in the main function', async () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation();
        const error = new Error('Fatal error');
        
        (HousesService.getAllHouses as jest.Mock).mockImplementation(() => {
            throw error;
        });

        const { main } = await import('./index');
        await main().catch(err => {
            expect(mockConsoleError).toHaveBeenCalledWith('Fatal error:', err);
            expect(mockExit).toHaveBeenCalledWith(1);
        });

        mockExit.mockRestore();
    });
});
