interface CompanyLogoProps {
  companyName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const COMPANY_LOGOS: Record<string, string> = {
  "google": "https://www.gstatic.com/images/branding/product/2x/docs2022q4-48.png",
  "amazon": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  "microsoft": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282019%29.svg",
  "meta": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
  "facebook": "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_logo_2023.svg",
  "apple": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  "netflix": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
  "adobe": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_Rainbow_icon.svg",
  "oracle": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Cimo_2016_Oracle_logo.svg",
  "salesforce": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce_logo.svg",
  "ibm": "https://upload.wikimedia.org/wikipedia/commons/2/24/IBM_logo.svg",
  "flipkart": "https://upload.wikimedia.org/wikipedia/commons/7/75/Flipkart_logo.svg",
  "myntra": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Myntra_logo.svg",
  "paytm": "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_logo.svg",
  "razorpay": "https://upload.wikimedia.org/wikipedia/commons/2/29/Razorpay_logo.svg",
  "zomato": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Zomato_logo.svg",
  "swiggy": "https://upload.wikimedia.org/wikipedia/commons/1/15/Swiggy_logo.svg",
  "accenture": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Accenture_logo.svg",
  "wipro": "https://upload.wikimedia.org/wikipedia/commons/4/48/Wipro_Logo.svg",
  "tcs": "https://upload.wikimedia.org/wikipedia/commons/c/c2/TCS_Logo.svg",
  "infosys": "https://upload.wikimedia.org/wikipedia/commons/9/99/Infosys_logo.svg",
  "cognizant": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Cognizant_Logo.svg",
  "tech mahindra": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Tech_Mahindra_logo.svg",
  "capgemini": "https://upload.wikimedia.org/wikipedia/commons/4/46/Capgemini_logo.svg",
  "samsung": "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_logo.svg",
  "goldman sachs": "https://upload.wikimedia.org/wikipedia/commons/6/68/Goldman_Sachs_logo.svg",
  "morgan stanley": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Morgan_Stanley_logo.svg",
  "jpmorgan": "https://upload.wikimedia.org/wikipedia/commons/5/59/JP_Morgan_Chase_logo.svg",
  "j p morgan": "https://upload.wikimedia.org/wikipedia/commons/5/59/JP_Morgan_Chase_logo.svg",
  "fidelity": "https://upload.wikimedia.org/wikipedia/commons/f/f4/Fidelity_Investments_logo.svg",
  "amd": "https://upload.wikimedia.org/wikipedia/commons/a/a4/AMD_logo.svg",
  "nvidia": "https://upload.wikimedia.org/wikipedia/commons/2/21/NVIDIA_logo.svg",
  "intel": "https://upload.wikimedia.org/wikipedia/commons/1/1f/Intel_logo.svg",
  "qualcomm": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Qualcomm_logo.svg",
  "texas instruments": "https://upload.wikimedia.org/wikipedia/e/e8/Texas_Instruments_Logo.svg",
  "ti": "https://upload.wikimedia.org/wikipedia/e/e8/Texas_Instruments_Logo.svg",
  "cisco": "https://upload.wikimedia.org/wikipedia/commons/6/60/Cisco_Systems-Logo.svg",
  "uber": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Uber_logo.svg",
  "airbnb": "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo.svg",
  "linkedin": "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo.svg",
  "twitter": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
  "zoom": "https://upload.wikimedia.org/wikipedia/commons/5/57/Zoom_Communications_Logo.svg",
  "atlassian": "https://upload.wikimedia.org/wikipedia/commons/3/33/Atlassian_logo.svg",
  "notion": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Notion-logo.svg",
  "canva": "https://upload.wikimedia.org/wikipedia/commons/0/05/Canva_logo.svg",
  "walmart": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
  "disney": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Disney_Plus_Logo.svg",
};

const COMPANY_COLORS: Record<string, string> = {
  "google": "#4285F4",
  "amazon": "#FF9900",
  "microsoft": "#00A4EF",
  "meta": "#0668E1",
  "apple": "#A2AAAD",
  "netflix": "#E50914",
  "adobe": "#FF0000",
  "oracle": "#F80000",
  "salesforce": "#00A1E0",
  "ibm": "#052FAD",
  "flipkart": "#2874F0",
  "myntra": "#E0115F",
  "paytm": "#00BAF2",
  "razorpay": "#3399FE",
  "zomato": "#CB202D",
  "swiggy": "#F48E35",
  "accenture": "#A100FF",
  "wipro": "#00C7C7",
  "tcs": "#1B4F72",
  "infosys": "#476DE1",
  "cognizant": "#DD3C26",
  "samsung": "#1428A0",
  "goldman sachs": "#00C4C4",
  "morgan stanley": "#00A0DC",
  "jpmorgan": "#0A5C97",
  "amd": "#ED1C24",
  "nvidia": "#76B900",
  "intel": "#0071C5",
  "cisco": "#1E4991",
  "texas instruments": "#00A0DC",
  "ti": "#00A0DC",
};

const sizeClasses = {
  "sm": "w-8 h-8",
  "md": "w-10 h-10",
  "lg": "w-12 h-12",
};

export default function CompanyLogo({ companyName, className = "", size = "md" }: CompanyLogoProps) {
  const normalizedName = companyName.toLowerCase().trim();
  const logoUrl = COMPANY_LOGOS[normalizedName];
  
  const fallbackColor = COMPANY_COLORS[normalizedName] || "#6B7280";
  
  if (logoUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg overflow-hidden flex-shrink-0 ${className}`}
        style={{ backgroundColor: '#ffffff' }}
      >
        <img
          src={logoUrl}
          alt={companyName}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }
  
  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm ${className}`}
      style={{ backgroundColor: fallbackColor, color: '#ffffff' }}
    >
      {companyName.charAt(0).toUpperCase()}
    </div>
  );
}

export { COMPANY_LOGOS, COMPANY_COLORS };