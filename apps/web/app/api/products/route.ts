"use server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch products from the admin panel API
    // This uses the admin panel's public API endpoint for products
    const adminPanelBaseUrl = process.env.ADMIN_PANEL_URL || "http://localhost:3001";
    
    // Make request to admin panel - this should be publicly accessible
    // The admin panel should have a public endpoint for published products
    const response = await fetch(`${adminPanelBaseUrl}/api/products?published=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data
    });
    
    if (!response.ok) {
      // If admin panel is not available or returns an error
      // Return a fallback error response
      console.error("Admin panel API error:", response.status, response.statusText);
      
      return NextResponse.json(
        { error: "Unable to fetch products from admin panel" },
        { status: 502 }
      );
    }
    
    const data = await response.json();
    
    // Filter to ensure only published products are returned
    const publishedProducts = data.filter((product: any) => 
      product.published === true || !product.hasOwnProperty("published")
    );
    
    return NextResponse.json(publishedProducts);
  } catch (error) {
    console.error("Error fetching products from admin panel:", error);
    
    return NextResponse.json(
      { error: "Internal server error while fetching products" },
      { status: 500 }
    );
  }
}