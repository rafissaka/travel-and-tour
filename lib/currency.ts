// Currency Conversion Helper
// Handles USD to GHS conversion for flight and hotel pricing

/**
 * Get current USD to GHS exchange rate
 * Uses Exchange Rate API or falls back to cached rate
 */
export async function getExchangeRate(): Promise<number> {
  try {
    // Try to fetch from Exchange Rate API
    if (process.env.EXCHANGE_RATE_API_KEY) {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.conversion_rates?.GHS) {
          return data.conversion_rates.GHS;
        }
      }
    }

    // Fallback to Bank of Ghana approximate rate
    // Update this manually or fetch from Bank of Ghana API
    return 12.5; // Default rate (update regularly)
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 12.5; // Fallback rate
  }
}

/**
 * Convert USD to GHS
 */
export function convertUSDtoGHS(usdAmount: number, exchangeRate: number): number {
  return usdAmount * exchangeRate;
}

/**
 * Calculate service fee (10% markup)
 */
export function calculateServiceFee(amount: number): number {
  return amount * 0.10;
}

/**
 * Calculate total amount with service fee
 */
export function calculateTotalAmount(baseAmount: number, serviceFee: number): number {
  return baseAmount + serviceFee;
}

/**
 * Calculate package discount (5% discount for booking flight + hotel together)
 */
export function calculatePackageDiscount(flightTotal: number, hotelTotal: number): number {
  const combinedTotal = flightTotal + hotelTotal;
  return combinedTotal * 0.05; // 5% discount
}

/**
 * Format price in Ghana Cedis
 */
export function formatGHS(amount: number): string {
  return `GH₵ ${amount.toFixed(2)}`;
}

/**
 * Complete pricing calculation for a reservation
 * Converts USD to GHS and adds 10% service fee
 */
export interface PricingCalculation {
  basePriceUSD: number;
  basePriceGHS: number;
  serviceFee: number;
  totalAmount: number;
  exchangeRate: number;
}

export async function calculateReservationPricing(
  basePriceUSD: number
): Promise<PricingCalculation> {
  const exchangeRate = await getExchangeRate();
  const basePriceGHS = convertUSDtoGHS(basePriceUSD, exchangeRate);
  const serviceFee = calculateServiceFee(basePriceGHS);
  const totalAmount = calculateTotalAmount(basePriceGHS, serviceFee);

  return {
    basePriceUSD,
    basePriceGHS,
    serviceFee,
    totalAmount,
    exchangeRate,
  };
}

/**
 * Calculate pricing for a package (flight + hotel) with bundle discount
 */
export interface PackagePricingCalculation extends PricingCalculation {
  packageDiscount: number;
  finalTotal: number;
}

export async function calculatePackagePricing(
  flightPriceUSD: number,
  hotelPriceUSD: number
): Promise<PackagePricingCalculation> {
  const exchangeRate = await getExchangeRate();

  // Convert both to GHS
  const flightGHS = convertUSDtoGHS(flightPriceUSD, exchangeRate);
  const hotelGHS = convertUSDtoGHS(hotelPriceUSD, exchangeRate);

  // Calculate base total
  const basePriceGHS = flightGHS + hotelGHS;
  const basePriceUSD = flightPriceUSD + hotelPriceUSD;

  // Add service fee
  const serviceFee = calculateServiceFee(basePriceGHS);
  const totalBeforeDiscount = calculateTotalAmount(basePriceGHS, serviceFee);

  // Apply package discount (5%)
  const packageDiscount = calculatePackageDiscount(flightGHS, hotelGHS);
  const finalTotal = totalBeforeDiscount - packageDiscount;

  return {
    basePriceUSD,
    basePriceGHS,
    serviceFee,
    totalAmount: totalBeforeDiscount,
    exchangeRate,
    packageDiscount,
    finalTotal,
  };
}

/**
 * Convert Paystack amount to pesewas (smallest currency unit)
 * Paystack requires amount in pesewas (1 GHS = 100 pesewas)
 */
export function convertToPesewas(ghsAmount: number): number {
  return Math.round(ghsAmount * 100);
}

/**
 * Convert pesewas back to GHS
 */
export function convertFromPesewas(pesewas: number): number {
  return pesewas / 100;
}
