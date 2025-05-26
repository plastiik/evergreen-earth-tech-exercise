## Overview

The idea of the exercise is to solve the following problem, we don't expect it to take longer than two hours and all the data/tools should be available. Things we're looking for are:

 - Tests, either TDD or test-after
 - Easy to read, maintainable code
 - Frequent git commits

 We're **not** looking for a UI! You can use either plain JavaScript or TypeScript.

## Project Setup

1. Clone the repository or Fork it :)
2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

4. Run tests:
```bash
npm test
```

## Services Architecture

The project is organized into several services, each handling specific functionality:

### HousesService
- Calculates heat loss for properties using floor area, heating factor, and insulation factor
- Calculates power heat loss using weather data
- Manages house data and calculations
- Located in `src/services/housesService.ts`

### WeatherDataService
- Interfaces with the external Weather Data API
- Retrieves heating degree days for given locations
- Handles API and error responses
- Located in `src/services/weatherDataService.ts`

### HeatPumpService
- Manages heat pump data and selection
- Located in `src/services/heatPumpService.ts`

### QuoteService
- Orchestrates the quote generation process
- Matches appropriate heat pumps to properties based on power requirements
- Handles cost calculations for installations
- Combines data from other services to generate complete quotes
- Handles formatting and presentation of quote information
- Located in `src/services/quoteService.ts`

## Problem

A recently implemented data collection form provides an array of customer submitted housing details, you are implementing the processing which will take each house in the provided json and provide an output summary to be used in providing the customer the quote. The output should be in the form, list each house separately, with the correct values populated:

```
--------------------------------------
<Submission ID>
--------------------------------------
  Estimated Heat Loss = 
  Design Region = 
  Power Heat Loss = 
  Recommended Heat Pump = 
  Cost Breakdown
    <label>, <cost>
    <label>, <cost>
    ...
  Total Cost, including VAT = 
```

The provided API was built by a third party and somewhat strange behaviour has been reported in some cases - we are assured this will not be a problem in production. Additionally, some regions are not yet supported by the API, if the designRegion cannot be found by the API (it should return a 404 in this case), then the following output is expected, and further calculations should not be attempted.

```
--------------------------------------
<Submission ID>
--------------------------------------
  Heating Loss: 29710.8
  Warning: Could not find design region
```

## Steps

1. Calculate the heat loss for each property. Heat loss can be calculated using the following formula:

        floorArea (m^2) * heatingFactor * insulationFactor = heat loss (kWh)

2. Using weather data from the API and the property's design region, calculate the power heat loss of the property using the total heat loss calculated and the returned heating degree days:
        
        heat loss (kWh) / heating degree days = Power heat loss (kW)

3. Using the data in the heatPumpData.json file match a heat pump to the property using the property's calculated power heat loss and each heat pump's output capacity. Calculate the total cost for the heat pump installation - total costs should include 5% VAT.
    *Note: the Heat Pump should **not be undersized**.*


## Weather Data API

An API is available to retrieve the heating degree days for a given location (`designRegion` in the houses.json file):
```
https://063qqrtqth.execute-api.eu-west-2.amazonaws.com/v1/weather?location=<location>
```

You will need to provide the following API Authentication key as a header:
```
x-api-key = f661f74e-20a7-4e9f-acfc-041cfb846505
```

Example response:

```json
{
    "location": {
        "location": "Borders (Boulmer)",
        "degreeDays": "2483",
        "groundTemp": "9",
        "postcode": "NE66",
        "lat": "55.424",
        "lng": "-1.583"
    }
}
```

## Development

### Running in Development Mode
To run the application in development mode with automatic reloading:
```bash
npm run dev
```

### Testing
The project uses Jest for testing. To run tests with coverage:
```bash
npm run test:coverage
```

### Project Structure
```
.
├── src/
│   ├── config/            # Config files
│   ├── services/          # Core services
│   ├── types/             # TypeScript type definitions
│   └── data/              # JSON data files
└── index.ts              # Application entry point
```
