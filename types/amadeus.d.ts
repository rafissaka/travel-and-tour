declare module 'amadeus' {
  /**
   * Minimal TypeScript declarations for the `amadeus` npm package as used
   * by this project. These are intentionally permissive but provide enough
   * typings to avoid implicit `any` and to type the common methods used.
   *
   * NOTE: This is not a complete typing of the Amadeus SDK; extend as needed.
   */

  export interface AmadeusOptions {
    clientId?: string;
    clientSecret?: string;
    hostname?: string;
    // allow other fields that some versions may accept
    [key: string]: any;
  }

  // Generic response shape returned by the Amadeus SDK methods used here
  export interface AmadeusResponse<T = any> {
    data?: T;
    // Some SDK operations include a `result` wrapper with `meta` information
    result?: {
      meta?: any;
      [key: string]: any;
    };
    // other fields e.g. status, headers may exist
    [key: string]: any;
  }

  // Minimal client class and nested objects used by the application
  export class Amadeus {
    constructor(options?: AmadeusOptions);

    // Shopping endpoints (flight & hotel search / pricing)
    shopping: {
      flightOffersSearch: {
        get(params?: any): Promise<AmadeusResponse<any>>;
      };
      flightOffers: {
        pricing: {
          post(body?: any): Promise<AmadeusResponse<any>>;
        };
      };
      hotelOffersSearch: {
        get(params?: any): Promise<AmadeusResponse<any>>;
      };
    };

    // Reference data (locations, hotels)
    referenceData: {
      locations: {
        get(params?: any): Promise<AmadeusResponse<any>>;
        hotels: {
          byCity: {
            get(params?: any): Promise<AmadeusResponse<any>>;
          };
        };
      };
    };

    // allow access to any other undocumented parts of the library without TS errors
    [key: string]: any;
  }

  export default Amadeus;
}