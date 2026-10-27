import { Manrope, Yatra_One } from "next/font/google";

// next/font downloads these at build time and serves them from our own origin.
export const yatraOne = Yatra_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-yatra-one",
});

export const manrope = Manrope({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});
